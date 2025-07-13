import { loginFormSchema } from '@/app/(frontend)/(home)/(auth)/auth/login/form';

export async function submitLoginForm(formData: FormData) {
	const data = {
		email: formData.get('email')?.toString(),
		password: formData.get('password')?.toString(),
	};

	const result = loginFormSchema.safeParse(data);

	if (!result.success) {
		return { error: result.error.errors.map(e => e.message).join(', ') };
	}

	try {
		const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/users/login`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify(data),
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
