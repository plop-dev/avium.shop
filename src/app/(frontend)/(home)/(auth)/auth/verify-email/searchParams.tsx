import { createLoader, parseAsStringLiteral, parseAsString } from 'nuqs/server';

export const verifyEmailSearchParams = {
	from: parseAsStringLiteral(['login', 'signup', '']).withDefault(''),
	token: parseAsString.withDefault(''),
};

export const loadSearchParams = createLoader(verifyEmailSearchParams);
