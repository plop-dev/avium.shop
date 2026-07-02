import { AppSidebar } from '@/components/dashboard/app-sidebar';
import { SiteHeader } from '@/components/dashboard/site-header';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import { getUser } from '@/utils/getUser';
import { getPayload } from 'payload';
import config from '@/payload.config';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	const user = await getUser();
	const payload = await getPayload({ config });

	const userDoc = await payload.findByID({
		collection: 'users',
		id: user?.id || '',
		overrideAccess: true,
	});

	return (
		<SidebarProvider
			style={
				{
					'--sidebar-width': 'calc(var(--spacing) * 72)',
					'--header-height': 'calc(var(--spacing) * 12)',
				} as React.CSSProperties
			}>
			<AppSidebar variant='inset' isAdmin={userDoc.role !== 'customer'} />
			<SidebarInset>
				<SiteHeader />
				{children}
			</SidebarInset>
		</SidebarProvider>
	);
}
