import Navbar from '@/components/Navbar';

export default async function HomeLayout({ children }: { children: React.ReactNode }) {
	return (
		<main className='px-64'>
			{/* <Navbar
				auth={{
					login: {
						title: 'Login',
						url: '#',
					},
					signup: {
						title: 'Sign Up',
						url: '#',
					},
				}}
				logo={{
					alt: 'Avium Logo',
					src: '#',
					title: 'Avium',
					url: '/',
				}}
				menu={[
					{ title: 'Home', url: '/' },
					{ title: 'Products', url: '/products' },
					{ title: 'Plus', url: '/plus' },
					{ title: 'Shop', url: '/shop' },
					{ title: 'Contact', url: '/contact' },
				]}></Navbar> */}
			<Navbar />
			{children}
		</main>
	);
}
