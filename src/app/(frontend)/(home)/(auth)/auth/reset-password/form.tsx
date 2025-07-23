'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { resetPasswordFormSchema } from '@/schemas/resetPasswordForm';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { FormProvider, useForm } from 'react-hook-form';
import z from 'zod';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { submitResetPasswordForm } from '@/actions/resetPassword';

export default function ResetPasswordForm({ token }: { token: string }) {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<z.infer<typeof resetPasswordFormSchema>>({
		resolver: zodResolver(resetPasswordFormSchema),
		mode: 'onChange',
		defaultValues: {
			password: '',
			verifyPassword: '',
			token: '', // set as query param in the page component
		},
	});

	async function onSubmit(data: z.infer<typeof resetPasswordFormSchema>) {
		setIsLoading(true);

		try {
			const formData = new FormData();
			formData.append('password', data.password);
			formData.append('verifyPassword', data.verifyPassword);
			formData.append('token', token);

			const result = await submitResetPasswordForm(formData);

			if (result.success) {
				toast.success('Password reset successfully! You can now log in with your new password.');

				router.push('/auth/login'); // or dashboard?
			} else {
				toast.error(result.error || 'An error occurred while resetting your password. Please try again.');
			}
		} catch (error) {
			console.error('Error resetting password:', error);
			toast.error('An error occurred while resetting your password. Please try again.');
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<FormProvider {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className='grid gap-6'>
					<FormField
						control={form.control}
						name='password'
						render={({ field }) => (
							<FormItem className='flex-1'>
								<div className='flex items-center'>
									<FormLabel>New Password</FormLabel>
								</div>
								<FormControl>
									<Input type='password' disabled={isLoading} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						control={form.control}
						name='verifyPassword'
						render={({ field }) => (
							<FormItem className='flex-1'>
								<div className='flex items-center'>
									<FormLabel>Verify New Password</FormLabel>
								</div>
								<FormControl>
									<Input type='password' disabled={isLoading} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type='submit' className='w-full' disabled={isLoading}>
						{isLoading ? <Loader2 className='animate-spin' /> : 'Reset'}
					</Button>
				</div>
			</form>
		</FormProvider>
	);
}
