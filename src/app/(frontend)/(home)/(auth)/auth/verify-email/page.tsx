import { Suspense } from 'react';
import { parseAsString, parseAsStringLiteral, useQueryState, createLoader } from 'nuqs';
import { VerifyEmailContent } from './alertUser';
import { redirect } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';
import { loadSearchParams } from './searchParams';

interface SearchParams {
	[key: string]: string;
}

export default async function VerifyEmailPage({ searchParams }: { searchParams: SearchParams }) {
	const payload = await getPayload({ config });

	const { from, token } = loadSearchParams(searchParams);

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
