export default function Layout({ custom, shop }: { custom: React.ReactNode; shop: React.ReactNode }) {
	return (
		<div className='grid grid-cols-2 gap-x-8 max-h-screen'>
			{custom}
			{shop}
		</div>
	);
}
