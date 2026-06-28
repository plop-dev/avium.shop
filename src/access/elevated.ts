import type { Access } from 'payload';

export const adminAccess: Access = ({ req }) => {
	if (req.user?.role === 'admin' || req.user?.role === 'developer') {
		return true;
	} else {
		return false;
	}
};

export const devAccess: Access = ({ req }) => {
	if (req.user?.role === 'developer') {
		return true;
	} else {
		return false;
	}
};

export const backendAccess: Access = ({ req }) => {
	if (req.headers.get('X-Internal-Token') === process.env.AVIUM_BACKEND_PASSWORD) {
		return true;
	} else {
		return false;
	}
};
