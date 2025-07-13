import { signupFormSchema } from '@/app/(frontend)/(home)/(auth)/auth/signup/form';

export async function submitSignupForm(formData: FormData) {
	const data = {
		name: formData.get('name')?.toString(),
		email: formData.get('email')?.toString(),
		password: formData.get('password')?.toString(),
		verifyPassword: formData.get('password')?.toString(), // Use same password for verification
	};

	const result = signupFormSchema.safeParse(data);

	if (!result.success) {
		return { error: result.error.errors.map(e => e.message).join(', ') };
	}

	// Remove verifyPassword before sending to API
	const { verifyPassword, ...apiData } = result.data;

	try {
		const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/users/`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(apiData),
		});

		if (!res.ok) {
			const errorData = await res.json();
			return { error: errorData.message || 'Login failed. Please try again.' };
		}

		return { success: true };
	} catch (error) {
		console.error('Login error:', error);
		return { error: 'An unexpected error occurred. Please try again later.' };
	}
}
