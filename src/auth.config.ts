import type { NextAuthConfig } from 'next-auth';
import github from 'next-auth/providers/github';
import google from 'next-auth/providers/google';

export const authConfig: NextAuthConfig = {
	providers: [github, google],
	callbacks: {
		authorized: ({ auth, request: { nextUrl } }) => {
			const isOnAuthPage = nextUrl.pathname.startsWith('/auth/');
			const isLoggedIn = !!auth;

			if (isOnAuthPage || nextUrl.pathname === '/') {
				return true; // Allow access to auth pages
			}

			return isLoggedIn; // Require auth for other pages
		},
	},
	session: {
		strategy: 'jwt',
	},
	pages: {
		signIn: '/auth/login',
		newUser: '/auth/signup',
	},
	secret: process.env.AUTH_SECRET,
};
