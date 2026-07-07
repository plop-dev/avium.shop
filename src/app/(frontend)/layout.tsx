import '@/app/styles/globals.css';

import { ThemeProvider } from '@/components/ThemeProvider';
import React, { Suspense } from 'react';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { DM_Sans } from 'next/font/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';
import Script from 'next/script';
import { MessageToaster } from '@/components/MessageToaster';
import CustomToaster from '@/components/layouts/CustomToaster';
import NanostoreManager from '@/components/NanostoreManager';

export const metadata: Metadata = {
	title: 'Avium | 3D Printing',
	applicationName: 'Avium | 3D Printing',
	description: 'Avium makes 3d printing simple and affordable',
	generator: 'Next.js',
	keywords: [
		'3d printing',
		'3d printing service',
		'3d printing marketplace',
		'3d printing marketplace near me',
		'3d printing marketplace for businesses',
		'3d printing marketplace for individuals',
		'3d printing marketplace for designers',
		'3d printing marketplace for engineers',
	],
	openGraph: {
		type: 'website',
		locale: 'en_GB',
		countryName: 'United Kingdom',
		description: 'Avium makes 3d printing simple and affordable',
		emails: 'support@avium.shop',
		images: [{ url: 'https://avium.shop/og-image.png' }],
	},
	publisher: 'Vercel',
	icons: {
		icon: [{ url: '/favicon.ico' }],
	},
};

const dmSans = DM_Sans({
	subsets: ['latin'],
	weight: ['400', '500', '600', '900'],
	style: ['normal'],
	display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<>
			<html lang='en' suppressHydrationWarning className={dmSans.className}>
				<head></head>
				<body className='bg-background font-sans antialiased'>
					<NextTopLoader showSpinner={false}></NextTopLoader>
					<Analytics></Analytics>
					<SpeedInsights></SpeedInsights>
					<NuqsAdapter>
						<SessionProvider>
							<CustomToaster></CustomToaster>
							<ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange enableColorScheme>
								<Suspense fallback={null}>
									<MessageToaster></MessageToaster>
									<NanostoreManager></NanostoreManager>
								</Suspense>
								{children}
							</ThemeProvider>
						</SessionProvider>
					</NuqsAdapter>
				</body>
			</html>
		</>
	);
}
