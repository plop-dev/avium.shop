import ThemeToggle from '@/components/layout/ThemeToggle';

export default function Page() {
	return (
		<div className='flex h-screen items-center justify-center'>
			<ThemeToggle></ThemeToggle>
			<h1 className='text-2xl font-bold'>Welcome to Avium!</h1>
		</div>
	);
}
