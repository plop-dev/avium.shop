import { auth } from '@/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function HomePage() {
	const session = await auth();

	if (!session?.user) {
		redirect('/auth/login');
		// return (
		// 	<div className='p-6'>
		// 		<h1 className='text-2xl font-bold'>Welcome to Dashboard</h1>
		// 		<p>
		// 			Please <Link href='/auth/login'>log in</Link> to continue.
		// 		</p>
		// 	</div>
		// );
	}

	return (
		<div className='p-6'>
			<h1 className='text-2xl font-bold'>Welcome back, {session.user.name || session.user.email}!</h1>
		</div>
	);
}
