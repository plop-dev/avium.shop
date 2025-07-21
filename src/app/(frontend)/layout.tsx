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
import { Analytics } from '@vercel/analytics/next';
import { auth } from '@/auth';
import { loadSearchParams } from './(home)/(auth)/auth/login/searchParams';
import { SearchParams } from 'nuqs/server';
import { MessageToaster } from '@/components/MessageToaster';

export const metadata: Metadata = {
	title: 'Avium',
	description: 'Avium makes 3d printing simple and affordable',
};

const dmSans = DM_Sans({
	subsets: ['latin'],
	weight: ['200', '300', '400', '500', '600', '700', '800', '900'],
	style: ['normal'],
});

export default async function RootLayout({ children, searchParams }: { children: React.ReactNode; searchParams: Promise<SearchParams> }) {
	// const cookieStore = await cookies();
	const session = await auth();
	const { error, success, message } = await loadSearchParams(searchParams);

	return (
		<>
			<html lang='en' suppressHydrationWarning className={dmSans.className}>
				<head />
				<body className='bg-background overflow-hidden overscroll-none font-sans antialiased'>
					<NextTopLoader showSpinner={false}></NextTopLoader>
					<Analytics></Analytics>
					<NuqsAdapter>
						<SessionProvider session={session}>
							<ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange enableColorScheme>
								<Toaster richColors theme='system'></Toaster>
								<>
									<MessageToaster error={error} success={success} message={message}></MessageToaster>
									{children}
								</>
							</ThemeProvider>
						</SessionProvider>
					</NuqsAdapter>
				</body>
			</html>
		</>
	);
}
