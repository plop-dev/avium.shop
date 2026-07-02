import { adminAccess } from '@/access/elevated';
import type { CollectionConfig } from 'payload';

// NOTE: The 'cost' field has been deprecated. Filament pricing is now calculated via the pricing formula in PricingFormula collection.
// If a cost field exists in the database schema, it can remain but should not be used in any components or calculations.
export const Filaments: CollectionConfig = {
	slug: 'filaments',
	labels: {
		singular: 'Filament',
		plural: 'Filaments',
	},
	admin: {
		useAsTitle: 'name',
	},
	access: {
		read: () => true,
		create: ({ req }) => adminAccess({ req }),
		update: ({ req }) => adminAccess({ req }),
		delete: () => false,
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
