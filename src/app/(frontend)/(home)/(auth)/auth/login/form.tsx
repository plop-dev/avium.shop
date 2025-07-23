'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { submitLoginForm } from '@/actions/login';
import { useEffect, useState, useRef, useTransition } from 'react';
import { Loader2 } from 'lucide-react';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { submitForgotPasswordForm } from '@/actions/forgotPassword';
import { loginFormSchema } from '@/schemas/loginForm';
import { signIn } from 'next-auth/react';
import { LoadingSwap } from '@/components/ui/loading-swap';

export default function LoginForm() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [isResetButtonLoading, startResetButtonLoading] = useTransition();
	const [isForgotPasswordDialogOpen, setIsForgotPasswordDialogOpen] = useState(false);

	const form = useForm<z.infer<typeof loginFormSchema>>({
		resolver: zodResolver(loginFormSchema),
		mode: 'onChange',
		defaultValues: {
			email: '',
			password: '',
		},
	});

	async function onSubmit(data: z.infer<typeof loginFormSchema>) {
		setIsLoading(true);

		try {
			// const formData = new FormData();
			// formData.append('email', data.email);
			// formData.append('password', data.password);

			// const result = await submitLoginForm(formData);

			const result = await signIn('credentials', {
				redirect: false,
				email: data.email,
				password: data.password,
			});

			if (result.ok) {
				toast.success('Login successful! Redirecting...');
				router.push('/dashboard/home'); // or router.push(result.url)
			} else {
				toast.error(result.error || 'Login failed. Please try again.');
			}
		} catch (error) {
			toast.error('An unexpected error occurred. Please try again.');
		} finally {
			setIsLoading(false);
		}
	}

	async function handleForgotPassword(e: React.MouseEvent<HTMLButtonElement>) {
		e.preventDefault();

		const email = form.getValues('email');
		if (!email) {
			toast.error('Please enter your email address first');
			return;
		}

		const formData = new FormData();
		formData.append('email', email);

		const result = await submitForgotPasswordForm(formData);

		if (result.error) {
			toast.error(result.error);
		} else {
			toast.success('Password reset email sent! Check your inbox.');
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className='grid gap-6'>
					<FormField
						control={form.control}
						name='email'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input type='email' placeholder='help@avium.shop' disabled={isLoading} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<div className='grid gap-3'>
						<div className='flex items-center'>
							<FormField
								control={form.control}
								name='password'
								render={({ field }) => (
									<FormItem className='flex-1'>
										<div className='flex items-center'>
											<FormLabel>Password</FormLabel>

											<AlertDialog open={isForgotPasswordDialogOpen} onOpenChange={setIsForgotPasswordDialogOpen}>
												<AlertDialogTrigger asChild>
													<Button
														variant={'link'}
														className='ml-auto text-sm underline-offset-4 hover:underline p-0'>
														Forgot your password?
													</Button>
												</AlertDialogTrigger>
												<AlertDialogContent>
													<AlertDialogHeader>
														<AlertDialogTitle>Are you sure you want to reset your password?</AlertDialogTitle>
														<AlertDialogDescription>
															This action will send a password reset link to your email address. Please ensure
															you have access to the email associated with your account.
														</AlertDialogDescription>
													</AlertDialogHeader>
													<AlertDialogFooter>
														<AlertDialogCancel>Cancel</AlertDialogCancel>
														<AlertDialogAction onClick={e => handleForgotPassword(e)}>
															<LoadingSwap isLoading={isResetButtonLoading}>Continue</LoadingSwap>
														</AlertDialogAction>
													</AlertDialogFooter>
												</AlertDialogContent>
											</AlertDialog>
										</div>
										<FormControl>
											<Input type='password' disabled={isLoading} {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
						</div>
					</div>
					<Button type='submit' className='w-full' disabled={isLoading}>
						{isLoading ? <Loader2 className='animate-spin' /> : 'Login'}
					</Button>
				</div>
			</form>
		</Form>
	);
}
