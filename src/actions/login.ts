'use server';

import { loginFormSchema } from '@/schemas/loginForm';
import { getPayload } from 'payload';
import config from '@payload-config';
import { cookies } from 'next/headers';

export async function submitLoginForm(formData: FormData) {
	const payload = await getPayload({ config });

	const data = {
		email: formData.get('email')?.toString(),
		password: formData.get('password')?.toString(),
	};

	const result = loginFormSchema.safeParse(data);

	if (!data.email || !data.password) {
		return { error: 'Email and password are required' };
	}

	if (!result.success) {
		return { error: result.error.errors.map(e => e.message).join(', ') };
	}

	try {
		const res = await payload.login({
			collection: 'users',
			data: {
				email: data.email,
				password: data.password,
			},
		});

		// const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/users/login`, {
		// 	method: 'POST',
		// 	headers: {
		// 		'Content-Type': 'application/json',
		// 	},
		// 	credentials: 'include',
		// 	body: JSON.stringify(data),
		// });

		if (res.token) {
			const cookieStore = await cookies();
			cookieStore.set('payload-token', res.token, {
				httpOnly: true,
				secure: process.env.NODE_ENV === 'production',
				path: '/',
			});

			return { success: true };
		} else {
			return { error: 'Login failed. Please try again.' };
		}
	} catch (error) {
		if (error instanceof Error) {
			return { error: error.message };
		}

		console.error('Login error:', error);
		return { error: 'An unexpected error occurred. Please try again later.' };
	}
}
