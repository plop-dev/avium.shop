import { anyoneAccess } from '@/access/anyone';
import { adminAccess } from '@/access/elevated';
import { Plastic } from '@/blocks/Plastic';
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
		description: 'Products available for purchase in the shop. DO NOT DELETE PRODUCTS, HIDE INSTEAD.',
	},
	access: {
		read: anyoneAccess,
		create: adminAccess,
		update: adminAccess,
		delete: adminAccess,
	},
	timestamps: true,
	fields: [
		{
			name: 'name',
			type: 'text',
			required: true,
			admin: {
				description: 'The name of the product',
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
				description: 'The price of the product in GBP (£)',
			},
		},

		{
			name: 'orders',
			type: 'number',
			defaultValue: 0,
			admin: {
				description: 'The number of times this product has been bought',
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
