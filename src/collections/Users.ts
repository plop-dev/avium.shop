import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
	slug: 'users',
	admin: {
		useAsTitle: 'email',
	},
	auth: {
		verify: true,
	},
	fields: [],
};
