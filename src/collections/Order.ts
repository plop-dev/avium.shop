import { APIError, CollectionConfig } from 'payload';

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
		read: () => true,
		create: () => true,
		update: () => true,
		delete: () => false,
	},
	hooks: {
		beforeChange: [
			({ data, req }) => {
				if (req.user) {
					if (data.customer != req.user.id) {
						console.log(data);
						console.log(data.customer);
						console.log(req.user);
						console.log(req.user.id);
						throw new APIError("Cannot set customer to another user.", 400);
					}
					console.log(data);
					//data.customer = data.customer.replace("-", "");
				} else {
					// this shouldn't be reachable with proper access control
					console.log("Unauthenticated request trying to create/update an order.");
					throw new APIError("Unauthenticated requests cannot create or modify orders.", 401);
				}

			}
		]
		/*beforeChange: [
			({ data }) => {
				if (!data) return data;

				// keep currentStatus in sync with the last history entry
				const statuses = data?.status?.statuses;
				if (Array.isArray(statuses) && statuses.length) {
					const last = statuses[statuses.length - 1];
					data.status = {
						...data.status,
						currentStatus: last.stage,
					};
				}

				// compute order total from prints
				if (Array.isArray(data?.prints)) {
					let total = 0;
					data.prints.forEach(print => {
						const price = Number(print?.price ?? 0);
						total += price;
					});
					data.total = total;
				}

				return data;
			},
		],*/
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
						{ name: 'quantity', type: 'number', required: true, defaultValue: 1, min: 1 },
						{ name: 'price', type: 'number', required: true },
						{ name: 'completed', type: 'checkbox', defaultValue: false, admin: { description: 'Mark as printed' } },
					],
				},
				{
					slug: 'customPrint',
					labels: { singular: 'Custom Print', plural: 'Custom Prints' },
					fields: [
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
						{ name: 'quantity', type: 'number', required: true, defaultValue: 1, min: 1 },
						{ name: 'price', type: 'number', required: true },
						{ name: 'completed', type: 'checkbox', defaultValue: false, admin: { description: 'Mark as printed' } },
					],
				},
			],
		},

		//! ABSOLUTELY NO IDEA: ASK ENY
		{
			name: 'payment',
			type: 'group',
			required: true,
			fields: [
				{
					name: 'stripePaymentIntentId',
					type: 'text',
					admin: { description: 'Stripe Payment Intent ID' },
				},
				{
					name: 'status',
					type: 'select',
					options: [
						{ label: 'Pending', value: 'pending' },
						{ label: 'Processing', value: 'processing' },
						{ label: 'Succeeded', value: 'succeeded' },
						{ label: 'Failed', value: 'failed' },
						{ label: 'Cancelled', value: 'cancelled' },
					],
					defaultValue: 'pending',
				},
				{
					name: 'amount',
					type: 'number',
					admin: { description: 'Payment amount in cents' },
				},
			],
		},

		{
			name: 'total',
			type: 'number',
			required: true,
			admin: {
				description: 'The total price of the order. Calculated from the prints.',
				readOnly: true,
			},
		},

		{
			name: 'queue',
			admin: {
				description: 'The print queue this order is assigned to',
			},
			type: 'number',
			required: false,
			defaultValue: 1,
		},

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

		//! NEEDED?
		// {
		// 	name: 'shipping',
		// 	type: 'group',
		// 	fields: [
		// 		{
		// 			name: 'address',
		// 			type: 'group',
		// 			fields: [
		// 				{ name: 'line1', type: 'text', required: true },
		// 				{ name: 'line2', type: 'text' },
		// 				{ name: 'city', type: 'text', required: true },
		// 				{ name: 'state', type: 'text' },
		// 				{ name: 'postalCode', type: 'text', required: true },
		// 				{ name: 'country', type: 'text', required: true },
		// 			],
		// 		},
		// 		{
		// 			name: 'trackingNumber',
		// 			type: 'text',
		// 			admin: { description: 'Shipping carrier tracking number' },
		// 		},
		// 		{
		// 			name: 'carrier',
		// 			type: 'text',
		// 			admin: { description: 'Shipping carrier name' },
		// 		},
		// 	],
		// },
		//! --------

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
