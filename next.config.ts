import { withPayload } from '@payloadcms/next/withPayload';
import type { NextConfig } from 'next';

export const runtime = 'edge';

const nextConfig: NextConfig = {
	/* config options here */
	images: {
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
};

export default withPayload(nextConfig);
