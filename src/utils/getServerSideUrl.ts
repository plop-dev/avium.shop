/**
 * INCLUDES HTTP(S)
 *
 * @returns The server URL as a string
 */
export function getServerSideURL(): string {
	if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
		return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
	}

	if (process.env.VERCEL_URL) {
		return `https://${process.env.VERCEL_URL}`;
	}

	return process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
}
