import type { Access, PayloadRequest } from 'payload';

export const anyoneAccess: Access = () => {
	return true;
};

export const noAccess: Access = () => {
	return false;
};

export const selfAccessOrders = ({ req }: { req: PayloadRequest }) => {
	if (req.user) {
		return { customer: { equals: req.user.id } };
	}
	return false;
};

export const selfAccess = ({ req }: { req: PayloadRequest }) => {
	if (req.user) {
		return { id: { equals: req.user.id } };
	}
	return false;
};
