import { Field } from 'payload';

export const validateHexColour = (value: string | null | undefined) => {
	if (!value || typeof value !== 'string') {
		return 'This field is required';
	}
	return Boolean(value.match(/^#(?:[0-9a-fA-F]{3}){1,2}$/)) || 'Invalid hex color format';
};

const colourField: Field = {
	name: 'color',
	type: 'text',
	label: 'Colour',
	validate: validateHexColour,
	required: true,
	admin: {
		components: {
			Field: '@/components/payload/ColourPicker/ColourPicker',
			Cell: '@/components/payload/ColourPicker/Cell',
		},
	},
};

export default colourField;
