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
			name: 'pictures', //? make this relation to new collection? (media?)
			type: 'array',
			label: 'Product Pictures',
			required: true,
			fields: [
				{
					name: 'url', //TODO add validation for url
					type: 'text',
					required: true,
					admin: {
						description: 'The url of the product image. MAKE SURE THIS INCLUDES A VALID IMAGE FORMAT (jpg, png, etc.)',
					},
				},
				{
					name: 'alt',
					type: 'text',
					required: true,
					admin: {
						description: 'The alternative text (description) of the product image',
					},
				},
			],
		},

		{
			name: 'price',
			type: 'number',
			required: true,
			admin: {
				description: 'The price of the product in GBP (£)',
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
				},

				{
					name: 'layerHeight',
					label: 'Layer Height',
					admin: {
						description: 'The layer height of the product. This is set by the preset and cannot be changed by the user.',
					},
					type: 'number',
				},

				{
					name: 'infill',
					label: 'Infill Percentage',
					admin: {
						description: 'The infill percentage of the product. This is set by the preset and cannot be changed by the user.',
					},
					type: 'number',
				},
			],
		},
	],
};
