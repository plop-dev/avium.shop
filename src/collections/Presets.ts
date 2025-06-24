import type { CollectionConfig } from 'payload';

export const Presets: CollectionConfig = {
	slug: 'presets',
	labels: {
		singular: 'Preset',
		plural: 'Presets',
	},
	admin: {
		useAsTitle: 'name',
	},
	fields: [
		{
			name: 'name',
			type: 'text',
			required: true,
			admin: {
				description: 'The name of the preset',
			},
		},
		{
			name: 'description',
			type: 'textarea',
			admin: {
				description: 'A brief description of the preset',
			},
		},
		{
			name: 'bambulabName',
			label: 'Bambu Lab Preset Name',
			type: 'text',
			admin: {
				description: 'The name of the preset in Bambu Lab',
			},
		},
	],
};
