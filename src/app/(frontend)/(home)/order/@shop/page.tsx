import { Search, Printer } from 'lucide-react';
import { getPayload } from 'payload';
import config from '@payload-config';
import { loadSearchParams } from './searchParams';
import { SearchParams } from 'nuqs';
import ShopProduct from '@/components/shop/ShopProduct';
import SortBy from '@/components/shop/SortBy';
import SearchInput from '@/components/shop/Search';
import { Product } from '@/payload-types';

export default async function Shop({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const { page, sort, search } = await loadSearchParams(searchParams);
	const payload = await getPayload({ config });

	const products = await payload.find({
		collection: 'products',
		pagination: true,
		limit: 15,
		page: page,
		sort: sort,
		where: {
			name: {
				like: search,
			},
		},
	});

	return (
		<div className='flex flex-col gap-y-4'>
			<div className=''>
				<h2 className='p-0'>Shop</h2>
				<p className='text-muted-foreground'>Browse and discover our ready-made products</p>
			</div>

			<div className='flex items-center justify-between mb-2'>
				<div className='relative w-72'>
					<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
					<SearchInput></SearchInput>
				</div>

				<div className='flex items-center gap-2'>
					<span className='text-sm'>Sort by:</span>
					<SortBy></SortBy>
				</div>
			</div>

			<div className='grid grid-cols-3 gap-4 pb-0.5'>
				{products.docs.map((product, i) => (
					<ShopProduct key={i} product={product}></ShopProduct>
				))}
			</div>
		</div>
	);
}
