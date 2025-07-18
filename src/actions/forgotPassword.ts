'use server';

import { getPayload } from 'payload';
import config from '@payload-config';

export async function submitForgotPasswordForm(formData: FormData) {
	const payload = await getPayload({ config });

	const email = formData.get('email') as string;

	if (!email) {
		return { error: 'Email is required' };
	}

	try {
		const token = await payload.forgotPassword({
			collection: 'users',
			data: {
				email,
			},
		});

		if (!token) {
			return { error: 'Failed to send reset email. Please try again.' };
		}

		// const response = await fetch(`${process.env.API_BASE_URL}/api/users/forgot-password`, {
		// 	method: 'POST',
		// 	headers: {
		// 		'Content-Type': 'application/json',
		// 	},
		// 	body: JSON.stringify({ email }),
		// });

		// if (!response.ok) {
		// 	const errorData = await response.json();
		// 	return { error: errorData.message || 'Failed to send reset email' };
		// }

		return { success: true };
	} catch (error) {
		console.error('Forgot password error:', error);
		return { error: 'An unexpected error occurred. Please try again.' };
	}
}
