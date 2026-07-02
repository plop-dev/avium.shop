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
	fields: [PricingPreviewField],
};
