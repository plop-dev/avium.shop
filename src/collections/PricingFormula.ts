import { GlobalConfig } from 'payload';
import { evaluate } from 'mathjs';
import PricingPreviewField from '@/components/payload/PricingPreview/config';

const PricingFormula: GlobalConfig = {
	slug: 'pricing-formula',
	label: 'Pricing Formula',
	fields: [PricingPreviewField],
};

export { PricingFormula };
