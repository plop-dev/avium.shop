'use client';

import { Search } from 'lucide-react';
import SortBy from '@/components/shop/SortBy';
import SearchInput from '@/components/shop/Search';

export function ShopInputs() {
	return (
		<div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
			<div className='relative w-full sm:w-72'>
				<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
				<SearchInput></SearchInput>
			</div>

			<div className='flex items-center gap-2'>
				<span className='text-sm'>Sort by:</span>
				<SortBy></SortBy>
			</div>
		</div>
	);
}
