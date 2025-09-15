import { Field } from 'payload';

const PricingPreviewField: Field = {
	name: 'PricingPreview',
	type: 'text',
	label: 'Pricing Preview',
	required: true,
	admin: {
		components: {
			Field: '@/components/payload/PricingPreview/PricingPreview',
		},
	},
};

export default PricingPreviewField;
