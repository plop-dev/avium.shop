import logo from '@/assets/logo.png';
import Image from 'next/image';
import LoginForm from './form';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import AuthButtons from './authButtons';
import { SearchParams } from 'nuqs/server';
import { loadSearchParams } from './searchParams';

export default async function LoginPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
	const { error, success, message } = await loadSearchParams(searchParams);

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
							<CardTitle className='text-xl'>Welcome back</CardTitle>
							<CardDescription>Login with your Google or Github account</CardDescription>
						</CardHeader>
						<CardContent>
							<div className='grid gap-6'>
								<div className='flex flex-col gap-4'>
									<AuthButtons></AuthButtons>
								</div>
								<div className='after:border-border relative text-center text-sm after:absolute after:inset-0 after:top-1/2 after:z-0 after:flex after:items-center after:border-t'>
									<span className='bg-card text-muted-foreground relative z-10 px-2'>Or continue with</span>
								</div>

								<LoginForm error={error} message={message} success={success} />

								<div className='text-center text-sm'>
									Don&apos;t have an account?{' '}
									<Link href='/auth/signup' className='underline underline-offset-4'>
										Sign up
									</Link>
								</div>
							</div>
						</CardContent>
					</Card>
					<div className='text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4'>
						By clicking login, you agree to our <Link href='#'>Terms of Service</Link> and <Link href='#'>Privacy Policy</Link>.
					</div>
				</div>
			</div>
		</div>
	);
}
