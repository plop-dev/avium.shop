import { ArrowUpRight, ArrowRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface HeroProps {
	badge?: string;
	heading?: string;
	subheading?: string;
	description?: string;
	buttons?: {
		primary?: {
			text: string;
			url: string;
		};
		secondary?: {
			text: string;
			url: string;
		};
	};
	image?: {
		src: string;
		alt: string;
	};
}

const Hero = ({
	badge,
	heading = '3d Printing',
	subheading = ' cheaper than ever before',
	description = 'Avium makes 3d printing simple and affordable ',
	buttons = {
		primary: {
			text: 'Get Started',
			url: '#',
		},
		secondary: {
			text: 'Browse Prints',
			url: '#',
		},
	},
	image = {
		src: 'https://3d.nice-cdn.com/upload/image/product/large/default/bambu-lab-a1-1-pc-700537-en.png',
		alt: 'Bambu Lab A1',
	},
}: HeroProps) => {
	return (
		<section className='py-32'>
			<div className='container'>
				<div className='grid items-center gap-8 lg:grid-cols-2'>
					<div className='flex flex-col items-center text-center lg:items-start lg:text-left'>
						{badge && (
							<Badge variant='outline'>
								{badge}
								<ArrowUpRight className='ml-2 size-4' />
							</Badge>
						)}
						<h1 className='my-6 text-pretty text-4xl font-bold lg:text-6xl'>{heading}</h1>
						<p className='text-muted-foreground mb-8 max-w-xl lg:text-xl'>{description}</p>
						<div className='flex w-full flex-col justify-center gap-2 sm:flex-row lg:justify-start'>
							{buttons.primary && (
								<Button asChild className='w-full sm:w-auto'>
									<a href={buttons.primary.url}>{buttons.primary.text}</a>
								</Button>
							)}
							{buttons.secondary && (
								<Button asChild variant='outline' className='w-full sm:w-auto'>
									<a href={buttons.secondary.url}>
										{buttons.secondary.text}
										<ArrowRight className='size-4' />
									</a>
								</Button>
							)}
						</div>
					</div>
					<div className='h-96 aspect-square rounded-md flex justify-center items-center bg-white p-12'>
						<img src={image.src} alt={image.alt} className='max-h-96 w-full rounded-md object-contain' />
					</div>
				</div>
			</div>
		</section>
	);
};

export default Hero;
