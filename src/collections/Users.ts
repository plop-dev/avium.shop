import { anyoneAccess } from '@/access/anyone';
import { adminAccess, devAccess } from '@/access/elevated';
import type { CollectionConfig } from 'payload';

export const Users: CollectionConfig = {
	slug: 'users',
	admin: {
		useAsTitle: 'name',
	},
	access: {
		read: anyoneAccess,
		update: anyoneAccess,
		create: anyoneAccess,
		delete: () => false,
		unlock: anyoneAccess,
	},
	auth: {
		verify: true,
	},
	fields: [
		{
			name: 'name',
			type: 'text',
			required: true,
			admin: {
				placeholder: 'Enter your full name',
			},
		},
		{
			name: 'email',
			type: 'email',
			required: true,
			admin: {
				placeholder: 'Enter your email address',
			},
		},

		{
			name: 'role',
			type: 'select',
			defaultValue: 'customer',
			options: [
				{
					label: 'Customer',
					value: 'customer',
				},
				{
					label: 'Employee',
					value: 'employee',
				},
				{
					label: 'Admin',
					value: 'admin',
				},
				{
					label: 'Developer',
					value: 'developer',
				},
			],
		},

		{
			name: 'address',
			type: 'array',
			fields: [
				{ name: 'line1', type: 'text', required: true },
				{ name: 'line2', type: 'text' },
				{ name: 'city', type: 'text', required: true },
				{ name: 'postalCode', type: 'text', required: true },
				{ name: 'country', type: 'text', required: true },
			],
		},

		{
			name: 'orders',
			type: 'relationship',
			relationTo: 'orders',
			hasMany: true,
		},

		{
			name: 'subscription',
			type: 'group',
			fields: [
				{
					name: 'plan',
					type: 'select',
					options: [
						{ label: 'None', value: 'none' },
						{ label: 'Avium Plus', value: 'plus' },
						//? { label: 'Avium Pro', value: 'pro' }
					],
					defaultValue: 'none',
				},
				{
					name: 'status',
					type: 'select',
					options: ['Active', 'PastDue', 'Unpaid', 'Paused'],
				},
				{ name: 'stripeSubscriptionId', type: 'text' },
				{ name: 'currentPeriodStart', type: 'date' },
				{ name: 'currentPeriodEnd', type: 'date' },
			],
		},

		{
			name: 'stripeCustomerId',
			type: 'text',
		},
	],
};
