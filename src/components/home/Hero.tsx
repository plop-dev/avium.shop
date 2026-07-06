'use server';

import { ArrowUpRight, ArrowRight } from 'lucide-react';
import { list } from '@vercel/blob';
import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Video } from '../Video';

export interface HeroBadgeProps {
	text: string;
	icon?: React.ReactNode;
}

export interface HeroProps {
	badges?: HeroBadgeProps[];
	heading: string;
	subheading: string;
	description: string;
	buttons: {
		primary: {
			text: string;
			url: string;
		};
		secondary: {
			text: string;
			url: string;
		};
	};
}

const Hero = async ({
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
}: HeroProps) => {
	return (
		<section className='flex flex-col items-center w-full'>
			<div className='w-full pt-8 sm:pt-16 lg:pt-24 pb-8 sm:pb-12 lg:pb-20'>
				<div className='flex flex-col items-center justify-center gap-y-4 sm:gap-y-6 text-center'>
					<h1 className='text-2xl sm:text-3xl lg:text-5xl font-bold'>
						{heading} <br />
						<span className='bg-clip-text text-transparent bg-gradient-to-b from-foreground/80 to-foreground/40'>
							{subheading}
						</span>
					</h1>
					<p className='text-sm sm:text-base w-full px-4 sm:px-0 sm:w-4/5 lg:w-2/3'>{description}</p>
					<div className='flex flex-col sm:flex-row gap-2 w-full sm:w-auto px-4 sm:px-0'>
						<Link
							href={buttons.primary.url}
							className={cn(buttonVariants({ variant: 'default', size: 'sm' }), 'w-full sm:w-auto')}>
							{buttons.primary.text}
						</Link>
						<Link
							href={buttons.secondary.url}
							className={cn(buttonVariants({ variant: 'secondary', size: 'sm' }), 'w-full sm:w-auto')}>
							{buttons.secondary.text}
						</Link>
					</div>
				</div>
			</div>

			<div className='grid place-items-center relative w-3/4 px-4 sm:px-0'>
				<div className='absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-background/80 z-10 pointer-events-none'></div>
				<Video
					type='video/webm'
					url={'https://tt9cm3m7y1kbfhht.public.blob.vercel-storage.com/hero-printer-0.webm'}
					muted
					autoPlay
					playsInline
					loop
					className='rounded-xl w-full'
				/>
			</div>
		</section>
	);
};

export default Hero;
