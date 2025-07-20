import { anyoneAccess } from '@/access/anyone';
import { adminAccess, devAccess } from '@/access/elevated';
import { getServerSideURL } from '@/utils/getServerSideUrl';
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
		verify: {
			generateEmailSubject(args) {
				return `Verify your email address`;
			},
			generateEmailHTML(args) {
				const verificationURL = `${getServerSideURL()}/auth/verify-email?token=${args.token}`;

				return `
					<!DOCTYPE html>
					<html>
					<head>
						<meta charset="utf-8">
						<meta name="viewport" content="width=device-width, initial-scale=1.0">
						<title>Verify your email address</title>
					</head>
					<body style="margin: 0; padding: 0; font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f4f4f5; color: #18181b;">
						<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0; padding: 0; width: 100%; background-color: #f4f4f5;">
							<tr>
								<td align="center" style="padding: 40px 0;">
									<table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="margin: 0; padding: 0; width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);">
										<!-- Header -->
										<tr>
											<td style="padding: 32px 40px; text-align: center; background-color: #27104e; border-radius: 8px 8px 0 0;">
												<h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #ffffff;">Avium</h1>
											</td>
										</tr>
										
										<!-- Content -->
										<tr>
											<td style="padding: 40px;">
												<p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #18181b;">Hi ${args.user.name || 'there'},</p>
												<p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #18181b;">Please verify your email address by clicking the button below:</p>
												
												<!-- Verification Button -->
												<table width="100%" cellpadding="0" cellspacing="0" role="presentation">
													<tr>
														<td align="center" style="padding: 16px 0 32px;">
															<a href="${verificationURL}" target="_blank" style="display: inline-block; padding: 10px 16px; background-color: #27104e; border-radius: 6px; font-size: 14px; font-weight: 500; color: #ffffff; text-decoration: none; text-align: center; box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);">Verify Email Address</a>
														</td>
													</tr>
												</table>
												
												<p style="margin: 0 0 24px; font-size: 16px; line-height: 24px; color: #18181b;">Or copy and paste this URL into your browser:</p>
												<p style="margin: 0 0 32px; font-size: 14px; line-height: 24px; color: #71717a; word-break: break-all;">
													<a href="${verificationURL}" style="color: #27104e; text-decoration: underline;">${verificationURL}</a>
												</p>
												
												<p style="margin: 0; font-size: 16px; line-height: 24px; color: #18181b;">If you didn't request this verification, you can safely ignore this email.</p>
											</td>
										</tr>
										
										<!-- Footer -->
										<tr>
											<td style="padding: 24px 40px; text-align: center; background-color: #f5f2fa; border-radius: 0 0 8px 8px;">
												<p style="margin: 0; font-size: 14px; line-height: 20px; color: #71717a;">
													&copy; ${new Date().getFullYear()} Avium. All rights reserved.
												</p>
											</td>
										</tr>
									</table>
								</td>
							</tr>
						</table>
					</body>
					</html>
				`;
			},
		},
		useAPIKey: true,
		maxLoginAttempts: 5,
		lockTime: 30 * 60 * 1000, // 30 minutes
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
