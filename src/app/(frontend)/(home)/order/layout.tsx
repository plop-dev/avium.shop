export default function Layout({ custom, shop }: { custom: React.ReactNode; shop: React.ReactNode }) {
	return (
		<div className='flex flex-col gap-y-16'>
			{custom}
			{shop}
		</div>
	);
}
