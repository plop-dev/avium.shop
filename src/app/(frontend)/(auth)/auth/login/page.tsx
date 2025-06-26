'use client';
import { useSession, signIn, signOut } from 'next-auth/react';
// import { signIn, signOut, auth } from '@/auth';

export default function Page() {
	const session = useSession();
	// const session = await auth();

	return (
		<main className='p-8 font-sans'>
			<h1 className='text-3xl font-bold mb-4'>Welcome to the Store</h1>

			{session?.data?.user ? (
				<>
					<p className='mb-2'>
						Logged in as: <strong>{session.data.user?.email}</strong>
					</p>
					<pre className='bg-gray-100 p-4 text-sm overflow-auto rounded mb-4'>{JSON.stringify(session.data.user, null, 2)}</pre>
					<button onClick={() => signOut()} className='bg-red-600 text-white px-4 py-2 rounded'>
						Log out
					</button>
				</>
			) : (
				<button onClick={() => signIn('google')} className='bg-blue-600 text-white px-4 py-2 rounded'>
					Log in with google
				</button>
			)}
		</main>
	);
}
