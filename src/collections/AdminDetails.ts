import { GlobalConfig } from 'payload';

export const AdminDetails: GlobalConfig = {
	slug: 'admin-details',
	label: 'Admin Details',
	fields: [
		{
			name: 'shippingAddress',
			type: 'group',
			required: true,
			fields: [
				{
					name: 'fullName',
					type: 'text',
				},
				{
					name: 'line1',
					type: 'text',
				},
				{
					name: 'line2',
					type: 'text',
				},
				{
					name: 'city',
					type: 'text',
				},
				{
					name: 'county',
					type: 'text',
				},
				{
					name: 'postcode',
					type: 'text',
				},
				{
					name: 'country',
					type: 'text',
				},
			],
		},
	],
};
