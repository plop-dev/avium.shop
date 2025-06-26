import PageContainer from '@/components/layout/PageContainer';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
	return <PageContainer>{children}</PageContainer>;
}
