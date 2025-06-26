import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { MiddlewareConfig } from 'next/server';

export const { auth: middleware } = NextAuth(authConfig);

export const config: MiddlewareConfig = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico|admin/login).*)'],
};
