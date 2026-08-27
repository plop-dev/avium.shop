import 'server-only';

export async function aviumServerFetch(path: string, init: RequestInit = {}) {
	const baseUrl = process.env.NEXT_PUBLIC_AVIUM_API_URL;
	const secret = process.env.AVIUM_ORDER_SERVER_SECRET;

	if (!baseUrl) {
		throw new Error('NEXT_PUBLIC_AVIUM_API_URL is not configured');
	}

	if (!secret) {
		throw new Error('AVIUM_ORDER_SERVER_SECRET is not configured');
	}

	const headers = new Headers(init.headers);

	headers.set('X-Internal-Token', secret);

	return fetch(`${baseUrl.replace(/\/$/, '')}/${path.replace(/^\//, '')}`, {
		...init,
		headers,
	});
}
