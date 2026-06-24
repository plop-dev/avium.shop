import type { Access } from 'payload';

export const anyoneAccess: Access = () => {
	return true;
};

export const noAccess: Access = () => {
	return false;
};
