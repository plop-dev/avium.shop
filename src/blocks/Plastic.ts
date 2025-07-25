import colourField from '@/components/payload/ColourPicker/config';
import { Block } from 'payload';

export const Plastic: Block = {
	slug: 'plastic',
	admin: {
		disableBlockName: true,
	},
	labels: {
		singular: 'Plastic',
		plural: 'Plastics',
	},
	fields: [
		{
			name: 'name',
			type: 'text',
			required: true,
			admin: {
				description: 'The name of the plastic type',
			},
		},
		{
			name: 'description',
			type: 'textarea',
			admin: {
				description: 'A brief description of the plastic type',
			},
			maxLength: 120,
		},
		{
			name: 'colours',
			type: 'array',
			fields: [colourField],
		},
	],
};
