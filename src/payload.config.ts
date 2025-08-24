import { mongooseAdapter } from '@payloadcms/db-mongodb';
import { nodemailerAdapter } from '@payloadcms/email-nodemailer';
import nodemailer from 'nodemailer';
import { lexicalEditor } from '@payloadcms/richtext-lexical';
import path from 'path';
import { buildConfig } from 'payload';
import { authjsPlugin } from 'payload-authjs';
import { searchPlugin } from '@payloadcms/plugin-search';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { vercelBlobStorage } from '@payloadcms/storage-vercel-blob';

import { Users } from '@/collections/Users';
import { authConfig } from '@/auth.config';
import { PrintingOptions } from '@/collections/PrintingOptions';
import { Orders } from '@/collections/Order';
import { Presets } from '@/collections/Presets';
import { Products } from '@/collections/Products';
import { Media } from '@/collections/Media';

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

export default buildConfig({
	admin: {
		user: Users.slug,
		importMap: {
			baseDir: path.resolve(dirname),
		},
		avatar: 'default',
		dateFormat: 'dd/MM/yyyy',
	},
	globals: [PrintingOptions],
	collections: [Users, Orders, Presets, Products, Media],
	editor: lexicalEditor(),
	secret: process.env.PAYLOAD_SECRET || '',
	typescript: {
		outputFile: path.resolve(dirname, 'payload-types.ts'),
	},
	db: mongooseAdapter({
		url: process.env.DATABASE_URI || '',
	}),
	sharp,
	serverURL: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
	plugins: [
		authjsPlugin({
			authjsConfig: authConfig,
			enableLocalStrategy: true,
			userCollectionSlug: 'users',
		}),
		vercelBlobStorage({
			enabled: true,
			collections: {
				media: true,
			},
			token: process.env.BLOB_READ_WRITE_TOKEN,
		}),
		searchPlugin({
			collections: ['products'],
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
