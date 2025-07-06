import Hero from '@/components/home/Hero';
import PageContainer from '@/components/layouts/PageContainer';
import ThemeToggle from '@/components/layouts/ThemeToggle';

export default function Page() {
	return (
		<PageContainer scrollable={true} className='flex flex-col gap-x-2'>
			<Hero
				heading='3D Printing'
				subheading='Cheaper than ever before'
				description='Avium makes 3D printing simple, affordable, and accessible. Get started today with free quotes for your projects.'
				buttons={{
					primary: {
						text: 'Get A Free Quote',
						url: '#',
					},
					secondary: {
						text: 'Browse Prints',
						url: '#',
					},
				}}
			/>
			{/* <div className='px-64 w-full'></div> */}
		</PageContainer>
	);
}
