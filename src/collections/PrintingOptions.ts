import { GlobalConfig } from 'payload';
import { Plastic } from '@/blocks/Plastic';

const PrintingOptions: GlobalConfig = {
	slug: 'printing-options',
	label: 'Printing Options',
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
			label: 'Layer Height Range',
			type: 'group',
			fields: [
				{
					name: 'min',
					label: 'Minimum mm',
					type: 'number',
					required: true,
				},
				{
					name: 'max',
					label: 'Maximum mm',
					type: 'number',
					required: true,
				},
			],
		},

		//* infill is the only field that the user can change even with a preset selected
		{
			name: 'infill',
			label: 'Infill Percentage Range',
			type: 'group',
			fields: [
				{
					name: 'min',
					label: 'Minimum %',
					type: 'number',
					required: true,
				},
				{
					name: 'max',
					label: 'Maximum %',
					type: 'number',
					required: true,
				},
			],
		},
	],
};

export { PrintingOptions };
