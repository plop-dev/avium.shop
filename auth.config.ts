import type { NextAuthConfig } from 'next-auth';
import github from 'next-auth/providers/github';

export const authConfig: NextAuthConfig = {
	providers: [github],
};
