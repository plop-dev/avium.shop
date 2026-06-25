import { Order } from '@/payload-types';
import { APIError, CollectionConfig } from 'payload';
import { adminAccess } from '@/access/elevated';
import { noAccess, selfAccess } from '@/access/anyone';

const MAX_QUANTITY = 50;

export const Orders: CollectionConfig = {
	slug: 'orders',
	labels: {
		singular: 'Order',
		plural: 'Orders',
	},
	admin: {
		useAsTitle: 'name',
		defaultColumns: ['name', 'customer', 'status.currentStatus', 'total', 'createdAt'],
	},
	access: {
		read: selfAccess || adminAccess, // this is fine because the beforeChange hook ensures only the customer can read their own order
		create: () => true,
		update: adminAccess,
		delete: noAccess,
	},
	hooks: {
		beforeChange: [
			async ({ operation, data, req, originalDoc }) => {
				// ensure that customers can only set themselves as the customer on an order
				if (req.user) {
					if (
						data.customer !== req.user.id ||
						!(req.user.role?.includes('admin') || req.user.role?.includes('developer') || req.user.role?.includes('employee'))
					) {
						throw new APIError('Cannot set customer to another user.', 400);
					}
				} else {
					// this shouldn't be reachable with proper authentication/middleware
					console.log('Unauthenticated request trying to create/update an order.');
					throw new APIError('Unauthenticated requests cannot create or modify orders.', 401);
				}

				// make sure the price from products is from the db, not client

				const sourcePrints = Array.isArray(data.prints) && data.prints.length > 0 ? data.prints : originalDoc?.prints || [];

				const normalizedPrints = await Promise.all(
					sourcePrints.map(async (print: any) => {
						const quantity = Number(print.quantity);

						if (!Number.isInteger(quantity) || quantity < 1 || quantity > MAX_QUANTITY) {
							throw new APIError(`Print quantity must be between 1 and ${MAX_QUANTITY}.`, 400);
						}

						if (print.blockType === 'shopProduct') {
							const productId = typeof print.product === 'string' ? print.product : print.product?.id;

							if (!productId) {
								throw new APIError('Shop product prints must include a product.', 400);
							}

							const product = await req.payload.findByID({
								collection: 'products',
								id: productId,
							});

							const price = Number(product?.price);

							if (!Number.isFinite(price) || price <= 0) {
								throw new APIError(`Product price is invalid or missing. Got: ${product?.price}`, 400);
							}

							return {
								...print,
								product: productId,
								quantity,
								price: Math.round(price),
							};
						}

						const quoteId = typeof print.quote === 'string' ? print.quote : print.quote?.id;

						if (!quoteId) {
							throw new APIError('Custom print must include a quote reference.', 400);
						}

						const quote = await req.payload.findByID({
							collection: 'quotes',
							id: quoteId,
						});

						const price = Number(quote.price);

						if (!Number.isFinite(price) || price <= 0) {
							throw new APIError(`Quote price is invalid or missing. Got: ${quote?.price}`, 400);
						}

						return {
							...print,
							quote: quoteId,
							quantity,
							price,
						};
					}),
				);

				data.prints = normalizedPrints;

				// pricing calculation
				const subtotal = normalizedPrints.reduce((sum, print) => sum + (Number(print.price) || 0) * Number(print.quantity || 0), 0);
				const shipping = Number(data.pricing?.shipping ?? originalDoc?.pricing?.shipping) || 300;
				const tax = Number(data.pricing?.tax ?? originalDoc?.pricing?.tax) || 0;
				data.pricing = {
					...data.pricing,
					subtotal,
					shipping,
					tax,
					total: subtotal + shipping + tax,
				};

				// queue priority stuff
				if (operation === 'create') {
					const lastOrder = await req.payload.find({
						collection: 'orders',
						sort: '-queue',
						limit: 1,
					});

					data.queue = lastOrder.docs[0] ? lastOrder.docs[0].queue + 1 : 1;
				}

				return data;
			},
		],
		afterOperation: [
			async ({ operation, req, result }) => {
				if (operation === 'create') {
					// increment the total orders number for each product, if shop products are bought

					if (result.prints.some((print: Order['prints'][number]) => print.blockType === 'shopProduct')) {
						const shopProducts = result.prints.filter((print: Order['prints'][number]) => print.blockType === 'shopProduct');
						for (const print of shopProducts) {
							const productId = typeof print.product === 'string' ? print.product : print.product.id;

							const product = await req.payload.findByID({
								collection: 'products',
								id: productId,
							});

							await req.payload.update({
								collection: 'products',
								id: productId,
								data: {
									orders: (product.orders || 0) + print.quantity,
								},
							});
						}
					}
				}
			},
		],
	},
	timestamps: true,
	fields: [
		{
			name: 'name',
			type: 'text',
			required: true,
			admin: {
				description: 'The name of the order',
			},
		},
		{
			name: 'customer',
			type: 'relationship',
			relationTo: 'users',
			required: true,
			admin: {
				description: 'The user who placed the order',
			},
		},

		// prints
		{
			name: 'prints',
			type: 'blocks',
			required: true,
			minRows: 1,
			labels: { singular: 'Print', plural: 'Prints' },
			blocks: [
				{
					slug: 'shopProduct',
					labels: { singular: 'Shop Product', plural: 'Shop Products' },
					fields: [
						{ name: 'product', type: 'relationship', relationTo: 'products', required: true },
						{ name: 'quantity', type: 'number', required: true, defaultValue: 1, min: 1, max: MAX_QUANTITY },
						{
							name: 'price',
							type: 'number',
							required: true,
							admin: { readOnly: true, description: 'Price fetched from product at order time' },
						},
						{ name: 'completed', type: 'checkbox', defaultValue: false, admin: { description: 'Mark as printed' } },
					],
				},
				{
					slug: 'customPrint',
					labels: { singular: 'Custom Print', plural: 'Custom Prints' },
					fields: [
						{
							name: 'quote',
							type: 'relationship',
							relationTo: 'quotes',
							required: true,
							admin: { readOnly: true, description: 'Reference to the original quote' },
						},
						{
							name: 'model',
							type: 'group',
							admin: { readOnly: true, description: 'The 3D model associated with this item' },
							fields: [
								{ name: 'filename', type: 'text', required: true, admin: { readOnly: true } },
								{
									name: 'filetype',
									type: 'select',
									options: ['stl', '3mf'],
									required: true,
									admin: { readOnly: true },
								},
								{
									name: 'modelUrl',
									type: 'text',
									required: true,
									admin: { readOnly: true, description: 'The unique download URL to the model' },
								},
								{
									name: 'gcodeUrl',
									type: 'text',
									required: true,
									admin: { readOnly: true, description: 'The unique download URL to the G-code file' },
								},
							],
						},
						{
							name: 'printingOptions',
							type: 'group',
							required: true,
							fields: [
								{ name: 'preset', type: 'relationship', relationTo: 'presets' },
								{ name: 'layerHeight', label: 'Layer Height (mm)', type: 'number' },
								{ name: 'infill', label: 'Infill Percentage', type: 'number', min: 0, max: 100 },
								{ name: 'plastic', type: 'text', required: true },
								{ name: 'colour', type: 'text', required: true },
							],
						},
						{
							name: 'time',
							type: 'text',
							admin: { description: 'Estimated print time as returned by the slicer' },
						},
						{
							name: 'filament',
							type: 'number',
							admin: { description: 'Estimated filament usage in grams as returned by the slicer' },
						},
						{ name: 'quantity', type: 'number', required: true, defaultValue: 1, min: 1, max: MAX_QUANTITY },
						{
							name: 'price',
							type: 'number',
							required: true,
							admin: { readOnly: true, description: 'Price fetched from quote at order time' },
						},
						{ name: 'completed', type: 'checkbox', defaultValue: false, admin: { description: 'Mark as printed' } },
					],
				},
			],
		},

		// payment
		{
			name: 'payment',
			type: 'group',
			required: false,
			fields: [
				{
					name: 'provider',
					type: 'text',
					admin: { description: 'Payment provider used for this order' },
				},
				{ name: 'stripeCustomerId', type: 'text', admin: { description: 'Stripe Customer ID' } },
				{ name: 'stripeCheckoutSessionId', type: 'text', admin: { description: 'Stripe Checkout Session ID' } },
				{
					name: 'stripePaymentIntentId',
					type: 'text',
					admin: { description: 'Stripe Payment Intent ID' },
				},
				{
					name: 'stripeChargeId',
					type: 'text',
					admin: { description: 'Stripe Charge ID' },
				},
				{
					name: 'currency',
					type: 'text',
					admin: { description: 'Currency used for this order' },
				},
				{
					name: 'amount',
					type: 'number',
					admin: { description: 'Amount paid' },
				},
				{
					name: 'status',
					type: 'select',
					defaultValue: 'awaiting-payment',
					options: [
						{
							label: 'Awaiting Payment',
							value: 'awaiting-payment',
						},
						{
							label: 'Paid',
							value: 'paid',
						},
						{
							label: 'Failed',
							value: 'failed',
						},
						{
							label: 'Refunded',
							value: 'refunded',
						},
						{
							label: 'Partially Refunded',
							value: 'partially-refunded',
						},
						{
							label: 'Cancelled',
							value: 'cancelled',
						},
					],
				},
				{
					name: 'paidAt',
					type: 'date',
					admin: { description: 'Date and time when the payment was made' },
				},
				{
					name: 'refunded',
					type: 'checkbox',
					admin: { description: 'Whether the payment was refunded' },
				},
				{
					name: 'refundedAmount',
					type: 'number',
					admin: { description: 'Amount refunded' },
				},
				{
					name: 'refundedAt',
					type: 'date',
					admin: { description: 'Date and time when the payment was refunded' },
				},
				{
					name: 'receiptUrl',
					type: 'text',
					admin: { description: 'URL to the payment receipt' },
				},
			],
		},

		// shipping
		{
			name: 'shipping',
			type: 'group',
			required: false,
			fields: [
				{
					name: 'address',
					type: 'textarea',
					admin: { description: 'Shipping address' },
				},
				{
					name: 'shipmentId',
					type: 'text',
					admin: { description: 'Shipment ID' },
				},
				{
					name: 'transactionId',
					type: 'text',
					admin: { description: 'Shipment transaction ID' },
				},
				{
					name: 'carrier',
					type: 'text',
					admin: { description: 'Shipping carrier' },
				},
				{
					name: 'service',
					type: 'text',
					admin: { description: 'Shipping service' },
				},
				{
					name: 'trackingNumber',
					type: 'text',
					admin: { description: 'Tracking number' },
				},
				{
					name: 'trackingUrl',
					type: 'text',
					admin: { description: 'Tracking URL' },
				},
				{
					name: 'labelUrl',
					type: 'text',
					admin: { description: 'Shipping label URL' },
				},
				{
					name: 'labelPurchasedAt',
					type: 'date',
					admin: { description: 'Date and time when the label was purchased' },
				},
				{
					name: 'shippedAt',
					type: 'date',
					admin: { description: 'Date and time when the order was shipped' },
				},
				{
					name: 'deliveredAt',
					type: 'date',
					admin: { description: 'Date and time when the order was delivered' },
				},
			],
		},

		// shipping address
		{
			name: 'shippingAddress',
			type: 'group',
			required: false,
			fields: [
				{
					name: 'fullName',
					type: 'text',
				},
				{
					name: 'company',
					type: 'text',
				},
				{
					name: 'line1',
					type: 'text',
				},
				{
					name: 'line2',
					type: 'text',
				},
				{
					name: 'city',
					type: 'text',
				},
				{
					name: 'county',
					type: 'text',
				},
				{
					name: 'postcode',
					type: 'text',
				},
				{
					name: 'country',
					type: 'text',
				},
				{
					name: 'phone',
					type: 'text',
				},
			],
		},

		// pricing
		{
			name: 'pricing',
			type: 'group',
			required: true,
			admin: {
				description: 'Pricing details for the order. EVERYTHING IN PENCE, ALWAYS.',
			},
			fields: [
				{
					name: 'subtotal',
					type: 'number',
					admin: {
						readOnly: true,
						description:
							'The subtotal of the order in pennies (or smallest equivalent of the currency). Calculated from the prints.',
					},
				},
				{
					name: 'shipping',
					type: 'number',
					defaultValue: 300,
					admin: {
						description: 'The shipping cost of the order. Always 300p.',
					},
				},
				{
					name: 'tax',
					type: 'number',
					defaultValue: 0,
					admin: {
						description: 'The tax of the order. Always £0 since we are not VAT registered, yet.',
					},
				},
				{
					name: 'total',
					type: 'number',
					admin: {
						readOnly: true,
						description: 'Total Price of everything in this field (subtotal + shipping + tax).',
					},
				},
			],
		},

		{
			name: 'queue',
			admin: {
				description: 'The print queue this order is assigned to',
			},
			type: 'number',
			required: true,
			index: true,
		},

		// status
		{
			name: 'status',
			type: 'group',
			label: 'Order Status',
			fields: [
				{
					name: 'statuses',
					type: 'array',
					label: 'Order Status History',
					fields: [
						{
							name: 'stage',
							type: 'select',
							required: true,
							options: [
								{ label: 'In Queue', value: 'in-queue' },
								{ label: 'Printing', value: 'printing' },
								{ label: 'Packaging', value: 'packaging' },
								{ label: 'Shipped', value: 'shipped' },
								{ label: 'Cancelled', value: 'cancelled' },
							],
						},
						{
							name: 'timestamp',
							type: 'date',
							required: true,
							defaultValue: () => new Date().toISOString(),
							admin: {
								date: {
									pickerAppearance: 'dayAndTime',
								},
							},
						},
					],
				},
				{
					name: 'currentStatus',
					type: 'select',
					required: true,
					defaultValue: 'in-queue',
					options: [
						{ label: 'In Queue', value: 'in-queue' },
						{ label: 'Printing', value: 'printing' },
						{ label: 'Packaging', value: 'packaging' },
						{ label: 'Shipped', value: 'shipped' },
						{ label: 'Cancelled', value: 'cancelled' },
					],
					admin: {
						description: 'Current order status - auto-synced from status history',
						readOnly: true,
					},
				},
			],
		},

		{
			name: 'comments',
			type: 'text',
			label: 'Comments',
			admin: {
				description: 'Comments on this order',
			},
		},
	],
};
