function requireEnv(name: string): string {
	const value = process.env[name];

	if (!value || value.trim() === '') {
		throw new Error(`Missing required environment variable: ${name}`);
	}

	return value;
}

export const DATABASE_URI = requireEnv('DATABASE_URI');
export const PAYLOAD_SECRET = requireEnv('PAYLOAD_SECRET');
export const AUTH_SECRET = requireEnv('AUTH_SECRET');
export const NEXT_PUBLIC_AVIUM_API_URL = requireEnv('NEXT_PUBLIC_AVIUM_API_URL');
