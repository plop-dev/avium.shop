import { Box, BoxSelect, CirclePoundSterling, PoundSterling, ShoppingBag, TrendingDown, TrendingUp, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { getPayload } from 'payload';
import config from '@payload-config';
import numToGBP from '@/utils/numToGBP';
import { Order } from '@/payload-types';

export async function SectionCards() {
	const payload = await getPayload({ config });

	const orders = await payload.find({
		collection: 'orders',
		select: {
			pricing: true,
			prints: true,
			createdAt: true,
		},
		limit: 0,
	});

	const ordersLastMonth = await payload.find({
		collection: 'orders',
		where: {
			createdAt: {
				greater_than: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
			},
		},
		select: {
			prints: true,
			createdAt: true,
			pricing: true,
		},
		limit: 0,
	});

	const users = await payload.find({
		collection: 'users',
		select: {
			createdAt: true,
		},
		limit: 0,
	});

	const usersLastMonth = await payload.find({
		collection: 'users',
		where: {
			createdAt: {
				greater_than: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(),
			},
		},
		select: {
			createdAt: true,
		},
		limit: 0,
	});

	const incomeLastMonth = ordersLastMonth.docs.reduce((total: number, order) => total + (order.pricing.total || 0), 0);
	const lifetimeIncome = orders.docs.reduce((total: number, order) => total + (order.pricing.total || 0), 0);

	return (
		<div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
			<Card className='@container/card'>
				<CardHeader>
					<CardDescription>Orders This Month</CardDescription>
					<CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center'>
						<Box className='mr-2' /> {ordersLastMonth.totalDocs}
					</CardTitle>
					{/* <CardAction>
						<Badge variant='outline'>
							<TrendingUp />
							+12.5%
						</Badge>
					</CardAction> */}
				</CardHeader>
				<CardFooter className='flex-col items-start gap-1.5 text-sm'>
					<div className='line-clamp-1 flex gap-2 font-medium'>Total Orders (Lifetime): {orders.totalDocs}</div>
					{/* <div className='text-muted-foreground'>180 Lifetime Orders</div> */}
				</CardFooter>
			</Card>

			<Card className='@container/card'>
				<CardHeader>
					<CardDescription>Income This Month</CardDescription>
					<CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center gap-x-2'>
						<CirclePoundSterling />
						{numToGBP(incomeLastMonth)}
					</CardTitle>
					{/* <CardAction>
						<Badge variant='outline'>
							<TrendingUp />
							+4.5%
						</Badge>
					</CardAction> */}
				</CardHeader>
				<CardFooter className='flex-col items-start gap-1.5 text-sm'>
					<div className='line-clamp-1 flex gap-2 font-medium'>Total Income (Lifetime): {numToGBP(lifetimeIncome)}</div>
					{/* <div className='text-muted-foreground'>Meets growth projections</div> */}
				</CardFooter>
			</Card>

			<Card className='@container/card'>
				<CardHeader>
					<CardDescription>Prints This Month</CardDescription>
					<CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center gap-x-2'>
						<BoxSelect className='mr-2'></BoxSelect>
						{ordersLastMonth.docs
							.map(order => order.prints?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0)
							.reduce((a, b) => a + b, 0)}
					</CardTitle>
					{/* <CardAction>
						<Badge variant='outline'>
							<TrendingUp />
							+12.5%
						</Badge>
					</CardAction> */}
				</CardHeader>
				<CardFooter className='flex-col items-start gap-1.5 text-sm'>
					<div className='line-clamp-1 flex gap-2 font-medium'>Total Prints (Lifetime): {orders.totalDocs}</div>
					{/* <div className='text-muted-foreground'>Engagement exceed targets</div> */}
				</CardFooter>
			</Card>

			<Card className='@container/card'>
				<CardHeader>
					<CardDescription>New Customers This Month</CardDescription>
					<CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center'>
						<User className='mr-2'></User>
						{usersLastMonth.totalDocs}
					</CardTitle>
					{/* <CardAction>
						<Badge variant='outline'>
							<TrendingDown />
							-20%
						</Badge>
					</CardAction> */}
				</CardHeader>
				<CardFooter className='flex-col items-start gap-1.5 text-sm'>
					<div className='line-clamp-1 flex gap-2 font-medium'>Total Customers (Lifetime): {users.totalDocs}</div>
					{/* <div className='text-muted-foreground'>Acquisition needs attention</div> */}
				</CardFooter>
			</Card>
		</div>
	);
}
