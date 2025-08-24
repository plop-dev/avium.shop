'use client';

import { Button } from '@/components/ui/button';
import { Product } from '@/payload-types';
import { addToBasket } from '@/stores/basket';
import numToGBP from '@/utils/numToGBP';
import Image from 'next/image';

export default function ShopProduct({ key, product }: { key: number; product: Product }) {
	const handleAddToCart = (product: Product) => {
		addToBasket(product);
	};

	return (
		<div key={key} className='h-auto min-w-48 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col'>
			<div className='h-48 flex items-center justify-center cursor-pointer rounded-t-lg'>
				{typeof product.pictures[0] === 'string' ? (
					<img className='h-48 w-48 aspect-square bg-cover mask-cover' src={product.pictures[0]} alt='Product Image'></img>
				) : (
					<Image
						className='h-48 w-48 aspect-square bg-cover mask-cover'
						src={product.pictures[0].url ?? '#'}
						width={product.pictures[0].width ?? 512}
						height={product.pictures[0].width ?? 512}
						alt={product.pictures[0].alt}></Image>
				)}
			</div>
			<div className='p-4 flex flex-col flex-grow'>
				<h3 className='font-medium cursor-pointer'>{product.name}</h3>
				<p className='text-sm text-muted-foreground mt-1'>{product.description}</p>
				<div className='mt-auto pt-3 flex items-center justify-between'>
					<span className='font-medium'>{numToGBP(product.price)}</span>
					<Button variant='default' size='sm' onClick={() => handleAddToCart(product)}>
						Add to cart
					</Button>
				</div>
			</div>
		</div>
	);
}
