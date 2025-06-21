import { CollectionConfig } from 'payload';

export const Orders: CollectionConfig = {
	slug: 'orders',
	labels: {
		singular: 'Order',
		plural: 'Orders',
	},
	admin: {
		useAsTitle: 'name',
		defaultColumns: ['name', 'customer', 'currentStatus', 'createdAt'],
	},
	access: {
		read: () => true,
		create: () => false,
		update: () => true,
		delete: () => false,
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
			name: 'model',
			type: 'array',
			admin: {
				readOnly: true,
				isSortable: false,
				description: 'The 3D model(s) associated with this order',
			},
			fields: [
				{
					name: 'filename',
					type: 'text',
					required: true,
					admin: { description: 'The name of the 3D model file (example: acb123)', readOnly: true },
				},
				{
					name: 'filetype',
					type: 'select',
					options: ['stl', 'obj', '3mf'],
					required: true,
					admin: { readOnly: true },
				},
				{
					name: 'serverPath',
					type: 'text',
					required: true,
					admin: {
						description: 'The relative path of the 3D model file on the server (example: /files/abc123.stl)',
						readOnly: true,
					},
				},
			],
		},

		{
			name: 'quantity',
			type: 'number',
			required: true,
			defaultValue: 1,
		},

		{
			name: 'preset',
			type: 'relationship',
			relationTo: 'presets',
		},

		//#region status
		//! CHANGE THIS -------------
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
			hooks: {
				afterChange: [
					({ value, previousValue, req }) => {
						// update currentStatus based on last statuses entry
						if (value.statuses?.length) {
							const last = value.statuses[value.statuses.length - 1];
							value.currentStatus = last.stage;
						}
						return value;
					},
				],
			},
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
