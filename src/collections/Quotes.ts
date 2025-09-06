import type { CollectionConfig } from 'payload';

export const Quotes: CollectionConfig = {
	slug: 'quotes',
	labels: {
		singular: 'Quote',
		plural: 'Quotes',
	},
	admin: {},
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
				{ name: 'serverPath', type: 'text', required: false, admin: { readOnly: true } },
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
				{ name: 'plastic', type: 'text', required: true, admin: { description: 'The plastic/material ID' } },
				{ name: 'colour', type: 'text', required: true, admin: { description: 'The colour ID' } },
			],
		},
		{
			name: 'printHash',
			type: 'text',
			required: true,
		},
		{
			name: 'user',
			type: 'relationship',
			relationTo: 'users',
			required: true,
			admin: {
				description: 'The user who requested the quote',
			},
		},
		{ name: 'price', type: 'number', admin: { readOnly: true } },
	],
};
