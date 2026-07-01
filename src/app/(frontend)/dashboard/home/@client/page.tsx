import { getPayload } from 'payload';
import config from '@payload-config';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import type { Order as PayloadOrder } from '@/payload-types';
import { getUser } from '@/utils/getUser';
import numToGBP from '@/utils/numToGBP';
import { RetryCheckoutButton } from '@/components/dashboard/RetryCheckoutButton';
import { AlertCircle, ArrowRight, CalendarDays, Clock3, CreditCard, Package2 } from 'lucide-react';

const statusMeta: Record<
	PayloadOrder['status']['currentStatus'],
	{
		label: string;
		description: string;
		badge: 'default' | 'secondary' | 'destructive' | 'outline';
	}
> = {
	'in-queue': { label: 'Queued', description: 'Waiting to enter production', badge: 'secondary' },
	printing: { label: 'Printing', description: 'Currently being produced', badge: 'default' },
	packaging: { label: 'Packaging', description: 'Being prepared for dispatch', badge: 'outline' },
	shipped: { label: 'Shipped', description: 'On the way to you', badge: 'secondary' },
	cancelled: { label: 'Cancelled', description: 'This order was cancelled', badge: 'destructive' },
};

const statusTimeline = ['in-queue', 'printing', 'packaging', 'shipped'] as const;

type TimelineNode = {
	label: string;
	description: string;
	state: 'complete' | 'current' | 'upcoming';
	timestamp?: string;
};

function formatOrderDate(date: string) {
	return format(new Date(date), 'd MMM yyyy');
}

function formatPaymentAmount(order: PayloadOrder) {
	if (typeof order.payment?.amount === 'number') {
		return numToGBP(order.payment.amount);
	}

	return numToGBP(order.pricing.total || 0);
}

function getPrintTitle(print: PayloadOrder['prints'][number]) {
	if (print.blockType === 'customPrint') {
		return print.model.filename;
	}

	if (typeof print.product === 'string') {
		return 'Shop Product';
	}

	return print.product.name;
}

function getPrintDescription(print: PayloadOrder['prints'][number]) {
	if (print.blockType === 'customPrint') {
		const parts = [print.printingOptions.plastic, print.printingOptions.colour];

		if (print.printingOptions.layerHeight) parts.push(`${print.printingOptions.layerHeight} mm`);
		if (print.printingOptions.infill) parts.push(`${print.printingOptions.infill}% infill`);

		return parts.join(' · ');
	}

	return typeof print.product === 'string' ? `Product ID: ${print.product}` : print.product.description;
}

function getTimelineNodes(status: PayloadOrder['status']['currentStatus'], statuses: PayloadOrder['status']['statuses']): TimelineNode[] {
	// Create a map of stage to timestamp for quick lookup
	const statusMap = new Map(statuses?.map(s => [s.stage, s.timestamp]) || []);

	if (status === 'cancelled') {
		return [
			{
				label: 'Queued',
				description: 'Order created and waiting to start',
				state: 'complete',
				timestamp: statusMap.get('in-queue'),
			},
			{
				label: 'Cancelled',
				description: 'This order was cancelled',
				state: 'current',
				timestamp: statusMap.get('cancelled'),
			},
		];
	}

	const currentIndex = statusTimeline.indexOf(status as (typeof statusTimeline)[number]);

	return statusTimeline.map((step, index) => ({
		label: statusMeta[step].label,
		description: statusMeta[step].description,
		state: index < currentIndex ? 'complete' : index === currentIndex ? 'current' : 'upcoming',
		timestamp: statusMap.get(step),
	}));
}

function getPaymentStatusVariant(status?: NonNullable<PayloadOrder['payment']>['status']) {
	if (status === 'paid') return 'default' as const;
	if (status === 'failed' || status === 'checkout-failed') return 'destructive' as const;

	return 'outline' as const;
}

function formatShippingAddress(address?: PayloadOrder['shippingAddress']) {
	if (!address) return 'N/A';

	const parts = [address.line1];
	if (address.line2) parts.push(address.line2);
	if (address.city) parts.push(address.city);
	if (address.county) parts.push(address.county);
	if (address.postcode) parts.push(address.postcode);
	if (address.country) parts.push(address.country);

	return parts.filter(Boolean).join(', ');
}

export default async function ClientPage() {
	const payload = await getPayload({ config });
	const user = await getUser();

	if (!user) redirect('/auth/login');

	// user's orders
	const orders = await payload.find({
		collection: 'orders',
		where: {
			customer: {
				equals: user.id,
			},
		},
		limit: 10,
		page: 1,
		sort: '-createdAt',
		overrideAccess: true,
	});

	// how many order have a higher priority
	const queueMap = new Map<string, number>();

	orders.docs.forEach(async order => {
		const res = await payload.db.count({
			collection: 'orders',
			where: {
				queue: {
					greater_than: order.queue,
				},
			},
		});

		queueMap.set(order.id, res.totalDocs);
	});

	const totalOrders = orders.totalDocs;
	const activeOrders = orders.docs.filter(order => !['shipped', 'cancelled'].includes(order.status.currentStatus)).length;
	const totalSpent = orders.docs.reduce((sum, order) => sum + (order.pricing.total || 0), 0);
	const latestOrder = orders.docs[0];

	return (
		<div className='@container/main flex flex-1 flex-col gap-4 px-4 py-5 md:px-6 lg:px-8'>
			<Card className='border-border/70 bg-gradient-to-br from-card via-card to-muted/30 shadow-sm'>
				<CardContent className='flex flex-col gap-4 p-4 @3xl/main:flex-row @3xl/main:items-center @3xl/main:justify-between'>
					<div className='space-y-2'>
						<Badge variant='secondary' className='w-fit'>
							Orders overview
						</Badge>
						<div className='space-y-1'>
							<h1 className='text-2xl font-semibold tracking-tight'>Your orders</h1>
							<p className='max-w-2xl text-sm text-muted-foreground'>
								Compact read-only summary of your recent orders, with related fields grouped together and the status shown
								as a timeline.
							</p>
						</div>
					</div>

					<div className='flex flex-wrap items-center gap-2'>
						<Badge variant='outline' className='gap-1.5 px-3 py-1.5'>
							<Package2 className='size-3.5' />
							{totalOrders} orders
						</Badge>
						<Badge variant='outline' className='gap-1.5 px-3 py-1.5'>
							<Clock3 className='size-3.5' />
							{activeOrders} active
						</Badge>
						<Badge variant='outline' className='gap-1.5 px-3 py-1.5'>
							<CreditCard className='size-3.5' />
							{numToGBP(totalSpent)} spent
						</Badge>
						<Button asChild variant='outline' size='sm' className='w-fit'>
							<Link href='/order'>
								<Package2 data-icon='inline-start' />
								New order
								<ArrowRight data-icon='inline-end' />
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>

			{orders.docs.length === 0 ? (
				<Card className='border-dashed'>
					<CardHeader className='items-center py-6 text-center'>
						<div className='flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground'>
							<Package2 className='size-5' />
						</div>
						<CardTitle className='mt-2 text-lg'>No orders yet</CardTitle>
						<CardDescription className='max-w-md'>
							When you place your first order, it will appear here with the key details grouped into a compact card.
						</CardDescription>
					</CardHeader>
					<CardContent className='flex justify-center pb-6'>
						<Button asChild>
							<Link href='/order'>
								Start a new order
								<ArrowRight data-icon='inline-end' />
							</Link>
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className='grid gap-4'>
					<Card>
						<CardHeader className='flex flex-row items-center justify-between gap-4 border-b py-4'>
							<div className='space-y-1'>
								<CardTitle className='text-lg'>Recent orders</CardTitle>
								<CardDescription>Most recent orders appear first in a compact grouped layout.</CardDescription>
							</div>
							<Badge variant='outline' className='hidden sm:inline-flex'>
								{latestOrder ? `Latest: ${formatOrderDate(latestOrder.createdAt)}` : 'Latest order'}
							</Badge>
						</CardHeader>
						<CardContent className='flex flex-col gap-10 p-4'>
							{orders.docs.map((order, i) => {
								const timelineNodes = getTimelineNodes(order.status.currentStatus, order.status.statuses);
								const paymentVariant = getPaymentStatusVariant(order.payment?.status);
								const isCancelled = order.status.currentStatus === 'cancelled';

								return (
									<Card
										key={order.id}
										className={`gap-0 overflow-hidden border-border/70 py-0 shadow-none ${
											isCancelled ? 'border-destructive/40' : ''
										}`}>
										<CardHeader className={`py-3 border-b ${isCancelled ? 'bg-destructive/10' : 'bg-muted/20'}`}>
											<div className='flex flex-wrap items-start justify-between gap-3'>
												<div className='space-y-2'>
													<div className='flex flex-wrap items-center gap-2'>
														<CardTitle className='text-base flex gap-2 relative'>
															<span className='bg-primary -left-1 relative p-1 h-6 w-6 flex items-center justify-center rounded-full text-white'>
																{i + 1}
															</span>{' '}
															{order.name}
														</CardTitle>
														{isCancelled ? (
															<Badge variant='destructive' className='gap-1'>
																<AlertCircle className='size-3.5' />
																Cancelled
															</Badge>
														) : (
															<Badge variant='secondary'>Queue #{queueMap.get(order.id) || 0 + 1}</Badge>
														)}
													</div>
													<CardDescription className='flex flex-wrap items-center gap-3 text-xs'>
														<span className='inline-flex items-center gap-1.5'>
															<CalendarDays className='size-3.5' />
															Placed {formatOrderDate(order.createdAt)}
														</span>
														<span className='inline-flex items-center gap-1.5'>
															<Clock3 className='size-3.5' />
															{formatDistanceToNow(new Date(order.updatedAt), { addSuffix: true })}
														</span>
													</CardDescription>
												</div>
												<div className='text-right'>
													<p className='text-xs text-muted-foreground'>Order total</p>
													<p className='text-lg font-semibold tabular-nums'>
														{numToGBP(order.pricing.total || 0)}
													</p>
												</div>
											</div>
										</CardHeader>

										{isCancelled ? (
											<Alert variant='destructive' className='m-4 mb-0 border-destructive/40 bg-destructive/5'>
												<AlertCircle />
												<AlertTitle>This order was cancelled</AlertTitle>
												<AlertDescription>
													{order.comments || 'No reason was provided for this cancellation.'}
												</AlertDescription>
											</Alert>
										) : null}

										<CardContent
											className={`grid gap-4 p-4 @4xl/main:grid-cols-[minmax(0,1.15fr)_minmax(240px,0.85fr)] ${
												isCancelled ? 'pointer-events-none opacity-60' : ''
											}`}>
											<div className='space-y-4'>
												<div className='grid gap-3 @2xl/main:grid-cols-2'>
													<div className='rounded-lg border bg-background/60 p-3 text-sm'>
														<p className='text-xs uppercase tracking-wide text-muted-foreground'>Overview</p>
														<div className='mt-2 grid grid-cols-2 gap-x-4 gap-y-2'>
															<div className='text-muted-foreground'>Queue</div>
															<div className='text-right font-medium tabular-nums'>
																#{queueMap.get(order.id) || 0 + 1}
															</div>
															<div className='text-muted-foreground'>Placed</div>
															<div className='text-right font-medium'>{formatOrderDate(order.createdAt)}</div>
															<div className='text-muted-foreground'>Updated</div>
															<div className='text-right font-medium'>
																{formatDistanceToNow(new Date(order.updatedAt), { addSuffix: true })}
															</div>
															<div className='text-muted-foreground'>Receipt</div>
															<div className='text-right font-medium tabular-nums'>
																{order.payment?.receiptUrl ? (
																	<Link
																		href={order.payment.receiptUrl}
																		target='_blank'
																		rel='noopener noreferrer'
																		className='underline'>
																		View receipt
																	</Link>
																) : (
																	'N/A'
																)}
															</div>
															<div className='text-muted-foreground'>Total</div>
															<div className='text-right font-medium tabular-nums'>
																{numToGBP(order.pricing.total || 0)}
															</div>
														</div>
													</div>

													<div className='rounded-lg border bg-background/60 p-3 text-sm'>
														<p className='text-xs uppercase tracking-wide text-muted-foreground'>Details</p>
														<div className='mt-2 grid grid-cols-[1fr_2fr] gap-x-4 gap-y-2'>
															<div className='text-muted-foreground'>Payment Status</div>
															<div className='text-right'>
																<Badge variant={paymentVariant}>{order.payment?.status || 'unpaid'}</Badge>
																{order.payment?.status === 'checkout-failed' ? (
																	<div className='mt-2 flex justify-end'>
																		<RetryCheckoutButton orderId={order.id} />
																	</div>
																) : null}
															</div>

															<div className='text-muted-foreground'>Tracking Number</div>
															<div className='text-right font-medium tabular-nums'>
																{order.shipping?.trackingNumber || 'N/A'}
															</div>

															<div className='text-muted-foreground'>Tracking URL</div>
															<div className='text-right font-medium tabular-nums'>
																{order.shipping?.trackingUrl ? (
																	<Link
																		href={order.shipping.trackingUrl}
																		target='_blank'
																		rel='noopener noreferrer'
																		className='underline'>
																		View tracking page
																	</Link>
																) : (
																	'N/A'
																)}
															</div>

															<div className='text-muted-foreground'>Shipping Address</div>
															<div className='text-right font-medium tabular-nums'>
																{formatShippingAddress(order.shippingAddress)}
															</div>
														</div>
													</div>
												</div>

												<div className='rounded-lg border bg-muted/20 p-3'>
													<div className='flex items-center justify-between gap-3'>
														<div>
															<p className='text-sm font-medium'>Items</p>
															<p className='text-xs text-muted-foreground'>
																Grouped by item with quantity and completion state.
															</p>
														</div>
														<Badge variant='secondary'>
															{order.prints.length} item{order.prints.length === 1 ? '' : 's'}
														</Badge>
													</div>
													<Separator className='my-3' />
													<div className='space-y-2'>
														{order.prints.map((item, index) => (
															<div
																key={item.id || `${item.blockType}-${index}`}
																className='grid gap-2 rounded-md bg-background px-3 py-2 text-sm @2xl/main:grid-cols-[minmax(0,1fr)_auto_auto] @2xl/main:items-center'>
																<div className='min-w-0 space-y-0.5'>
																	<p className='truncate font-medium'>{getPrintTitle(item)}</p>
																	<p className='truncate text-xs text-muted-foreground'>
																		{getPrintDescription(item)}
																	</p>
																	<Badge
																		variant='secondary'
																		style={{
																			backgroundColor:
																				item.blockType === 'customPrint'
																					? item.printingOptions.colour
																					: item.colour,
																		}}
																		className='text-xs'>
																		<p
																			className='contrast-[9000] invert grayscale brightness-[1.5]'
																			style={{
																				color:
																					item.blockType === 'customPrint'
																						? item.printingOptions.colour
																						: item.colour,
																			}}>
																			{item.blockType === 'customPrint'
																				? item.printingOptions.colour
																				: item.colour}
																		</p>
																	</Badge>
																</div>
																<div className='flex items-center gap-2 text-xs text-muted-foreground sm:justify-end'>
																	<span className='font-medium tabular-nums text-foreground'>
																		{item.quantity}
																	</span>
																	qty
																</div>
																<div className='flex items-center gap-2 sm:justify-end'>
																	<span className='font-medium tabular-nums'>
																		{numToGBP(item.price * item.quantity)}
																	</span>
																	<Badge
																		variant={item.completed ? 'success' : 'outline'}
																		className='shrink-0'>
																		{item.completed ? 'Printed' : 'Not yet printed'}
																	</Badge>
																</div>
															</div>
														))}
													</div>
												</div>
											</div>

											<div className='rounded-lg border bg-background/60 p-3 grid grid-cols-1 grid-rows-[4fr_1fr]'>
												<div>
													<div className='flex items-center justify-between gap-3'>
														<div>
															<p className='text-sm font-medium'>Status timeline</p>
															<p className='text-xs text-muted-foreground'>
																Current position in the order workflow.
															</p>
														</div>
														<Badge
															variant={
																order.status.currentStatus === 'cancelled' ? 'destructive' : 'secondary'
															}
															className='shrink-0'>
															{order.status.currentStatus === 'cancelled'
																? 'Cancelled'
																: statusMeta[order.status.currentStatus].label}
														</Badge>
													</div>
													<Separator className='my-3' />
													<ol className='space-y-3 min-h-52 h-full'>
														{timelineNodes.map((node, index) => {
															const isCurrent = node.state === 'current';
															const isComplete = node.state === 'complete';

															return (
																<li key={node.label} className='flex gap-3 h-[20%]'>
																	<div className='flex flex-col items-center'>
																		<div
																			className={[
																				'flex size-7 items-center justify-center rounded-full border text-xs font-medium',
																				isCurrent
																					? 'border-primary bg-primary text-primary-foreground'
																					: isComplete
																						? 'border-primary/40 bg-primary/10 text-primary'
																						: 'border-border bg-muted text-muted-foreground',
																			].join(' ')}>
																			{isCurrent ? '•' : index + 1}
																		</div>
																		{index < timelineNodes.length - 1 ? (
																			<div className='h-full w-px bg-border' aria-hidden='true' />
																		) : null}
																	</div>
																	<div className='min-w-0 pb-1'>
																		<p className='font-medium leading-none'>{node.label}</p>
																		{node.timestamp ? (
																			<p className='mt-1 text-xs font-medium text-foreground'>
																				{format(new Date(node.timestamp), 'd MMM yyyy HH:mm')}
																			</p>
																		) : null}
																		<p className='mt-1 text-xs text-muted-foreground'>
																			{node.description}
																		</p>
																	</div>
																</li>
															);
														})}
													</ol>
												</div>

												<Separator className='mt-12' />

												{isCancelled ? null : (
													<Alert className='border-dashed'>
														<AlertCircle />
														<AlertTitle>Order notes</AlertTitle>
														<AlertDescription>{order.comments || 'N/A'}</AlertDescription>
													</Alert>
												)}
											</div>
										</CardContent>
									</Card>
								);
							})}
						</CardContent>
					</Card>
				</div>
			)}
		</div>
	);
}
