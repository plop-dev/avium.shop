import { Search } from 'lucide-react';
import { getPayload } from 'payload';
import config from '@payload-config';
import { loadSearchParams } from './searchParams';
import { SearchParams } from 'nuqs';
import ShopProduct from '@/components/shop/ShopProduct';
import SortBy from '@/components/shop/SortBy';
import SearchInput from '@/components/shop/Search';
import { cacheLife, cacheTag } from 'next/cache';
import { Suspense } from 'react';
import { Input } from '@/components/ui/input';
import { BoneSuspense } from 'boneyard-js/react';
import { ShopInputs } from './ShopInputs';

async function getShopProducts(page: number, sort: string) {
	'use cache';
	cacheTag('products');
	cacheLife('hours');

	const payload = await getPayload({ config });
	return payload.find({ collection: 'products', pagination: true, limit: 9, page, sort });
}

async function ProductsList({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const { page, sort, search } = await loadSearchParams(searchParams);
	const payload = await getPayload({ config });

	const products = search
		? await payload.find({
				collection: 'products',
				pagination: true,
				limit: 9,
				page: page,
				sort: sort,
				where: {
					name: {
						like: search,
					},
				},
			})
		: await getShopProducts(page, sort);

	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-0.5'>
			{products.docs
				.filter(p => !p.archived)
				.map((product, i) => (
					<ShopProduct key={i} product={product}></ShopProduct>
				))}
		</div>
	);
}

export default function Shop({ searchParams }: { searchParams: Promise<SearchParams> }) {
	return (
		<div className='flex flex-col gap-y-6'>
			<p className='text-muted-foreground'>Browse our catalog of ready-made products to add to your order.</p>

			<Suspense>
				<ShopInputs></ShopInputs>
			</Suspense>

			<Suspense fallback={<div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-0.5' />}>
				<ProductsList searchParams={searchParams} />
			</Suspense>
		</div>
	);
}
