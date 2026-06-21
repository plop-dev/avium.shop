import type { CollectionConfig } from 'payload';

export const Filaments: CollectionConfig = {
	slug: 'filaments',
	labels: {
		singular: 'Filament',
		plural: 'Filaments',
	},
	admin: {
		useAsTitle: 'name',
	},
	fields: [
		{
			name: 'name',
			type: 'text',
			required: true,
			unique: true, // we use names in the order form instead of the id so we need to make sure they are unique
			admin: {
				description: 'The name of the filament/material. USE THIS FORMAT: PLA, PETG, ABS, etc.',
			},
		},
		{
			name: 'data',
			type: 'json',
			required: true,
			admin: {
				description:
					'JSON data from filament folder in Bambu Labs or Orca Slicer. Path: C:/Program Files/OrcaSlicer/resources/profiles/BBL',
			},
		},
	],
};
