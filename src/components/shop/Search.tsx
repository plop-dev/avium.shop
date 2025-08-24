'use client';

import { Input } from '@/components/ui/input';
import { useQueryState, parseAsString, debounce } from 'nuqs';

export default function SearchInput() {
	const [search, setSearch] = useQueryState('search', parseAsString.withDefault('').withOptions({ shallow: false }));

	return (
		<Input
			type='search'
			placeholder='Search products...'
			value={search}
			onChange={e =>
				setSearch(e.target.value, {
					// Send immediate update if resetting, otherwise debounce at 500ms
					limitUrlUpdates: e.target.value === '' ? undefined : debounce(500),
				})
			}
			onKeyDown={e => {
				if (e.key === 'Enter') {
					// Send immediate update
					setSearch((e.target as HTMLInputElement).value);
				}
			}}
			className='pl-8'
		/>
	);
}
