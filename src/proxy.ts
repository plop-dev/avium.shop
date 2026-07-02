import NextAuth from 'next-auth';
import { ProxyConfig } from 'next/server';
import { auth } from '@/auth';

export const proxy = auth(req => {
	if (!req.auth && req.nextUrl.pathname !== '/auth/login') {
		const newUrl = new URL('/auth/login', req.nextUrl.origin);
		return Response.redirect(newUrl);
	}
});

// Matches all request paths except those that begin with any of:
// - api
// - _next/static
// - _next/image
// - favicon.ico
// - the root path (/)
// - admin/login
// - order

export const config: ProxyConfig = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico|auth/|order).+)'],
};
