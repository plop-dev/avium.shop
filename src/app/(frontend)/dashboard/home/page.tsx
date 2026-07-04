import { auth } from '@/auth';
import { Suspense } from 'react';

async function WelcomeContent() {
	const session = await auth();

	return (
		<div className='p-6'>
			<h1 className='text-2xl font-bold'>Welcome back, {session.user?.name || session.user?.email}!</h1>
		</div>
	);
}

export default function HomePage() {
	return (
		<Suspense fallback={<div className='p-6' />}>
			<WelcomeContent />
		</Suspense>
	);
}
