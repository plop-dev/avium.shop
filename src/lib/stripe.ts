import 'server-only';

import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
	apiVersion: '2026-06-24.dahlia',
	appInfo: {
		name: 'Avium Printing',
		url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
	},
});
