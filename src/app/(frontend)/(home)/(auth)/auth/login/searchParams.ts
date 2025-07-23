import { createLoader, parseAsString } from 'nuqs/server';

export const loginMessageSearchParams = {
	error: parseAsString.withDefault(''),
	success: parseAsString.withDefault(''),
	message: parseAsString.withDefault(''),
};

export const loadSearchParams = createLoader(loginMessageSearchParams);
