import { Box, BoxSelect, ShoppingBag, TrendingDown, TrendingUp, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';

export function SectionCards() {
	return (
		<div className='*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4'>
			<Card className='@container/card'>
				<CardHeader>
					<CardDescription>Orders This Month</CardDescription>
					<CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center'>
						<Box className='mr-2' /> 43
					</CardTitle>
					<CardAction>
						<Badge variant='outline'>
							<TrendingUp />
							+12.5%
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className='flex-col items-start gap-1.5 text-sm'>
					<div className='line-clamp-1 flex gap-2 font-medium'>
						Trending up this month <TrendingUp className='size-4' />
					</div>
					{/* <div className='text-muted-foreground'>180 Lifetime Orders</div> */}
				</CardFooter>
			</Card>

			<Card className='@container/card'>
				<CardHeader>
					<CardDescription>New Customers</CardDescription>
					<CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center'>
						<User className='mr-2'></User>32
					</CardTitle>
					<CardAction>
						<Badge variant='outline'>
							<TrendingDown />
							-20%
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className='flex-col items-start gap-1.5 text-sm'>
					<div className='line-clamp-1 flex gap-2 font-medium'>
						Down 20% this period <TrendingDown className='size-4' />
					</div>
					{/* <div className='text-muted-foreground'>Acquisition needs attention</div> */}
				</CardFooter>
			</Card>

			<Card className='@container/card'>
				<CardHeader>
					<CardDescription>Shop Products Ordered</CardDescription>
					<CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center gap-x-2'>
						<ShoppingBag className='mr-2'></ShoppingBag>14
						<small className='text-muted-foreground'>(33%)</small>
					</CardTitle>
					<CardAction>
						<Badge variant='outline'>
							<TrendingUp />
							+12.5%
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className='flex-col items-start gap-1.5 text-sm'>
					<div className='line-clamp-1 flex gap-2 font-medium'>
						Strong user retention <TrendingUp className='size-4' />
					</div>
					{/* <div className='text-muted-foreground'>Engagement exceed targets</div> */}
				</CardFooter>
			</Card>

			<Card className='@container/card'>
				<CardHeader>
					<CardDescription>Custom Prints Ordered</CardDescription>
					<CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center gap-x-2'>
						<BoxSelect className='mr-2'></BoxSelect>29
						<small className='text-muted-foreground'>(67%)</small>
					</CardTitle>
					<CardAction>
						<Badge variant='outline'>
							<TrendingUp />
							+4.5%
						</Badge>
					</CardAction>
				</CardHeader>
				<CardFooter className='flex-col items-start gap-1.5 text-sm'>
					<div className='line-clamp-1 flex gap-2 font-medium'>
						Steady performance increase <TrendingUp className='size-4' />
					</div>
					{/* <div className='text-muted-foreground'>Meets growth projections</div> */}
				</CardFooter>
			</Card>
		</div>
	);
}
