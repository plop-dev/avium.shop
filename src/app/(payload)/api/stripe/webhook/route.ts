'use server';

import { stripe } from '@/lib/stripe';
import { headers } from 'next/headers';
import { getPayload } from 'payload';
import config from '@/payload.config';
import Stripe from 'stripe';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
	const body = await req.text();
	const payload = await getPayload({ config });

	const signature = (await headers()).get('stripe-signature');
	let event: Stripe.Event;

	try {
		event = stripe.webhooks.constructEvent(body, signature!, process.env.STRIPE_WEBHOOK_SECRET!);
	} catch (err) {
		console.error('Error verifying Stripe webhook signature:', err);
		return new Response('Webhook Error: Invalid signature', { status: 400 });
	}

	switch (event.type) {
		case 'checkout.session.completed': {
			const session = event.data.object;
			const orderId = session.metadata?.orderId || session.client_reference_id;

			if (!orderId) {
				console.error('No orderId found in session metadata or client_reference_id');
				return new Response('Webhook Error: No orderId found', { status: 500 });
			}

			const order = await payload.findByID({
				collection: 'orders',
				id: orderId,
			});

			const chargeId = (await stripe.paymentIntents.retrieve(session.payment_intent as string)).latest_charge?.toString();
			const shippingDetails = session.collected_information?.shipping_details;

			if (!shippingDetails || !shippingDetails.address) {
				console.error('No shipping details found in session');
				return new Response('Webhook Error: No shipping details found', { status: 500 });
			}

			await payload
				.update({
					collection: 'orders',
					id: orderId,
					data: {
						payment: {
							paidAt: new Date().toISOString(),
							stripeCheckoutSessionId: session.id,
							stripePaymentIntentId: session.payment_intent?.toString(),
							amount: session.amount_total,
							currency: session.currency,
							provider: 'stripe',
							status: 'paid',
							stripeCustomerId: session.customer?.toString(),
							stripeChargeId: chargeId,
							receiptUrl: chargeId && (await stripe.charges.retrieve(chargeId)).receipt_url,
						},
						shippingAddress: {
							fullName: shippingDetails.name,
							line1: shippingDetails.address?.line1,
							line2: shippingDetails.address?.line2,
							city: shippingDetails.address?.city,
							county: shippingDetails.address?.state,
							postcode: shippingDetails.address?.postal_code,
							country: shippingDetails.address?.country,
						},
					},
				})
				.catch(err => {
					console.error('Error updating order after checkout.session.completed:', err);
					return new Response('Webhook Error: Failed to update order', { status: 500 });
				});

			// now that the order has been paid, we can delete all quotes used for this order
			const quoteIds = order.prints
				.filter(p => p.blockType === 'customPrint')
				.map(p => (typeof p.quote === 'string' ? p.quote : p.quote?.id));

			if (quoteIds.length > 0) {
				await payload.delete({
					collection: 'quotes',
					where: {
						id: {
							in: quoteIds,
						},
					},
				});
			}

			revalidatePath(`/dashboard/home`);

			break;
		}
		case 'checkout.session.expired': {
			const session = event.data.object;
			const orderId = session.metadata?.orderId || session.client_reference_id;

			if (!orderId) {
				console.error('No orderId found in session metadata or client_reference_id');
				return new Response('Webhook Error: No orderId found', { status: 500 });
			}

			await payload.update({
				collection: 'orders',
				id: orderId,
				data: {
					payment: {
						status: 'expired',
						stripeCheckoutSessionId: null,
					},
				},
			});

			revalidatePath(`/dashboard/home`);

			break;
		}

		case 'charge.refunded': {
			const session = event.data.object;
			const orderId = session.metadata?.orderId;

			if (!orderId) {
				console.error('No orderId found in charge metadata');
				return new Response('Webhook Error: No orderId found', { status: 500 });
			}

			await payload.update({
				collection: 'orders',
				id: orderId,
				data: {
					payment: {
						status: 'refunded',
						refundedAt: new Date().toISOString(),
						refunded: true,
					},
				},
			});

			revalidatePath(`/dashboard/home`);

			break;
		}

		case 'charge.refund.updated': {
			const refund = event.data.object as Stripe.Refund;
			const chargeId = typeof refund.charge === 'string' ? refund.charge : refund.charge?.id;

			if (!chargeId) {
				console.error('No chargeId found on refund');
				return new Response('Webhook Error: No chargeId found', { status: 500 });
			}

			const charge = await stripe.charges.retrieve(chargeId);
			const orderId = charge.metadata?.orderId;

			if (!orderId) {
				console.error('No orderId found in charge metadata');
				return new Response('Webhook Error: No orderId found', { status: 500 });
			}

			await payload.update({
				collection: 'orders',
				id: orderId,
				data: {
					payment: {
						status: refund.status === 'succeeded' ? 'refunded' : 'partially-refunded',
						refundedAt: refund.status === 'succeeded' ? new Date().toISOString() : undefined,
						refundedAmount: refund.amount,
					},
				},
			});

			revalidatePath(`/dashboard/home`);

			break;
		}
	}

	return Response.json({ received: true });
}
