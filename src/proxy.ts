import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';
import { ProxyConfig } from 'next/server';

export const { auth: middleware } = NextAuth(authConfig);

export const config: ProxyConfig = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico|admin/login|order).*)'],
};
