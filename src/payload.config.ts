import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { payloadCloudPlugin } from '@payloadcms/payload-cloud';
import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import nodemailer from 'nodemailer';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import { authjsPlugin } from 'payload-authjs';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

import { Users } from '@/collections/Users';
import { authConfig } from '@/auth.config';
import { PrintingOptions } from '@/collections/PrintingOptions';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
	admin: {
		user: Users.slug,
		importMap: {
			baseDir: path.resolve(dirname),
		},
	},
	globals: [PrintingOptions],
	collections: [Users],
	editor: lexicalEditor(),
	secret: process.env.PAYLOAD_SECRET || '',
	typescript: {
		outputFile: path.resolve(dirname, 'payload-types.ts'),
	},
	db: mongooseAdapter({
		url: process.env.DATABASE_URI || '',
	}),
	sharp,
	plugins: [
		payloadCloudPlugin(),
		authjsPlugin({
			authjsConfig: authConfig,
		}),
	],
	email: nodemailerAdapter({
		defaultFromAddress: 'verify@avium.shop',
		defaultFromName: 'Avium',

		transport: nodemailer.createTransport({
			host: process.env.SMTP_HOST,
			port: 587,
			auth: {
				user: process.env.SMTP_USER,
				pass: process.env.SMTP_PASS,
			},
			tls: {
				rejectUnauthorized: false,
			},
		}),
	}),
});
