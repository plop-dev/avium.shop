'use client';

import { Search } from 'lucide-react';
import SortBy from '@/components/shop/SortBy';
import SearchInput from '@/components/shop/Search';
import { BoneSuspense } from 'boneyard-js/react';

export function ShopInputs() {
	return (
		<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
			<div className='relative w-full sm:w-72'>
				<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
				<BoneSuspense name='search-input'>
					<SearchInput></SearchInput>
				</BoneSuspense>
			</div>

			<div className='flex items-center gap-2'>
				<span className='text-sm'>Sort by:</span>
				<BoneSuspense name='sort-by'>
					<SortBy></SortBy>
				</BoneSuspense>
			</div>
		</div>
	);
}
