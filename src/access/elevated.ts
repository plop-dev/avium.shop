import type { PayloadRequest } from 'payload';

export const adminAccess = ({ req }: { req: PayloadRequest }) => {
	return req.user?.role === 'admin' || req.user?.role === 'developer';
};

export const staffAccess = ({ req }: { req: PayloadRequest }) => {
	return req.user?.role === 'employee' || req.user?.role === 'admin' || req.user?.role === 'developer';
};

export const devAccess = ({ req }: { req: PayloadRequest }) => {
	return req.user?.role === 'developer';
};

export const backendAccess = ({ req }: { req: PayloadRequest }) => {
	const expected = process.env.AVIUM_BACKEND_PASSWORD;

	if (!expected) {
		return false;
	}

	return req.headers.get('X-Internal-Token') === expected;
};
