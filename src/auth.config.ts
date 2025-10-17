import type { NextAuthConfig } from 'next-auth';
import github from 'next-auth/providers/github';
import google from 'next-auth/providers/google';
import credentials from 'next-auth/providers/credentials';
import { getServerSideURL } from '@/utils/getServerSideUrl';

export const authConfig: NextAuthConfig = {
	providers: [
		github,
		google,
		credentials({
			credentials: {
				email: {
					label: 'Email',
					type: 'email',
				},
				password: {
					label: 'Password',
					type: 'password',
				},
			},
			async authorize(credentials) {
				if (!credentials) return null;

				const { email, password } = credentials;

				const res = await fetch(`${getServerSideURL()}/api/users/login`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						email,
						password,
					}),
				});

				if (!res.ok) {
					return null;
				}

				const { user, token } = await res.json();

				if (user && token) {
					return { ...user, token };
				}

				return null;
			},
		}),
	],
	callbacks: {
		jwt({ token, user }) {
			if (user) {
				token.id = user.id;

				// @ts-expect-error: ts being annoying
				token.token = user.token;
			}
			return token;
		},
		session({ session, token }) {
			if (session.user) {
				session.user.id = token.id as string;
			}
			return session;
		},
		authorized: ({ auth, request: { nextUrl } }) => {
			const isOnAuthPage = nextUrl.pathname.startsWith('/auth/');
			const isLoggedIn = !!auth;

			if (isOnAuthPage || nextUrl.pathname === '/') {
				return true; // Allow access to auth pages
			}

			return isLoggedIn; // Require auth for other pages
		},
		async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
			const isRelativeUrl = url.startsWith('/');
			if (isRelativeUrl) {
				return `${baseUrl}${url}`;
			}

			const isSameOriginUrl = new URL(url).origin === baseUrl;
			const alreadyRedirected = url.includes('callbackUrl=');
			if (isSameOriginUrl && alreadyRedirected) {
				const originalCallbackUrl = decodeURIComponent(url.split('callbackUrl=')[1]);

				return originalCallbackUrl;
			}

			if (isSameOriginUrl) {
				return url;
			}

			return baseUrl;
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
