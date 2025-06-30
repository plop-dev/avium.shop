import Hero from '@/components/home/Hero';
import PageContainer from '@/components/layouts/PageContainer';
import ThemeToggle from '@/components/layouts/ThemeToggle';

export default function Page() {
	return (
		<PageContainer scrollable={true}>
			<Hero
				heading='3D Printing'
				subheading=' cheaper than ever before'
				description='Avium makes 3D printing simple and affordable'
				buttons={{
					primary: {
						text: 'Get Started',
						url: '#',
					},
					secondary: {
						text: 'Browse Prints',
						url: '#',
					},
				}}
				image={{
					src: 'https://3d.nice-cdn.com/upload/image/product/large/default/bambu-lab-a1-1-pc-700537-en.png',
					alt: 'Bambu Lab A1',
				}}
			/>
		</PageContainer>
	);
}
