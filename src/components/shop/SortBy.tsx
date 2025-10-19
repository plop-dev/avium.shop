'use client';

import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { parseAsString, useQueryState } from 'nuqs';

export default function SortBy() {
	// const [selectedSort, setSelectedSort] = useState('newest');
	const [selectedSort, setSelectedSort] = useQueryState('sort', parseAsString.withDefault('createdAt').withOptions({ shallow: false }));

	return (
		<Select defaultValue='-createdAt' value={selectedSort} onValueChange={value => setSelectedSort(value)}>
			<SelectTrigger className='w-40'>
				<SelectValue placeholder='Sort by' />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value='-createdAt'>Newest</SelectItem>
				<SelectItem value='price'>Price: Low to High</SelectItem>
				<SelectItem value='-price'>Price: High to Low</SelectItem>
				<SelectItem value='-orders'>Most Popular</SelectItem>
			</SelectContent>
		</Select>
	);
}
