import { z } from 'zod';

export const loginFormSchema = z.object({
	email: z.string().min(2).max(50),
	password: z.string().min(6, 'Password must be at least 6 characters long'),
});
