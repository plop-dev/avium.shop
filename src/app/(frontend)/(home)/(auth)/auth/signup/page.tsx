'use server';

import Image from 'next/image';
import logo from '@/assets/logo.png';
import Link from 'next/link';
import SignupForm from './form';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import AuthButtons from '../signup/authButtons';

export default async function SignUpPage() {
	return (
		<div className='flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
			<div className='flex w-full max-w-sm flex-col gap-6'>
				<Link href='#' className='flex items-center gap-2 self-center font-medium text-2xl'>
					<div className='text-primary-foreground flex size-8 items-center justify-center'>
						<Image src={logo} alt='Avium' height={32} width={32}></Image>
					</div>
					Avium
				</Link>

				<div className={cn('flex flex-col gap-6')}>
					<Card>
						<CardHeader className='text-center'>
							<CardTitle className='text-xl'>Create your Avium account</CardTitle>
							<CardDescription>Signup with your Google or Github account</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='grid gap-6'>
								<div className='flex flex-col gap-4'>
									<AuthButtons></AuthButtons>
								</div>
								<div className='after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t'>
									<span className='bg-card text-muted-foreground relative z-10 px-2'>Or continue with</span>
								</div>

								<SignupForm />

								<div className='text-center text-sm'>
									Already have an account?{' '}
									<Link href='/auth/login' className='underline underline-offset-4'>
										Login
									</Link>
								</div>
							</div>
						</CardContent>
					</Card>
					<div className='text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4'>
						By clicking continue, you agree to our <Link href='#'>Terms of Service</Link> and{' '}
						<Link href='#'>Privacy Policy</Link>.
					</div>
				</div>
			</div>
		</div>
	);
}
