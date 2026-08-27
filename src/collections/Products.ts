import { anyoneAccess, noAccess } from '@/access/anyone';
import { adminAccess } from '@/access/elevated';
import { Plastic } from '@/blocks/Plastic';
import { revalidateTag } from 'next/cache';
import { CollectionConfig } from 'payload';

export const Products: CollectionConfig = {
	slug: 'products',
	labels: {
		singular: 'Product',
		plural: 'Products',
	},
	admin: {
		useAsTitle: 'name',
		//? defaultColumns: ['name', 'customer', 'currentStatus', 'createdAt'],
		description: 'Products available for purchase in the shop. DO NOT DELETE PRODUCTS, ARCHIVE INSTEAD.',
	},
	access: {
		read: ({ req }) => anyoneAccess({ req }),
		create: ({ req }) => adminAccess({ req }),
		update: ({ req }) => adminAccess({ req }),
		delete: () => false,
	},
	timestamps: true,
	hooks: {
		beforeChange: [
			async ({ req, data, operation, originalDoc }) => {
				if (operation === 'update') {
					data.price = originalDoc.price;
				}

				return data;
			},
		],
		afterChange: [
			async () => {
				revalidateTag('products', 'max');
			},
		],
		afterDelete: [
			async () => {
				revalidateTag('products', 'max');
			},
		],
	},
	fields: [
		{
			name: 'name',
			type: 'text',
			required: true,
			index: true,
			admin: {
				description: 'The name of the product.',
			},
		},

		{
			name: 'description',
			type: 'text',
			required: true,
			admin: {
				description: 'A detailed description of the product',
			},
		},

		{
			name: 'pictures',
			type: 'relationship',
			relationTo: 'media',
			label: 'Product Pictures',
			required: true,
			hasMany: true,
		},

		{
			name: 'price',
			type: 'number',
			required: true,
			admin: {
				readOnly: true,
				description: 'The price of the product in pence (p) (e.g. 1500 for £1.50)',
			},
		},

		{
			name: 'time',
			type: 'text',
			required: true,
			admin: {
				description: 'The estimated print time for the product (e.g. "2h30m")',
			},
		},

		{
			name: 'orders',
			type: 'number',
			defaultValue: 0,
			admin: {
				description: 'The number of times this product has been bought',
				readOnly: true,
			},
		},

		{
			name: 'archived',
			type: 'checkbox',
			defaultValue: false,
			required: false,
			admin: {
				description: 'If true, the product will not be shown in the shop and cannot be purchased.',
			},
		},

		// USER WILL NOT BE ABLE TO CHANGE BELOW, ONLY FOR ADMIN
		//* ONLY ALLOW USER TO SELECT COLOUR
		{
			name: 'printingOptions',
			type: 'group',
			required: true,
			fields: [
				{
					name: 'plastic',
					label: 'Plastic',
					labels: {
						singular: 'Plastic',
						plural: 'Plastics',
					},
					type: 'blocks',
					blocks: [Plastic],
					required: true,
				},

				{
					name: 'layerHeight',
					label: 'Layer Height',
					admin: {
						description: 'The layer height of the product. This is set by the preset and cannot be changed by the user.',
					},
					type: 'number',
					required: true,
				},

				{
					name: 'infill',
					label: 'Infill Percentage',
					admin: {
						description: 'The infill percentage of the product. This is set by the preset and cannot be changed by the user.',
					},
					type: 'number',
					required: true,
				},
			],
		},
	],
};
