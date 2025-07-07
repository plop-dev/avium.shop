import { withPayload } from '@payloadcms/next/withPayload';
import type { NextConfig } from 'next';

export const runtime = 'edge';

const nextConfig: NextConfig = {
	/* config options here */
	images: {
		remotePatterns: [
			{
				protocol: 'https',
				hostname: '*.googleusercontent.com',
			},
		],
	},
};

export default withPayload(nextConfig);
