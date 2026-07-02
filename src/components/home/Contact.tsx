import { Mail } from 'lucide-react';
import Link from 'next/link';

export default function Contact() {
	return (
		<section className='w-full py-24 border-t border-border/40' id='contact'>
			<div className='flex flex-col items-center px-64 gap-y-4'>
				<div className='flex items-center gap-x-2 text-sm text-foreground/60'>
					<Mail size={16} />
					<span>Questions? Get in touch</span>
				</div>
				<Link href='mailto:support@avium.shop' className='text-lg hover:text-foreground/80 transition-colors text-foreground/70'>
					support@avium.shop
				</Link>
			</div>
		</section>
	);
}
