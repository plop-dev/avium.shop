'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Clock3, LoaderCircle, ShieldAlert } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type PaymentStatus =
	| 'awaiting-payment'
	| 'paid'
	| 'failed'
	| 'refunded'
	| 'partially-refunded'
	| 'cancelled'
	| 'expired'
	| null
	| undefined;
type ViewState = 'waiting' | 'confirmed' | 'failed' | 'invalid';

function getViewState(paymentStatus: PaymentStatus): ViewState {
	if (paymentStatus === 'paid' || paymentStatus === 'refunded' || paymentStatus === 'partially-refunded') return 'confirmed';
	if (paymentStatus === 'failed' || paymentStatus === 'cancelled' || paymentStatus === 'expired') return 'failed';
	if (paymentStatus === 'awaiting-payment') return 'waiting';

	return 'invalid';
}

function StateIcon({ state }: { state: ViewState }) {
	if (state === 'confirmed') return <CheckCircle2 className='size-5' />;
	if (state === 'waiting') return <LoaderCircle className='size-5 animate-spin' />;
	if (state === 'failed') return <AlertCircle className='size-5' />;

	return <ShieldAlert className='size-5' />;
}

function StateBadge({ state }: { state: ViewState }) {
	if (state === 'confirmed') return <Badge variant='success'>Payment confirmed</Badge>;
	if (state === 'waiting') return <Badge variant='outline'>Waiting for confirmation</Badge>;
	if (state === 'failed') return <Badge variant='destructive'>Payment not completed</Badge>;

	return <Badge variant='destructive'>Invalid session</Badge>;
}

export function CheckoutStatusClient({ orderId }: { orderId?: string }) {
	const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('awaiting-payment');
	const [slowNotice, setSlowNotice] = useState(false);
	const viewState = useMemo(() => (orderId ? getViewState(paymentStatus) : 'invalid'), [orderId, paymentStatus]);

	useEffect(() => {
		if (!orderId) return;

		let cancelled = false;
		let timerId: number;
		let intervalId: number;

		const fetchOrder = async () => {
			try {
				const response = await fetch(`/api/orders/${orderId}`, {
					method: 'GET',
					credentials: 'include',
					cache: 'no-store',
				});

				if (!response.ok) return;

				const order = await response.json();
				const nextStatus = order?.payment?.status as PaymentStatus;

				if (!cancelled && nextStatus) {
					setPaymentStatus(nextStatus);

					if (nextStatus !== 'awaiting-payment') {
						if (intervalId) window.clearInterval(intervalId);
						if (timerId) window.clearTimeout(timerId);
					}
				}
			} catch {
				// keep polling; transient failures should not interrupt the page
			}
		};

		fetchOrder();
		intervalId = window.setInterval(fetchOrder, 3000);
		timerId = window.setTimeout(() => setSlowNotice(true), 12000);

		return () => {
			cancelled = true;
			if (intervalId) window.clearInterval(intervalId);
			if (timerId) window.clearTimeout(timerId);
		};
	}, [orderId]);

	const title =
		viewState === 'confirmed'
			? 'Payment confirmed'
			: viewState === 'waiting'
				? 'Waiting for confirmation'
				: viewState === 'failed'
					? 'Payment not completed'
					: 'Invalid session';

	const description =
		viewState === 'confirmed'
			? 'Your payment is complete.'
			: viewState === 'waiting'
				? 'We are still checking the order.'
				: viewState === 'failed'
					? 'The checkout was opened, but payment was not completed.'
					: 'We could not verify this checkout session.';

	return (
		<main className='mx-auto flex min-h-[calc(100vh-8rem)] max-w-2xl items-center px-4 py-8 sm:px-6 lg:px-8'>
			<Card className='w-full border-border/70 shadow-sm'>
				<CardHeader className='space-y-4 pb-4'>
					<div className='flex items-start justify-between gap-4'>
						<div className='space-y-3'>
							<StateBadge state={viewState} />
							<div className='space-y-1'>
								<CardTitle className='text-2xl tracking-tight'>{title}</CardTitle>
								<CardDescription className='max-w-xl'>{description}</CardDescription>
							</div>
						</div>
						<div className='flex size-11 items-center justify-center rounded-full border bg-background text-foreground'>
							<StateIcon state={viewState} />
						</div>
					</div>
				</CardHeader>

				<CardContent className='space-y-5 pb-6'>
					<div className='rounded-lg border bg-muted/20 px-4 py-3 text-sm text-muted-foreground'>
						{viewState === 'confirmed'
							? 'This page will stop polling once the order is confirmed.'
							: viewState === 'waiting'
								? 'This page checks the order every 3 seconds until payment.status changes.'
								: viewState === 'failed'
									? 'You can return to the order and try again when you are ready.'
									: 'Please start a new checkout from the order page.'}
					</div>

					{viewState === 'waiting' && slowNotice ? (
						<div className='space-y-4 rounded-lg border bg-background p-4'>
							<div className='flex items-start gap-3'>
								<Clock3 className='mt-0.5 size-4 text-muted-foreground' />
								<div className='space-y-1'>
									<p className='text-sm font-medium'>This is taking longer than expected.</p>
									<p className='text-sm text-muted-foreground'>
										You can stay here while we keep checking, or move to another page and come back later.
									</p>
								</div>
							</div>

							<div className='flex flex-col gap-3 sm:flex-row'>
								<Button asChild className='w-full sm:w-auto'>
									<Link href='/order'>Return to order</Link>
								</Button>
								<Button asChild variant='outline' className='w-full sm:w-auto'>
									<Link href='/dashboard/home'>Go to dashboard</Link>
								</Button>
							</div>
						</div>
					) : null}

					{viewState === 'confirmed' || viewState === 'failed' ? (
						<div className='flex flex-col gap-3 sm:flex-row'>
							<Button asChild className='w-full sm:w-auto'>
								<Link href='/dashboard/home'>Go to dashboard</Link>
							</Button>
							<Button asChild variant='outline' className='w-full sm:w-auto'>
								<Link href='/order'>Return to order</Link>
							</Button>
						</div>
					) : null}

					{viewState === 'invalid' ? (
						<div className='flex flex-col gap-3 sm:flex-row'>
							<Button asChild className='w-full sm:w-auto'>
								<Link href='/order'>Start a new checkout</Link>
							</Button>
							<Button asChild variant='outline' className='w-full sm:w-auto'>
								<Link href='/dashboard/home'>Go to dashboard</Link>
							</Button>
						</div>
					) : null}
				</CardContent>
			</Card>
		</main>
	);
}
