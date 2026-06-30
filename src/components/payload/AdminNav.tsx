'use client';

import { useRouter } from 'next/navigation';
import '@/app/styles/payload.css';

export default function AdminNav() {
	const router = useRouter();

	return (
		<button className={'nav-button'} onClick={() => router.push('/dashboard/home')}>
			Go to Dashboard
		</button>
	);
}
