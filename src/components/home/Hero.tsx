import { ArrowUpRight, ArrowRight } from 'lucide-react';

import { Button, buttonVariants } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { cn } from '@/lib/utils';

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

const Hero = ({
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
		<section className='w-full'>
			<div className='py-32 flex flex-col items-center justify-center gap-y-8 text-center'>
				<div className='heading'>
					<h1 className='text-6xl'>
						{heading} <br />
						<span className='text-foreground/60'>{subheading}</span>
					</h1>
				</div>
				<p className='w-1/3'>{description}</p>
				<div className='flex gap-x-2'>
					<Link href={buttons.primary.url} className={cn(buttonVariants({ variant: 'default' }))}>
						{buttons.primary.text}
					</Link>
					<Link href={buttons.secondary.url} className={cn(buttonVariants({ variant: 'secondary' }))}>
						{buttons.secondary.text}
					</Link>
				</div>
			</div>
		</section>
	);
};

export default Hero;
