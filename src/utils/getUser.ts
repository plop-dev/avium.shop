import { auth } from '@/auth';
import { User } from 'next-auth';
import { cache } from 'react';

export const getUser = cache(async (): Promise<User | null> => {
	const session = await auth();

	if (!session?.user) {
		return null; // User is not authenticated
	}

	return session.user; // Return the authenticated user
});
