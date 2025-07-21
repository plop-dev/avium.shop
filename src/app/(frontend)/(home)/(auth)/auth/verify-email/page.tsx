import { Suspense } from 'react';
import { SearchParams } from 'nuqs/server';
import { VerifyEmailContent } from './alertUser';
import { redirect } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';
import { loadSearchParams } from './searchParams';
import { NextResponse } from 'next/server';
import { getServerSideURL } from '@/utils/getServerSideUrl';

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const payload = await getPayload({ config });

	const { from, token } = await loadSearchParams(searchParams);

	// if no token, this page is used to tell the user to check their email

	if (token.trim()) {
		let res;

		try {
			res = await payload.verifyEmail({
				collection: 'users',
				token,
			});
		} catch (error) {
			console.error('Error verifying email:', error);
			return NextResponse.redirect(
				`${getServerSideURL}/auth/login?error=${encodeURIComponent('An error occurred verifying your email. Please try again.')}`,
			);
		}

		if (res) {
			return redirect(`/auth/login?success=${encodeURIComponent('Email verified successfully!')}`);
		} else {
			return redirect(`/auth/login?error=${encodeURIComponent('An error occured verifying your email. Please try again.')}`);
		}
	}

	// check if from or token is not defined in the URL (this means the user accessed this page directly, manually)
	if (!from && !token) {
		return redirect(`/auth/login?error=${encodeURIComponent('Invalid request. Please try again.')}`);
	}

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<VerifyEmailContent from={from || 'login'} />
		</Suspense>
	);
}
