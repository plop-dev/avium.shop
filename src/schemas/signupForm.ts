import { z } from 'zod';

const signupFormSchema = z
	.object({
		name: z.string().min(2, 'Name must be at least 2 characters long'),
		email: z.string().min(2).max(50).email('Invalid email address'),
		password: z.string().min(6, 'Password must be at least 6 characters long'),
		verifyPassword: z.string(),
	})
	.refine(data => data.password === data.verifyPassword, {
		message: "Passwords don't match",
		path: ['verifyPassword'],
	});

export { signupFormSchema };
