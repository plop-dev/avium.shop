import logo from '@/assets/logo.png';
import Image from 'next/image';
import LoginForm from './form';
import Link from 'next/link';

export default async function LoginPage() {
	return (
		<div className='flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
			<div className='flex w-full max-w-sm flex-col gap-6'>
				<Link href='#' className='flex items-center gap-2 self-center font-medium text-2xl'>
					<div className='text-primary-foreground flex size-8 items-center justify-center'>
						<Image src={logo} alt='Avium' height={32} width={32}></Image>
					</div>
					Avium
				</Link>

				<LoginForm></LoginForm>
			</div>
		</div>
	);
}
