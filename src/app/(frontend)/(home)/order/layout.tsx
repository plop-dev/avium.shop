import OrderNameHeader from './OrderNameHeader';

export default function Layout({ custom, shop }: { custom: React.ReactNode; shop: React.ReactNode }) {
	return (
		<div className='max-w-5xl mx-auto flex flex-col mt-8 px-4 md:px-8 pb-16'>
			<OrderNameHeader />

			<div className='mt-4 space-y-8'>
				{/* Options heading */}
				<div className='text-center'>
					<div className='inline-flex items-center justify-center'>
						<div className='rounded-full w-8 h-8 flex items-center justify-center bg-muted text-muted-foreground font-medium'>
							2
						</div>
						<h2 className='ml-2 text-lg font-medium'>Choose what to add to your order</h2>
					</div>
				</div>

				{/* Custom Prints Section */}
				<div className='rounded-lg border border-border overflow-hidden'>
					<div className='bg-muted/30 px-6 py-3 border-b'>
						<h3 className='font-medium'>Option A: Create Custom Prints</h3>
					</div>
					<div className='p-6'>{custom}</div>
				</div>

				{/* Shop Products Section */}
				<div className='rounded-lg border border-border overflow-hidden'>
					<div className='bg-muted/30 px-6 py-3 border-b'>
						<h3 className='font-medium'>Option B: Browse Shop Products</h3>
					</div>
					<div className='p-6'>{shop}</div>
				</div>
			</div>
		</div>
	);
}
