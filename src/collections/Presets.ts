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
				description:
					'The filename of the profile of the preset (process) in Bambu Studio/Orca Slicer. DO NOT INCLUDE FILE EXTENSION. See C:\\Program Files\\OrcaSlicer\\resources\\profiles\\BBL\\process',
			},
		},
	],
};
