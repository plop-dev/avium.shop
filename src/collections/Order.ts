import { CollectionConfig } from 'payload';

export const Orders: CollectionConfig = {
	slug: 'orders',
	labels: {
		singular: 'Order',
		plural: 'Orders',
	},
	admin: {
		useAsTitle: 'name',
		defaultColumns: ['name', 'customer', 'status.currentStatus', 'createdAt'],
	},
	access: {
		read: () => true,
		create: () => false,
		update: () => true,
		delete: () => false,
	},
	hooks: {
		beforeChange: [
			({ data }) => {
				// keep currentStatus in sync with the last history entry
				const statuses = data?.status?.statuses;
				if (Array.isArray(statuses) && statuses.length) {
					data.status.currentStatus = statuses[statuses.length - 1].stage;
				}
				return data;
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

		{
			name: 'prints',
			type: 'blocks',
			required: true,
			minRows: 1,
			labels: { singular: 'Print', plural: 'Prints' },
			blocks: [
				{
					slug: 'ShopProduct',
					labels: { singular: 'Shop Product', plural: 'Shop Product' },
					fields: [
						{ name: 'product', type: 'relationship', relationTo: 'products', required: true },
						{ name: 'quantity', type: 'number', required: true, defaultValue: 1, min: 1 },
						// snapshot product data to protect from catalog changes
						{
							name: 'snapshot',
							type: 'group',
							admin: { description: 'Captured at time of order' },
							fields: [
								{ name: 'name', type: 'text' },
								{ name: 'unitPrice', type: 'number' },
							],
						},
						{ name: 'subtotal', type: 'number', admin: { readOnly: true } },
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
									options: ['stl', 'obj', '3mf'],
									required: true,
									admin: { readOnly: true },
								},
								{ name: 'serverPath', type: 'text', required: true, admin: { readOnly: true } },
							],
						},
						{ name: 'quantity', type: 'number', required: true, defaultValue: 1, min: 1 },
						{
							name: 'printingOptions',
							type: 'group',
							required: true,
							fields: [
								{ name: 'preset', type: 'relationship', relationTo: 'presets' },
								// if layerHeight is set, treat as custom; otherwise preset applies
								{ name: 'layerHeight', label: 'Layer Height', type: 'number' },
								{ name: 'infill', label: 'Infill Percentage', type: 'number' },
							],
						},

						// price for this custom print line (after quote)
						{ name: 'unitPrice', type: 'number', admin: { description: 'Set after quote acceptance' } },
						{ name: 'subtotal', type: 'number', admin: { readOnly: true } },
					],
				},
			],
		},

		//#region payment
		//? DOUBLE CHECK WITH STRIPE AND SZYMON
		{
			name: 'payment',
			type: 'group',
			required: true,
			fields: [],
		},
		//#endregion

		// only if custom
		{
			name: 'total',
			type: 'number',
			admin: {
				description:
					'The total price of the order. Calculated from the prints subtotals. After quote if order has any custom prints.',
			},
		},

		//#region status
		//! CHANGE THIS -------------
		{
			name: 'status',
			type: 'group',
			label: 'Order Status',
			hooks: {
				beforeChange: [
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

						// compute line subtotals and order total
						if (Array.isArray(data?.prints)) {
							let total = 0;
							data.prints = data.prints.map((p: any) => {
								const qty = Number(p?.quantity ?? 0);

								if (p?.blockType === 'ShopProduct') {
									const unit = Number(p?.snapshot?.unitPrice ?? 0);
									const subtotal = qty * unit;
									total += subtotal;
									return { ...p, subtotal };
								}

								if (p?.blockType === 'customPrint') {
									const unit = Number(p?.unitPrice ?? 0);
									const subtotal = qty * unit;
									total += subtotal;
									return { ...p, subtotal };
								}

								return p;
							});
							data.total = total;
						}

						return data;
					},
				],
			},
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
								{ label: 'Received', value: 'received' },
								{ label: 'Processing', value: 'processing' },
								{ label: 'Printing', value: 'printing' },
								{ label: 'Quality Check', value: 'quality_check' },
								{ label: 'Shipped', value: 'shipped' },
								{ label: 'Delivered', value: 'delivered' },
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
									pickerAppearance: 'dayOnly',
								},
							},
						},
					],
				},
				{
					name: 'currentStatus',
					type: 'select',
					options: [
						{ label: 'Received', value: 'received' },
						{ label: 'Processing', value: 'processing' },
						{ label: 'Printing', value: 'printing' },
						{ label: 'Quality Check', value: 'quality_check' },
						{ label: 'Shipped', value: 'shipped' },
						{ label: 'Delivered', value: 'delivered' },
						{ label: 'Cancelled', value: 'cancelled' },
					],
					admin: {
						description: 'Denormalized field for quick access',
					},
				},
			],
		},
		//! --------------------------------
		//#endregion

		//? TBD
		{
			name: 'comments',
			type: 'array',
			label: 'Comments',

			fields: [
				{
					name: 'author',
					type: 'relationship',
					relationTo: 'users',
					required: true,
					admin: { description: 'The user who made the comment' },
				},
				{
					name: 'content',
					type: 'richText',
					required: true,
					admin: { description: 'The content of the comment' },
				},
				{
					name: 'createdAt',
					type: 'date',
					defaultValue: new Date(),
					admin: { readOnly: true, date: { pickerAppearance: 'dayOnly' } },
				},
			],
		},
	],
};
