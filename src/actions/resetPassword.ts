'use server';

import { getPayload } from 'payload';
import config from '@payload-config';
import { resetPasswordFormSchema } from '@/schemas/resetPasswordForm';

export async function submitResetPasswordForm(formData: FormData) {
	const payload = await getPayload({ config });

	const data = {
		password: formData.get('password')?.toString(),
		verifyPassword: formData.get('verifyPassword')?.toString(),
		token: formData.get('token')?.toString(),
	};

	const res = resetPasswordFormSchema.safeParse(data);

	if (!res.success) {
		return { error: res.error.errors.map(e => e.message).join(', ') };
	}
	const { verifyPassword, ...resetData } = res.data;

	try {
		const resetRes = await payload.resetPassword({
			collection: 'users',
			data: resetData,
			overrideAccess: true,
		});

		if (!resetRes) {
			console.error('Reset password failed:', resetRes);
			return { error: 'Reset password failed. Please try again.' };
		}

		return { success: true };
	} catch (error) {
		console.error('Forgot password error:', error);
		return { error: 'An unexpected error occurred. Please try again.' };
	}
}
