import { Suspense } from 'react';
import { parseAsString, parseAsStringLiteral, useQueryState } from 'nuqs';
import { VerifyEmailContent } from './alertUser';
import { redirect } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';

export default async function VerifyEmailPage() {
	const payload = await getPayload({ config });
	const [from] = useQueryState<'login' | 'signup'>('from', parseAsStringLiteral(['login', 'signup']).withDefault('signup'));
	const [token] = useQueryState('token', parseAsString.withDefault(''));

	// if no token, this page is used to tell the user to check their email

	if (token.trim()) {
		const res = await payload.verifyEmail({
			collection: 'users',
			token,
		});

		if (res) {
			return redirect(`/auth/login?success=${encodeURIComponent('Email verified successfully!')}`);
		} else {
			return redirect(`/auth/login?error=${encodeURIComponent('An error occured verifying your email. Please try again.')}`);
		}
	}

	// check if from or token is not defined in the URL (this means the user accessed this page directly, manually)
	if (!from && !token.trim()) {
		return redirect(`/auth/login?error=${encodeURIComponent('Invalid request. Please try again.')}`);
	}

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<VerifyEmailContent from={from} />
		</Suspense>
	);
}
