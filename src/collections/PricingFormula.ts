import { GlobalConfig } from 'payload';
import { evaluate } from 'mathjs';
import PricingPreviewField from '@/components/payload/PricingPreview/config';
import { adminAccess } from '@/access/elevated';

export const PricingFormula: GlobalConfig = {
	slug: 'pricing-formula',
	label: 'Pricing Formula',
	access: {
		update: ({ req }) => adminAccess({ req }),
		read: () => true,
	},
	admin: {
		description:
			'Configure the pricing formula for custom prints. Use variables like weight (in grams) and time (in seconds). Example: price = (weight / 1000) + (time * 5)',
	},
	fields: [PricingPreviewField],
};
