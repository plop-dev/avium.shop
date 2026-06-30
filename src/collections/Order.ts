import { Order } from '@/payload-types';
import { APIError, CollectionConfig } from 'payload';
import { adminAccess } from '@/access/elevated';
import { noAccess, selfAccessOrders } from '@/access/anyone';

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
		read: selfAccessOrders || adminAccess,
		create: () => true,
		// update: selfAccessOrders || adminAccess,
		update: () => true,
		delete: noAccess,
	},
	hooks: {
		beforeChange: [
			async ({ operation, data, req, originalDoc }) => {
				// ensure that customers can only set themselves as the customer on an order
				if (req.user && typeof data.customer !== 'undefined') {
					const roles = Array.isArray(req.user.role) ? req.user.role : req.user.role ? [req.user.role] : [];
					const isPrivileged = roles.some(role => ['admin', 'developer', 'employee'].includes(role));

					if (data.customer !== req.user.id && !isPrivileged) {
						throw new APIError('Cannot set customer to another user.', 400);
					}
				}

				// make sure the price from products is from the db, not client
				//* this should only happen if the prices are not set
				//* we cannot keep on trying to update the prices according to quotes/products because:
				//* 1. the quotes will be deleted after the order is created
				//* 2. the quotes will never update in price anyways
				//* 3. the product price shouldn't change, but might, so not updating it will keep the price consistent

				const sourcePrints: Order['prints'] =
					Array.isArray(data.prints) && data.prints.length > 0 ? data.prints : originalDoc?.prints || [];
				let normalizedPrints: Order['prints'] | undefined;

				if (!sourcePrints[0].price) {
					normalizedPrints = await Promise.all(
						sourcePrints.map(async (print: Order['prints'][number]) => {
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
									price: Math.round(price), // the only field actually getting updated
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
								price, // the only field actually getting updated
							};
						}),
					).catch(err => {
						console.error('Error normalizing prints:', err);
						throw new APIError('Failed to normalize prints. ' + (err instanceof Error ? err.message : String(err)), 400);
					});
					data.prints = normalizedPrints;
				}

				// pricing calculation
				const subtotal = (normalizedPrints ?? data.prints).reduce(
					(sum: number, print: Order['prints'][number]) => sum + (Number(print.price) || 0) * Number(print.quantity || 0),
					0,
				);
				const shipping = Number(data.pricing?.shipping ?? originalDoc?.pricing?.shipping) || 300;
				const tax = Number(data.pricing?.tax ?? originalDoc?.pricing?.tax) || 0;
				data.pricing = {
					subtotal,
					shipping,
					tax,
					total: subtotal + shipping + tax,
				};

				// makes the shippingAddress readonly
				//? keep?
				if (operation === 'update') {
					data.shippingAddress = originalDoc?.shippingAddress ?? data.shippingAddress;
				}

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
						{
							label: 'Expired',
							value: 'expired',
						},
						{
							label: 'Checkout Failed',
							value: 'checkout-failed',
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
			admin: { description: 'GoShippo details details for the order' },
			fields: [
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
						description: 'Current order status',
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
