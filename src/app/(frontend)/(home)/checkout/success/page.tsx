import { stripe } from '@/lib/stripe';
import { CheckoutStatusClient } from './checkout-status-client.tsx';
import { Suspense } from 'react';

function getSessionId(searchParams: { session_id?: string | string[] }) {
	if (!searchParams.session_id) return undefined;

	return Array.isArray(searchParams.session_id) ? searchParams.session_id[0] : searchParams.session_id;
}

async function CheckoutPageContent({ searchParams }: { searchParams: Promise<{ session_id?: string | string[] }> }) {
	const sessionId = getSessionId(await searchParams);

	if (!sessionId) {
		return <CheckoutStatusClient />;
	}

	try {
		const checkout = await stripe.checkout.sessions.retrieve(sessionId);
		const orderId = checkout.client_reference_id || checkout.metadata?.orderId;

		return <CheckoutStatusClient orderId={orderId || undefined} />;
	} catch {
		return <CheckoutStatusClient />;
	}
}

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ session_id?: string | string[] }> }) {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<CheckoutPageContent searchParams={searchParams} />
		</Suspense>
	);
}
