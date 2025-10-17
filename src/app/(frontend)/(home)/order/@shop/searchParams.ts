import { createLoader, parseAsInteger, parseAsString, parseAsStringLiteral } from 'nuqs/server';

export const shopSearchParams = {
	page: parseAsInteger.withDefault(1),
	sort: parseAsStringLiteral(['createdAt', '-price', 'price', 'orders']).withDefault('createdAt'),
	search: parseAsString.withDefault(''),
};

export const loadSearchParams = createLoader(shopSearchParams);
