import { auth } from '@/auth';
import Link from 'next/link';

export default async function HomePage() {
	const session = await auth();

	if (!session?.user) {
		return (
			<div className='p-6'>
				<h1 className='text-2xl font-bold'>Welcome to Dashboard</h1>
				<p>
					Please <Link href='/auth/login'>log in</Link> to continue.
				</p>
			</div>
		);
	}

	return (
		<div className='p-6'>
			<h1 className='text-2xl font-bold'>Welcome back, {session.user.name || session.user.email}!</h1>
			<p className='text-gray-600 mt-2'>Good to see you again in your dashboard.</p>
		</div>
	);
}
