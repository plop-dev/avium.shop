'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { submitSignupForm } from '@/actions/signup';
import { Separator } from '@/components/ui/separator';
import { signupFormSchema } from '@/schemas/signupForm';

export default function SignupForm() {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);

	const form = useForm<z.infer<typeof signupFormSchema>>({
		resolver: zodResolver(signupFormSchema),
		mode: 'onChange',
		defaultValues: {
			name: '',
			email: '',
			password: '',
			verifyPassword: '',
		},
	});

	async function onSubmit(data: z.infer<typeof signupFormSchema>) {
		setIsLoading(true);

		try {
			const formData = new FormData();
			formData.append('name', data.name);
			formData.append('email', data.email);
			formData.append('password', data.password);
			formData.append('verifyPassword', data.verifyPassword); // Added missing field

			const result = await submitSignupForm(formData);

			if (result.error) {
				toast.error(result.error);
			} else {
				toast.success('Signup successful! Redirecting...');
				router.push('/dashboard/home');
			}
		} catch (error) {
			console.error('Signup error:', error);
			toast.error('An unexpected error occurred. Please try again.');
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
						name='name'
						render={({ field }) => (
							<FormItem>
								<FormLabel>Name</FormLabel>
								<FormControl>
									<Input type='text' placeholder='Dawid Siewior' disabled={isLoading} {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
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

					<Separator></Separator>

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
						{isLoading ? <Loader2 className='animate-spin' /> : 'Signup'}
					</Button>
				</div>
			</form>
		</Form>
	);
}
