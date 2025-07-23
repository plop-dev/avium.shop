import { z } from 'zod';

export const resetPasswordFormSchema = z
	.object({
		password: z.string().min(6, 'Password must be at least 6 characters long'),
		verifyPassword: z.string(),
		token: z.string(),
	})
	.refine(data => data.password === data.verifyPassword, {
		message: "Passwords don't match",
		path: ['verifyPassword'],
	});
