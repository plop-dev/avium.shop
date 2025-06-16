import type { CollectionConfig } from 'payload';

export const Media: CollectionConfig = {
	slug: 'media',
	labels: {
		singular: 'Media',
		plural: 'Media',
	},
	admin: {
		description: 'Manage uploaded files and media',
	},
	upload: {
		staticDir: 'uploads',
		imageSizes: [
			{
				name: 'thumbnail',
				width: 400,
				height: 300,
				position: 'centre',
			},
			{
				name: 'card',
				width: 768,
				height: 1024,
				position: 'centre',
			},
		],
		adminThumbnail: 'thumbnail',
		mimeTypes: ['image/*', 'application/pdf', 'model/*', 'application/octet-stream'],
	},
	fields: [
		{
			name: 'alt',
			type: 'text',
			admin: {
				description: 'Alternative text for images (important for accessibility)',
			},
		},
		{
			name: 'caption',
			type: 'text',
			admin: {
				description: 'Caption to display with the media',
			},
		},
	],
	access: {
		read: () => true,
	},
};

export default Media;
