import { getUser } from '@/utils/getUser';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { redirect } from 'next/navigation';
import { toast } from 'sonner';

export default async function Layout({ admin, client }: { admin: React.ReactNode; client: React.ReactNode }) {
	const user = await getUser();
	const payload = await getPayload({ config });

	const userDoc = await payload.findByID({
		collection: 'users',
		id: user?.id || '',
		overrideAccess: true,
	});

	if (!userDoc) {
		toast.error('You must be logged in to access the dashboard.');
		redirect('/auth/login');
	}

	return <div className='flex flex-1 flex-col'>{userDoc.role === 'customer' ? client : admin}</div>;
}
