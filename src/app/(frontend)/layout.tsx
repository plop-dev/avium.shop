import '@/app/styles/globals.css';

import { ThemeProvider } from '@/components/ThemeProvider';
import { cookies } from 'next/headers';
import React from 'react';
import { Toaster } from 'sonner';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { DM_Sans } from 'next/font/google';

export const metadata: Metadata = {
	title: 'Avium',
	description: 'Avium offers cheap and simple 3d printing services',
};

const dmSans = DM_Sans({
	subsets: ['latin'],
	weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
	style: ['normal'],
});

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const cookieStore = await cookies();

	return (
		<>
			<html lang='en' suppressHydrationWarning className={dmSans.className}>
				<head />
				<body className='bg-background overflow-hidden overscroll-none font-sans antialiased'>
					<NextTopLoader showSpinner={false}></NextTopLoader>
					<NuqsAdapter>
						<SessionProvider>
							<ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange enableColorScheme>
								<Toaster></Toaster>
								{children}
							</ThemeProvider>
						</SessionProvider>
					</NuqsAdapter>
				</body>
			</html>
		</>
	);
}
