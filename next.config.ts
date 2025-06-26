import { withPayload } from '@payloadcms/next/withPayload';
import type { NextConfig } from 'next';

export const runtime = 'edge';

const nextConfig: NextConfig = {
	/* config options here */
};

export default withPayload(nextConfig);
