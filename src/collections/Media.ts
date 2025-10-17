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
		create: () => true,
		update: () => true,
		delete: () => true,
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
