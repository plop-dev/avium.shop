import { createLoader, parseAsInteger } from 'nuqs/server';

export const adminDashboardSearchParams = {
	limit: parseAsInteger.withDefault(10),
	page: parseAsInteger.withDefault(1),
};

export const loadSearchParams = createLoader(adminDashboardSearchParams);
