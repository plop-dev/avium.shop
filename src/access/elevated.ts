import type { Access, PayloadRequest } from 'payload';

export const adminAccess = ({ req }: { req: PayloadRequest }) => {
	if (req.user?.role === 'admin' || req.user?.role === 'developer') {
		return true;
	} else {
		return false;
	}
};

export const devAccess = ({ req }: { req: PayloadRequest }) => {
	if (req.user?.role === 'developer') {
		return true;
	} else {
		return false;
	}
};

export const backendAccess = ({ req }: { req: PayloadRequest }) => {
	if (req.headers.get('X-Internal-Token') === process.env.AVIUM_BACKEND_PASSWORD) {
		return true;
	} else {
		return false;
	}
};
