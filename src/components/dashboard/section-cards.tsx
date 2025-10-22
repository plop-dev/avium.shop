import { Box, BoxSelect, CirclePoundSterling, PoundSterling, ShoppingBag, TrendingDown, TrendingUp, User } from 'lucide-react';
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
					{/* <CardAction>
						<Badge variant='outline'>
							<TrendingUp />
							+12.5%
						</Badge>
					</CardAction> */}
				</CardHeader>
				<CardFooter className='flex-col items-start gap-1.5 text-sm'>
					<div className='line-clamp-1 flex gap-2 font-medium'>
						Total Orders (Lifetime): 18 <TrendingUp className='size-4' />
					</div>
					{/* <div className='text-muted-foreground'>180 Lifetime Orders</div> */}
				</CardFooter>
			</Card>

			<Card className='@container/card'>
				<CardHeader>
					<CardDescription>Income This Month</CardDescription>
					<CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center gap-x-2'>
						<CirclePoundSterling />
						130
					</CardTitle>
					{/* <CardAction>
						<Badge variant='outline'>
							<TrendingUp />
							+4.5%
						</Badge>
					</CardAction> */}
				</CardHeader>
				<CardFooter className='flex-col items-start gap-1.5 text-sm'>
					<div className='line-clamp-1 flex gap-2 font-medium'>
						Total Income (Lifetime): £350 <TrendingUp className='size-4' />
					</div>
					{/* <div className='text-muted-foreground'>Meets growth projections</div> */}
				</CardFooter>
			</Card>

			<Card className='@container/card'>
				<CardHeader>
					<CardDescription>Prints This Month</CardDescription>
					<CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center gap-x-2'>
						<BoxSelect className='mr-2'></BoxSelect>14
					</CardTitle>
					{/* <CardAction>
						<Badge variant='outline'>
							<TrendingUp />
							+12.5%
						</Badge>
					</CardAction> */}
				</CardHeader>
				<CardFooter className='flex-col items-start gap-1.5 text-sm'>
					<div className='line-clamp-1 flex gap-2 font-medium'>
						Total Prints (Lifetime): 75 <TrendingUp className='size-4' />
					</div>
					{/* <div className='text-muted-foreground'>Engagement exceed targets</div> */}
				</CardFooter>
			</Card>

			<Card className='@container/card'>
				<CardHeader>
					<CardDescription>New Customers This Month</CardDescription>
					<CardTitle className='text-2xl font-semibold tabular-nums @[250px]/card:text-3xl flex items-center'>
						<User className='mr-2'></User>32
					</CardTitle>
					{/* <CardAction>
						<Badge variant='outline'>
							<TrendingDown />
							-20%
						</Badge>
					</CardAction> */}
				</CardHeader>
				<CardFooter className='flex-col items-start gap-1.5 text-sm'>
					<div className='line-clamp-1 flex gap-2 font-medium'>
						Total Customers (Lifetime): 12 <TrendingUp className='size-4' />
					</div>
					{/* <div className='text-muted-foreground'>Acquisition needs attention</div> */}
				</CardFooter>
			</Card>
		</div>
	);
}
