'use client';

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { resetPasswordFormSchema } from '@/schemas/resetPasswordForm';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Form, useForm } from 'react-hook-form';
import z from 'zod';
import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';

export default function ResetPasswordForm() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<z.infer<typeof resetPasswordFormSchema>>({
		resolver: zodResolver(resetPasswordFormSchema),
		mode: 'onChange',
		defaultValues: {
			password: '',
			verifyPassword: '',
		},
	});

	async function onSubmit(data: z.infer<typeof resetPasswordFormSchema>) {
		setIsLoading(true);

		try {
			const formData = new FormData();
			formData.append('password', data.password);
			formData.append('verifyPassword', data.verifyPassword);

			const result = await setTimeout(() => {
				toast.success('Password reset successfully! Redirecting...');
				router.push('/auth/login');
			}, 1000);
		} catch (error) {
			console.error('Error resetting password:', error);
			toast.error('An error occurred while resetting your password. Please try again.');
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				<div className='grid gap-6'>
					<FormField
						control={form.control}
						name='password'
						render={({ field }) => (
							<FormItem className='flex-1'>
								<div className='flex items-center'>
									<FormLabel>Password</FormLabel>
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
									<FormLabel>Verify Password</FormLabel>
								</div>
								<FormControl>
									<Input type='password' disabled={isLoading} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type='submit' className='w-full' disabled={isLoading}>
						{isLoading ? <Loader2 className='animate-spin' /> : 'Login'}
					</Button>
				</div>
			</form>
		</Form>
	);
}
