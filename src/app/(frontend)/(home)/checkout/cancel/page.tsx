import Link from 'next/link';
import { AlertCircle, ArrowRight, LayoutDashboard, ShoppingBag } from 'lucide-react';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

function getOrderId(searchParams: { order_id?: string | string[] }) {
	if (!searchParams.order_id) return undefined;

	return Array.isArray(searchParams.order_id) ? searchParams.order_id[0] : searchParams.order_id;
}

export default async function CheckoutCancelPage({ searchParams }: { searchParams: Promise<{ order_id?: string | string[] }> }) {
	const orderId = getOrderId(await searchParams);

	return (
		<main className='relative isolate overflow-hidden px-4 py-8 sm:px-6 lg:px-8'>
			<div className='absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.14),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(249,115,22,0.12),transparent_30%),linear-gradient(to_bottom,rgba(255,255,255,0.96),rgba(246,248,255,0.88))]' />
			<div className='mx-auto flex min-h-[calc(100vh-8rem)] max-w-4xl items-center'>
				<Card className='w-full overflow-hidden border-border/70 bg-background/90 shadow-xl backdrop-blur'>
					<CardHeader className='border-b bg-muted/30 pb-5'>
						<div className='flex flex-wrap items-start justify-between gap-4'>
							<div className='space-y-3'>
								<Badge variant='outline' className='border-amber-500/40 bg-amber-500/5 text-amber-700'>
									Checkout cancelled
								</Badge>
								<div className='space-y-2'>
									<CardTitle className='text-3xl tracking-tight'>Payment not completed</CardTitle>
									<CardDescription className='max-w-2xl text-base'>
										Your checkout session was cancelled before payment was finished.
									</CardDescription>
								</div>
							</div>
							<div className='flex size-12 items-center justify-center rounded-2xl border bg-background text-amber-700 shadow-sm'>
								<AlertCircle className='size-5' />
							</div>
						</div>
					</CardHeader>

					<CardContent className='grid gap-6 p-6 md:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.9fr)] md:p-8'>
						<div className='space-y-5'>
							<Alert>
								<AlertCircle className='size-4' />
								<AlertTitle>No payment outcome was recorded</AlertTitle>
								<AlertDescription>
									This is not a successful payment and not a failed payment. The payment was simply not completed.
								</AlertDescription>
							</Alert>

							<div className='rounded-2xl border bg-background/80 p-5 shadow-sm'>
								<p className='text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground'>
									What you can do next
								</p>
								<div className='mt-4 grid gap-4'>
									<div className='rounded-xl border bg-muted/20 p-4'>
										<div className='flex items-center gap-2 text-sm font-semibold'>
											<ShoppingBag className='size-4' />
											Return to order
										</div>
										<p className='mt-2 text-sm text-muted-foreground'>
											Go back to the order flow to review your basket and start checkout again when you are ready.
										</p>
									</div>

									<div className='rounded-xl border bg-muted/20 p-4'>
										<div className='flex items-center gap-2 text-sm font-semibold'>
											<LayoutDashboard className='size-4' />
											Go to dashboard
										</div>
										<p className='mt-2 text-sm text-muted-foreground'>
											Open your dashboard to check existing orders and payment statuses before deciding your next
											step.
										</p>
									</div>
								</div>
							</div>
						</div>

						<div className='space-y-4'>
							<Card className='border-border/70 bg-muted/20 shadow-none'>
								<CardHeader className='pb-3'>
									<CardTitle className='text-sm uppercase tracking-[0.18em] text-muted-foreground'>
										Session info
									</CardTitle>
								</CardHeader>
								<CardContent className='grid gap-3 pb-5 text-sm'>
									<div className='flex items-center justify-between gap-4'>
										<span className='text-muted-foreground'>Order reference</span>
										<span className='font-medium'>{orderId ?? 'Unavailable'}</span>
									</div>
									<div className='flex items-center justify-between gap-4'>
										<span className='text-muted-foreground'>Payment state</span>
										<span className='font-medium'>Not completed</span>
									</div>
								</CardContent>
							</Card>

							<div className='flex flex-col gap-3'>
								<Button asChild className='w-full'>
									<Link href='/order'>
										Return to order
										<ArrowRight data-icon='inline-end' />
									</Link>
								</Button>
								<Button asChild variant='outline' className='w-full'>
									<Link href='/dashboard/home'>Go to dashboard</Link>
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>
		</main>
	);
}
