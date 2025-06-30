import PageContainer from '@/components/layouts/PageContainer';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	return <PageContainer>{children}</PageContainer>;
}
