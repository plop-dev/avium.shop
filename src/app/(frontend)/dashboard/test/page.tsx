import { ChartAreaInteractive } from '@/components/dashboard/chart-area-interactive';
import { DataTable, schema, type Order } from '@/components/dashboard/data-table';
import { SectionCards } from '@/components/dashboard/section-cards';

import rawOrders from './data.json';

export default function Page() {
	const data: Order[] = schema.array().parse(
		rawOrders.map(order => ({
			...order,
			comments: typeof order.comments === 'number' ? String(order.comments) : order.comments,
		})),
	);

	return (
		<div className='flex flex-1 flex-col'>
			<div className='@container/main flex flex-1 flex-col gap-2'>
				<div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
					<SectionCards />
					<div className='px-4 lg:px-6'>
						<ChartAreaInteractive />
					</div>
					<DataTable data={data} />
				</div>
			</div>
		</div>
	);
}
