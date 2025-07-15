'use server';

export async function submitForgotPasswordForm(formData: FormData) {
	const email = formData.get('email') as string;

	if (!email) {
		return { error: 'Email is required' };
	}

	try {
		const response = await fetch(`${process.env.API_BASE_URL}/api/users/forgot-password`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ email }),
		});

		if (!response.ok) {
			const errorData = await response.json();
			return { error: errorData.message || 'Failed to send reset email' };
		}

		return { success: true };
	} catch (error) {
		console.error('Forgot password error:', error);
		return { error: 'An unexpected error occurred. Please try again.' };
	}
}
