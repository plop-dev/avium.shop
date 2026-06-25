import type { Access } from 'payload';

export const anyoneAccess: Access = () => {
	return true;
};

export const noAccess: Access = () => {
	return false;
};

export const selfAcess: Access = ({ req }) => {
	if (req.user) {
		return { id: { equals: req.user.id } };
	}
	return false;
};
