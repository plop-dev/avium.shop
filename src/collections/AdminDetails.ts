import { adminAccess } from '@/access/elevated';
import { GlobalConfig } from 'payload';

export const AdminDetails: GlobalConfig = {
	slug: 'admin-details',
	label: 'Admin Details',
	access: {
		update: ({ req }) => adminAccess({ req }),
		read: ({ req }) => adminAccess({ req }),
	},
	fields: [
		{
			name: 'shippingAddress',
			type: 'group',
			required: true,
			fields: [
				{
					name: 'fullName',
					type: 'text',
					required: true,
				},
				{
					name: 'line1',
					type: 'text',
					required: true,
				},
				{
					name: 'line2',
					type: 'text',
					required: false,
				},
				{
					name: 'city',
					type: 'text',
					required: true,
				},
				{
					name: 'county',
					type: 'text',
					required: true,
				},
				{
					name: 'postcode',
					type: 'text',
					required: true,
				},
				{
					name: 'country',
					type: 'text',
					required: true,
				},
			],
		},
	],
};
