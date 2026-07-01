import { Order } from '@/payload-types';
import { APIError, CollectionConfig } from 'payload';
import { adminAccess } from '@/access/elevated';
import { noAccess, selfAccessOrders } from '@/access/anyone';
import { getServerSideURL } from '@/utils/getServerSideUrl';

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
		update: selfAccessOrders || adminAccess,
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
				//* 3. the product price should NEVER change, but might, so not updating it will keep the price consistent

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

					// pricing calculation
					const subtotal = normalizedPrints.reduce(
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
				} else {
					data.pricing = originalDoc?.pricing ?? data.pricing; //* if the prices are already set, disable updating prices
				}

				// makes the shippingAddress readonly
				//? keep?
				if (operation === 'update' && !data.shippingAddress) {
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
				} else if (operation === 'update') {
					// send email to customer with the new status

					for (const doc of result.docs as Order[]) {
						const customer =
							typeof doc.customer === 'string'
								? await req.payload.findByID({ collection: 'users', id: doc.customer })
								: doc.customer;

						if (process.env.SEND_EMAILS === 'true') {
							req.payload.sendEmail({
								to: customer.email,
								subject: `Your order is now ${doc.status.currentStatus}`,
								html: `
							<!DOCTYPE html>
							<html>
							<head>
							<meta charset="utf-8">
							<meta name="viewport" content="width=device-width, initial-scale=1.0">
							<title>Your order status has been updated</title>
							</head>
							<body style="margin: 0; padding: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; color: #18181b;">
							<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0; padding: 0; width: 100%; background-color: #f4f4f5;">
								<tr>
								<td align="center" style="padding: 40px 0;">
									<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0; padding: 0; width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
									<!-- Header -->
									<tr>
										<td style="padding: 32px 40px; text-align: center; background-color: #2a2e58; border-radius: 8px 8px 0 0;">
										<h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">Avium</h1>
										</td>
									</tr>

									<!-- Content -->
									<tr>
										<td style="padding: 40px;">
										<p style="margin: 0 0 16px; font-size: 16px; line-height: 24px; color: #18181b;">Hi ${customer.name || 'there'},</p>

										<p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #18181b;">
											${
												doc.status.currentStatus === 'cancelled'
													? "Your order has been cancelled. If you have not made this change please consult the order's comments to find the reason."
													: 'Your order status has been updated. Please review the latest details below.'
											}
										</p>

										<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0 0 24px; background-color: #f8fafc; border: 1px solid #e4e4e7; border-radius: 8px;">
											<tr>
											<td style="padding: 20px 24px;">
												<p style="margin: 0 0 8px; font-size: 14px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.04em;">Order update</p>
												<p style="margin: 0 0 8px; font-size: 20px; font-weight: 600; color: #18181b;">Order #${doc.id}</p>
												<p style="margin: 0 0 8px; font-size: 16px; line-height: 24px; color: #18181b;">
												<strong>New status:</strong> ${doc.status}
												</p>
												<p style="margin: 0; font-size: 14px; line-height: 22px; color: #71717a;">
												Updated on: ${doc.updatedAt || new Date().toLocaleString()}
												</p>
											</td>
											</tr>
										</table>

										<p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #18181b;">
											You can view the latest details of your order by clicking the button below.
										</p>

										<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
											<tr>
											<td align="center" style="padding: 8px 0 24px;">
												<a href="${getServerSideURL()}/dashboard/home" target="_blank" style="display: inline-block; padding: 10px 16px; background-color: #fca644; border-radius: 6px; font-size: 14px; font-weight: 500; color: #ffffff; text-decoration: none; text-align: center; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">
												View Order
												</a>
											</td>
											</tr>
										</table>

										<p style="margin: 0; font-size: 16px; line-height: 24px; color: #18181b;">
											If you have any questions, feel free to reply to this email and we’ll be happy to help.
										</p>
										</td>
									</tr>

									<!-- Footer -->
									<tr>
										<td style="padding: 24px 40px; text-align: center; background-color: #eee; border-radius: 0 0 8px 8px;">
										<p style="margin: 0; font-size: 14px; line-height: 20px; color: #121212;">
											&copy; ${new Date().getFullYear()} Avium. All rights reserved.
										</p>
										</td>
									</tr>
									</table>
								</td>
								</tr>
							</table>
							</body>
							</html>
							`,
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
						{ name: 'colour', type: 'text', required: true },
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
					name: 'parcelId',
					type: 'text',
					admin: { description: 'Parcel ID' },
				},
			],
		},

		{
			name: 'dimensions',
			type: 'group',
			required: false,
			admin: { description: 'Dimensions of the final, packaged order for shipping.' },
			fields: [
				{
					name: 'length',
					type: 'number',
					admin: { description: 'Length of the package in centimeters' },
				},
				{
					name: 'width',
					type: 'number',
					admin: { description: 'Width of the package in centimeters' },
				},
				{
					name: 'height',
					type: 'number',
					admin: { description: 'Height of the package in centimeters' },
				},
				{
					name: 'weight',
					type: 'number',
					admin: { description: 'Weight of the package in grams' },
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
