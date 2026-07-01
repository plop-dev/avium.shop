import { adminAccess } from '@/access/elevated';
import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
	slug: 'media',
	labels: { singular: 'Asset', plural: 'Assets' },
	admin: {
		useAsTitle: 'filename',
		defaultColumns: ['filename', 'mimeType', 'filesize', 'createdAt'],
	},
	access: {
		read: () => true,
		create: ({ req }) => adminAccess({ req }),
		update: ({ req }) => adminAccess({ req }),
		delete: ({ req }) => adminAccess({ req }),
	},
	upload: {
		mimeTypes: ['image/*', 'video/*'],
	},
	fields: [
		{
			name: 'alt',
			type: 'text',
			required: true,
			admin: { description: 'Alt text for images / caption for videos' },
		},
	],
};
