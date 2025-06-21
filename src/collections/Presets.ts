import type { CollectionConfig } from 'payload';
import PrintingOptionsFields from './PrintingOptionsFields';

export const Presets: CollectionConfig = {
	slug: 'presets',
	labels: {
		singular: 'Preset',
		plural: 'Presets',
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
			name: 'options',
			type: 'group',
			label: 'Printing Options',
			fields: PrintingOptionsFields, //? plastic blocks also appear in the panel (ask szymon if presets include plastics)
		},
	],
};
