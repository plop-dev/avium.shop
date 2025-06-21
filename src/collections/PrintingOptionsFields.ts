import { Plastic } from '@/blocks/Plastic';
import { Field } from 'payload';

const fields: Field[] = [
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
				admin: { description: 'e.g. 0–100' },
			},
			{
				name: 'max',
				label: 'Maximum %',
				type: 'number',
				required: true,
			},
		],
	},
];

export default fields;
