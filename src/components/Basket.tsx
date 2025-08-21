'use client';

import { ShoppingBasket } from 'lucide-react';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from './ui/drawer';
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import BasketItem from './BasketItem';

// Mock data based on your schema
const mockBasketData = [
	{
		id: '1',
		file: { name: 'miniature.stl', size: 5 * 1024 * 1024 },
		quantity: 2,
		printingOptions: { preset: 'High Quality', infill: 20 },
	},
	{
		id: '2',
		file: { name: 'phone_case.obj', size: 12 * 1024 * 1024 },
		quantity: 1,
		printingOptions: { layerHeight: 0.2, infill: 50 },
	},
];

export default function Basket() {
	const [basketItems, setBasketItems] = useState(mockBasketData);

	const handleQuantityChange = (id: string, newQuantity: number) => {
		setBasketItems(items => items.map(item => (item.id === id ? { ...item, quantity: newQuantity } : item)));
	};

	const handleRemoveItem = (id: string) => {
		setBasketItems(items => items.filter(item => item.id !== id));
	};

	const totalItems = basketItems.reduce((sum, item) => sum + item.quantity, 0);

	return (
		<Drawer direction='right' autoFocus={true}>
			<DrawerTrigger asChild>
				<div className={cn(buttonVariants({ variant: 'outline' }), '')}>
					<ShoppingBasket />
					<span className='sr-only'>Open Basket</span>
					<p className='font-bold'>{totalItems}</p>
				</div>
			</DrawerTrigger>
			<DrawerContent className='max-w-md'>
				<DrawerHeader>
					<DrawerTitle>Your Basket</DrawerTitle>
					<DrawerDescription>View the custom prints or shop products you've added to your basket.</DrawerDescription>
				</DrawerHeader>

				<div className='px-4 flex-1 overflow-y-auto'>
					{basketItems.length > 0 ? (
						basketItems.map(item => (
							<BasketItem key={item.id} print={item} onQuantityChange={handleQuantityChange} onRemove={handleRemoveItem} />
						))
					) : (
						<div className='text-center py-8 text-muted-foreground'>
							<ShoppingBasket className='h-12 w-12 mx-auto mb-2 opacity-50' />
							<p>Your basket is empty</p>
						</div>
					)}
				</div>

				<DrawerFooter>
					<Button disabled={basketItems.length === 0}>
						<ShoppingBasket className='mr-2' />
						Checkout ({totalItems} {totalItems === 1 ? 'item' : 'items'})
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
