import { withPayload } from '@payloadcms/next/withPayload';
import type { NextConfig } from 'next';

export const runtime = 'edge';
const backendURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
const isDev = backendURL.startsWith('http://localhost');

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		dangerouslyAllowLocalIP: isDev,
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '**',
			},
			{
				protocol: 'http',
				hostname: 'localhost',
			},
		],
	},
	async redirects() {
		return [
			{
				source: '/dashboard',
				destination: '/dashboard/home',
				permanent: true,
			},
		];
	},
	turbopack: {
		root: process.cwd(),
	},
};

export default withPayload(nextConfig);
