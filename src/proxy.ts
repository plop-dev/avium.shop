import NextAuth from 'next-auth';
import { ProxyConfig } from 'next/server';
import { auth } from '@/auth';

export const proxy = auth(req => {
	if (!req.auth && req.nextUrl.pathname !== '/login') {
		const newUrl = new URL('/login', req.nextUrl.origin);
		return Response.redirect(newUrl);
	}
});

export const config: ProxyConfig = {
	matcher: ['/((?!api|_next/static|_next/image|favicon.ico|admin/login|order).*)'],
};
