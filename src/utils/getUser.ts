import { auth } from '@/auth';
import { getPayload } from 'payload';
import config from '@payload-config';
import { headers as nextHeaders } from 'next/headers';
import { User } from 'next-auth';

export const getUser = async (): Promise<
	| User
	| (User & {
			collection: 'users';
	  })
	| null
> => {
	const session = await auth();

	if (!session?.user) {
		// user not logged in with authjs, but with local payload auth
		const headers = await nextHeaders();

		const payload = await getPayload({ config });
		const user = await payload.auth({ headers });

		return user.user;
	}

	return session?.user;
};
