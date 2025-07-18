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
		<section className='w-full flex flex-col items-center'>
			<div className='pt-36 pb-24 max-w-5xl'>
				<div className='flex flex-col items-center justify-center gap-y-8 text-center'>
					<h1 className='text-6xl'>
						{heading} <br />
						<span className='bg-clip-text text-transparent bg-gradient-to-b from-foreground/80 to-foreground/40'>
							{subheading}
						</span>
					</h1>
					<p className='w-2/3'>{description}</p>
					<div className='flex gap-x-2'>
						<Link href={buttons.primary.url} className={cn(buttonVariants({ variant: 'default' }))}>
							{buttons.primary.text}
						</Link>
						<Link href={buttons.secondary.url} className={cn(buttonVariants({ variant: 'secondary' }))}>
							{buttons.secondary.text}
						</Link>
					</div>
				</div>
			</div>

			<div className='w-[60%] grid place-items-center'>
				{/* <h1 className='text-secondary'>SZYMON VID HERE</h1> */}
				<Video type='video/webm' filename='hero-printer-0.webm' muted autoPlay playsInline loop className='rounded-xl'></Video>
			</div>
		</section>
	);
};

export default Hero;
