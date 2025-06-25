import { ThemeProvider } from '@/components/ThemeProvider';
import { cookies } from 'next/headers';
import React from 'react';
import { Toaster } from 'sonner';
import NextTopLoader from 'nextjs-toploader';
import { NuqsAdapter } from 'nuqs/adapters/next/app';
import { Metadata } from 'next';

export const metadata: Metadata = {
	title: 'Avium',
	description: 'Avium offers cheap and simple 3d printing services',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
	const cookieStore = await cookies();

	return (
		<>
			<html lang='en' suppressHydrationWarning>
				<head />
				<body className='bg-background overflow-hidden overscroll-none font-sans antialiased'>
					<NextTopLoader showSpinner={false}></NextTopLoader>
					<NuqsAdapter>
						<ThemeProvider attribute='class' defaultTheme='system' enableSystem disableTransitionOnChange enableColorScheme>
							<Toaster></Toaster>
							{children}
						</ThemeProvider>
					</NuqsAdapter>
				</body>
			</html>
		</>
	);
}
