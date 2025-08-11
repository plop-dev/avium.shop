import { AppSidebar } from '@/components/dashboard/Sidebar';
import PageContainer from '@/components/layouts/PageContainer';
import { SidebarProvider } from '@/components/ui/sidebar';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	return (
		<SidebarProvider>
			<AppSidebar />
			<main>
				<PageContainer>{children}</PageContainer>
			</main>
		</SidebarProvider>
	);
}
