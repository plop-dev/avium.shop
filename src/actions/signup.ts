'use server';

// import { signupFormSchema } from '@/app/(frontend)/(home)/(auth)/auth/signup/form';
import { getPayload } from 'payload';
import config from '@payload-config';
import { signupFormSchema } from '@/schemas/signupForm';

export async function submitSignupForm(formData: FormData) {
	const payload = await getPayload({ config });

	const data = {
		name: formData.get('name')?.toString(),
		email: formData.get('email')?.toString(),
		password: formData.get('password')?.toString(),
		verifyPassword: formData.get('verifyPassword')?.toString(),
	};

	const result = signupFormSchema.safeParse(data);

	if (!result.success) {
		return { error: result.error.errors.map(e => e.message).join(', ') };
	}

	// Remove verifyPassword before sending to API
	const { verifyPassword, ...signupData } = result.data;

	try {
		console.log('Submitting signup data:', signupData.email, signupData.name);

		// check if email is already used
		const emailExists = await payload.find({
			collection: 'users',
			where: {
				email: {
					equals: signupData.email,
				},
			},
		});

		if (emailExists.totalDocs > 0) {
			return { error: 'Email is already in use. Please use a different email.' };
		}

		const createRes = await payload.create({
			collection: 'users',
			data: signupData,
		});

		if (!createRes) {
			console.error('Account creation failed:', createRes);
			return { error: 'Signup failed. Please try again.' };
		}

		// const createRes = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/users`, {
		// 	method: 'POST',
		// 	headers: {
		// 		'Content-Type': 'application/json',
		// 	},
		// 	body: JSON.stringify(signupData),
		// });

		// if (!createRes.ok) {
		// 	const errorData = await createRes.json();
		// 	return { error: errorData.message || 'Signup failed. Please try again.' };
		// }

		return { success: true };
	} catch (error) {
		if (error instanceof Error) {
			return { error: error.message };
		}

		console.error('Signup error:', error);
		return { error: 'An unexpected error occurred. Please try again later.' };
	}
}
