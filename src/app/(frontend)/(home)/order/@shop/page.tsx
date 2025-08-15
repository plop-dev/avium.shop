import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Printer } from 'lucide-react';

export default async function Shop() {
	return (
		<div className='flex flex-col gap-y-8 relative pt-8'>
			<div className=''>
				<h2 className=''>Shop</h2>
				<p className='text-muted-foreground mt-2'>Browse and discover our amazing products</p>
			</div>

			{/* Custom Prints Button */}
			<div className=''>
				<Button className='w-full text-lg py-6' size={'lg'}>
					<Printer className='h-5 w-5 mr-2' />
					Create Your Custom Print
				</Button>
			</div>

			{/* <div> */}

			<div className='flex items-center justify-between'>
				<div className='relative w-72'>
					<Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
					<Input type='search' placeholder='Search products...' className='pl-8' />
				</div>

				<div className='flex items-center gap-2'>
					<span className='text-sm'>Sort by:</span>
					<Select defaultValue='newest'>
						<SelectTrigger className='w-40'>
							<SelectValue placeholder='Sort by' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='newest'>Newest</SelectItem>
							<SelectItem value='price-low'>Price: Low to High</SelectItem>
							<SelectItem value='price-high'>Price: High to Low</SelectItem>
							<SelectItem value='popular'>Most Popular</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			<div className='grid grid-cols-4 gap-6'>
				{Array.from({ length: 16 }).map((_, i) => (
					<div
						key={i}
						className='h-auto rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col'>
						<div className='h-48 bg-muted flex items-center justify-center cursor-pointer rounded-t-lg'>
							<span className='text-muted-foreground'>Product Image</span>
						</div>
						<div className='p-4 flex flex-col flex-grow'>
							<h3 className='font-medium cursor-pointer'>Product {i + 1}</h3>
							<p className='text-sm text-muted-foreground mt-1'>Product description</p>
							<div className='mt-auto pt-3 flex items-center justify-between'>
								<span className='font-medium'>$19.99</span>
								<Button variant='default' size='sm'>
									Add to cart
								</Button>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
		// </div>
	);
}
