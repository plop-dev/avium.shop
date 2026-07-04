'use server';

import { Suspense } from 'react';
import { SearchParams } from 'nuqs/server';
import { VerifyEmailContent } from './alertUser';
import { redirect } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';
import { loadSearchParams } from './searchParams';
import { getServerSideURL } from '@/utils/getServerSideUrl';
import { connection } from 'next/server';

async function VerifyEmailHandler({ from, token }: { from: string; token: string }) {
	connection();
	const payload = await getPayload({ config });

	if (token.trim()) {
		let res;

		try {
			res = await payload.verifyEmail({
				collection: 'users',
				token,
			});
		} catch (error) {
			console.error('Error verifying email:', error);
			redirect(
				`${getServerSideURL}/auth/login?error=${encodeURIComponent('An error occurred verifying your email. Please try again.')}`,
			);
		}

		if (res) {
			redirect(`/auth/login?success=${encodeURIComponent('Email verified successfully!')}`);
		} else {
			redirect(`/auth/login?error=${encodeURIComponent('An error occured verifying your email. Please try again.')}`);
		}
	}

	return <VerifyEmailContent from={(from as 'signup' | 'login') || 'login'} />;
}

async function LoadAndVerify({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const { from, token } = await loadSearchParams(searchParams);

	// check if from or token is not defined in the URL (this means the user accessed this page directly, manually)
	if (!from && !token) {
		redirect(`/auth/login?error=${encodeURIComponent('Invalid request. Please try again.')}`);
	}

	return <VerifyEmailHandler from={from} token={token} />;
}

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
	return (
		<Suspense fallback={<div>Loading...</div>}>
			<LoadAndVerify searchParams={searchParams} />
		</Suspense>
	);
}
