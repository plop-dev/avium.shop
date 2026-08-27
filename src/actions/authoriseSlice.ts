'use server';

import { getPayload } from 'payload';
import config from '@payload-config';

import { getUser } from '@/utils/getUser';
import { createSliceToken } from '@/lib/sliceToken';

export async function authoriseSlice(quoteId: string) {
	const user = await getUser();

	if (!user?.id) {
		throw new Error('Not authenticated');
	}

	const payload = await getPayload({ config });

	const userDoc = await payload.findByID({
		collection: 'users',
		id: user.id,
	});

	try {
		// checking the user owns the quote and has permission
		await payload.findByID({
			collection: 'quotes',
			id: quoteId,
			overrideAccess: false,
			user: userDoc,
		});
	} catch {
		throw new Error('Quote not found or not authorised');
	}

	return createSliceToken({
		v: 1,
		userId: user.id,
		quoteId,
		exp: Date.now() + 15 * 60 * 1000,
	});
}
