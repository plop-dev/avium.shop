import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SiteHeader } from '@/components/dashboard/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getUser } from '@/utils/getUser';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { Suspense } from 'react';

async function SidebarContent() {
	const user = await getUser();
	const payload = await getPayload({ config });

	const userDoc = await payload.findByID({
		collection: 'users',
		id: user?.id || '',
		overrideAccess: true,
	});

	return <AppSidebar variant='inset' isAdmin={userDoc.role !== 'customer'} />;
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider
			style={
				{
					'--sidebar-width': 'calc(var(--spacing) * 72)',
					'--header-height': 'calc(var(--spacing) * 12)',
				} as React.CSSProperties
			}>
			<Suspense fallback={<AppSidebar variant={'inset'} isAdmin={false} />}>
				<SidebarContent />
			</Suspense>
			<SidebarInset>
				<SiteHeader />
				{children}
			</SidebarInset>
		</SidebarProvider>
	);
}
