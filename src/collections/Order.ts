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
		create: () => true,
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
			name: 'items',
			type: 'array',
			minRows: 1,
			fields: [
				{
					name: 'model',
					type: 'upload',
					relationTo: 'users', //! FIX
					admin: {
						description: 'The 3D file to print',
					},
					required: true,
				},
				{
					name: 'quantity',
					type: 'number',
					required: true,
					defaultValue: 1,
				},
				{
					name: 'material',
					type: 'select',
					options: [
						{ label: 'PLA', value: 'pla' },
						{ label: 'PETG', value: 'petg' },
						{ label: 'TPU', value: 'tpu' },
					],
					required: true,
				},
				{
					name: 'colour',
					type: 'select',
					options: [
						{ label: 'Black', value: 'black' },
						{ label: 'White', value: 'white' },
						{ label: 'Red', value: 'red' },
						{ label: 'Blue', value: 'blue' },
						{ label: 'Green', value: 'green' },
					],
					required: true,
				},
				{
					name: 'unitPrice',
					type: 'number',
					required: true,
				},
			],
		},
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
		{
			name: 'notes',
			type: 'textarea',
			admin: {
				description: 'Internal notes or comments about the order',
			},
		},
	],
};
