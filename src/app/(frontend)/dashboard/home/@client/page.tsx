import { getPayload } from 'payload';
import config from '@payload-config';
import { getUser } from '@/utils/getUser';

export default async function ClientPage() {
	const payload = await getPayload({ config });
	const user = await getUser();

	const orders = await payload.find({
		collection: 'orders',
		where: {
			customer: {
				equals: user?.id,
			},
		},
		limit: 0,
		overrideAccess: true,
	});

	console.log(orders.docs);

	return (
		<div className='@container/main flex flex-1 flex-col gap-2'>
			<div className='flex flex-col gap-4 py-4 md:gap-6 md:py-6'>
				<h1>content</h1>
			</div>
		</div>
	);
}
