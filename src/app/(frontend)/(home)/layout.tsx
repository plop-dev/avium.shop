import { auth } from '@/auth';
import Navbar, { NavbarListItemProps, NavbarProps, NavMenuItem } from '@/components/Navbar';
import { redirect } from 'next/navigation';
import { getPayload } from 'payload';
import config from '@payload-config';
import { headers as nextHeaders } from 'next/headers';
import { getUser } from '@/utils/getUser';

export default async function HomeLayout({ children }: { children: React.ReactNode }) {
	const headers = await nextHeaders();

	const user = await getUser();

	// console.log('auth user:', session?.user);
	// console.log('payload user:', user.user);

	const options: NavbarListItemProps[] = [
		{
			title: 'PETG',
			href: '#?plastic=petg',
			description: 'A strong and durable filament suitable for functional parts.',
		},
		{
			title: 'TPU',
			href: '#?plastic=tpu',
			description: 'A flexible filament perfect for creating rubber-like parts.',
		},
		{
			title: 'See more',
			href: '#',
			description: 'Explore our range of printing materials and services.',
		},
	];

	const items: NavMenuItem[] = [
		{
			title: 'Home',
			type: 'dropdown',
			content: {
				layout: 'grid',
				className: 'grid gap-2 p-0 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]',
				featured: {
					title: 'Avium Dashboard',
					description: 'Your dashboard to manage your order history, account settings, and more.',
					href: '/dashboard/home',
				},
				items: [
					{
						title: 'About',
						href: '/#about',
						description: 'Learn more about Avium and our mission to make 3D printing accessible to everyone.',
					},
					{
						title: 'Contact',
						href: '/#contact',
						description: 'Get in touch with us for any inquiries or support.',
					},
				],
			},
		},
		{
			title: 'Printing',
			type: 'dropdown',
			content: {
				layout: 'grid',
				className: 'grid gap-2 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]',
				featured: {
					title: 'PLA',
					description: 'A versatile and cheap filament perfect for general usage.',
					href: '#?plastic=pla',
				},
				items: options,
			},
		},
		{
			title: 'Order',
			type: 'link',
			href: '#',
		},
	];

	return (
		<main className='w-full'>
			<Navbar items={items} user={user || undefined} />
			{children}
		</main>
	);
}
