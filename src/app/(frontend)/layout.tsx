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
	title: 'Avium',
	description: 'Avium makes 3d printing simple and affordable',
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
				<head />
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
