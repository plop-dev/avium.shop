import 'server-only';

import crypto from 'node:crypto';

export type SliceTokenPayload = {
	v: 1;
	userId: string;
	quoteId: string;
	exp: number;
};

function getSecret() {
	const secret = process.env.SLICE_TOKEN_SECRET;

	if (!secret) {
		throw new Error('SLICE_TOKEN_SECRET is not configured');
	}

	return secret;
}

export function createSliceToken(payload: SliceTokenPayload) {
	const encoded = Buffer.from(JSON.stringify(payload)).toString('base64url');

	const signature = crypto.createHmac('sha256', getSecret()).update(encoded).digest('base64url');

	return `${encoded}.${signature}`;
}
