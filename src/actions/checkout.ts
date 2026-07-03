'use server';

import { getPayload } from 'payload';
import config from '@/payload.config';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { getUser } from '@/utils/getUser';
import { getServerSideURL } from '@/utils/getServerSideUrl';

export async function checkout(orderId: string): Promise<{ success: boolean; message: string }> {
	const payload = await getPayload({ config });
	const user = await getUser();

	const order = await payload.findByID({
		collection: 'orders',
		id: orderId,
		depth: 2,
	});

	if (user?.id !== (typeof order.customer === 'string' ? order.customer : order.customer.id)) {
		return {
			success: false,
			message: 'You are not authorized to checkout this order.',
		};
	}

	// check it hasn't already been paid
	if (order.payment?.paidAt) {
		return {
			success: false,
			message: 'Order has already been paid.',
		};
	}

	const serverSideUrl = getServerSideURL();

	// create checkout session
	const checkout = await stripe.checkout.sessions.create({
		mode: 'payment',
		ui_mode: 'hosted_page',
		currency: 'gbp',
		success_url: `${serverSideUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
		cancel_url: `${serverSideUrl}/checkout/cancel?order_id=${orderId}`,
		customer_creation: 'always',
		customer_email: typeof order.customer === 'string' ? undefined : order.customer.email,
		client_reference_id: order.id,
		metadata: {
			orderId: order.id,
			userId: typeof order.customer === 'string' ? order.customer : order.customer.id,
			currency: 'gbp',
		},
		line_items: [
			{
				price_data: {
					currency: 'gbp',
					product_data: {
						name: `Shipping`,
					},
					unit_amount: 300,
				},
				quantity: 1,
			},
			...order.prints.map(print => {
				if (print.blockType === 'customPrint') {
					const r: Stripe.Checkout.SessionCreateParams.LineItem = {
						price_data: {
							currency: 'gbp',
							product_data: {
								name: `Custom Print - ${print.model.filename}`,
								description: `Printing options: ${print.printingOptions.colour} ${print.printingOptions.plastic}, Quality: ${print.printingOptions.layerHeight || (typeof print.printingOptions.preset === 'string' ? print.printingOptions.preset : print.printingOptions.preset?.name)}, Infill: ${print.printingOptions.infill}`,
							},
							unit_amount: print.price,
						},
						quantity: print.quantity,
					};

					return r;
				} else {
					const r: Stripe.Checkout.SessionCreateParams.LineItem = {
						price_data: {
							currency: 'gbp',
							product_data: {
								name: `Shop Product - ${typeof print.product === 'string' ? print.product : print.product.name}`,
							},
							unit_amount: print.price,
						},
						quantity: print.quantity,
					};

					return r;
				}
			}),
		],
		shipping_address_collection: {
			allowed_countries: ['GB'],
		},
		billing_address_collection: 'required',
	});

	if (!checkout.url) {
		return {
			success: false,
			message: 'Failed to create checkout session.',
		};
	}
	await payload.update({
		id: orderId,
		collection: 'orders',
		data: {
			payment: {
				stripeCheckoutSessionId: checkout.id,
				status: 'awaiting-payment',
			},
			expiresAt: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(), // 6 hours from now
		},
	});

	return {
		success: true,
		message: checkout.url,
	};
}
