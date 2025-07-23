'use client';

import Image from 'next/image';
import logo from '@/assets/logo.png';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStore } from '@nanostores/react';
import { Mail, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { $resetPasswordEmail } from '@/stores/resetPasswordEmail';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function ForgotPasswordAlert() {
	const email = useStore($resetPasswordEmail);
	const router = useRouter();

	useEffect(() => {
		if (!email) {
			router.push(`/auth/login?error=${encodeURIComponent('Invalid request. Please try again.')}`);
		}
	}, [email, router]);

	return (
		<div className='flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10'>
			<div className='flex w-full max-w-sm flex-col gap-6'>
				<Link href='/' className='flex items-center gap-2 self-center font-medium text-2xl'>
					<div className='text-primary-foreground flex size-8 items-center justify-center'>
						<Image src={logo} alt='Avium' height={32} width={32}></Image>
					</div>
					Avium
				</Link>

				<div className={cn('flex flex-col gap-6')}>
					<Card>
						<CardHeader className='text-center'>
							<CardTitle className='text-xl'>Check your email</CardTitle>
							<CardDescription>We&#39;ve sent you a password reset link</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='text-center space-y-6'>
								<div className='flex justify-center'>
									<div className='w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center'>
										<Mail className='w-6 h-6 text-primary' />
									</div>
								</div>

								<div className='space-y-2'>
									<p className='text-muted-foreground text-sm'>
										We&#39;ve sent a password reset link to <span className='font-medium'>{email}</span>
									</p>
								</div>

								<div className='space-y-4'>
									<p className='text-sm text-muted-foreground'>
										Click the link in the email to reset your password. If you don&#39;t see it, check your spam folder.
									</p>

									<Button variant='outline' asChild className='w-full'>
										<Link href='/auth/login'>
											<ArrowLeft className='w-4 h-4 mr-2' />
											Back to Login
										</Link>
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
