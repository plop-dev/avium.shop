'use client';

import { ShoppingBasket, FileText, Package, AlertCircle } from 'lucide-react';
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from './ui/drawer';
import { Button, buttonVariants } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';
import BasketItem from './BasketItem';
import numToGBP from '@/utils/numToGBP';
import { useStore } from '@nanostores/react';
import { $basket, setItemQuantity, CustomPrint, ShopProduct, BasketItem as BasketItemType } from '@/stores/basket';
import { $orderValidation } from '@/stores/order';

// Type guards
const isCustomPrint = (item: BasketItemType): item is CustomPrint => {
	return 'model' in item;
};

const isShopProduct = (item: BasketItemType): item is ShopProduct => {
	return 'product' in item;
};

export default function Basket() {
	const [totalItems, setTotalItems] = useState(0);
	const basketItems = useStore($basket);
	const orderValidation = useStore($orderValidation);

	const handleQuantityChange = (id: string, newQuantity: number) => {
		setItemQuantity(id, newQuantity);
	};

	const handleRemoveItem = (id: string) => {
		setItemQuantity(id, 0);
	};

	useEffect(() => {
		setTotalItems(basketItems.reduce((sum, item) => sum + item.quantity, 0));
	}, [basketItems]);

	// Separate items by type
	const customPrints = basketItems.filter(isCustomPrint);
	const shopProducts = basketItems.filter(isShopProduct);

	// Check if we have any custom prints that need a valid order name
	const hasCustomPrints = customPrints.length > 0;
	const isCheckoutDisabled = basketItems.length === 0 || (hasCustomPrints && !orderValidation.orderNameValid);

	return (
		<Drawer direction='right' autoFocus={true}>
			<DrawerTrigger asChild>
				<div className={cn(buttonVariants({ variant: 'outline' }), '')}>
					<ShoppingBasket />
					<span className='sr-only'>Open Basket</span>
					<p className='font-bold'>{totalItems}</p>
				</div>
			</DrawerTrigger>
			<DrawerContent className='!max-w-md'>
				<DrawerHeader>
					<DrawerTitle>Your Basket</DrawerTitle>
					<DrawerDescription>View the custom prints or shop products you've added to your basket.</DrawerDescription>
				</DrawerHeader>

				<div className='px-4 flex-1 overflow-y-auto'>
					{basketItems.length > 0 ? (
						<div className='space-y-4'>
							{customPrints.length > 0 && (
								<div>
									<div className='flex items-center gap-2 mb-3'>
										<FileText className='h-4 w-4' />
										<h3 className='font-semibold text-sm'>Custom Prints</h3>
									</div>
									{customPrints.map(item => (
										<BasketItem
											key={item.id}
											item={item}
											onQuantityChange={handleQuantityChange}
											onRemove={handleRemoveItem}
										/>
									))}
								</div>
							)}

							{customPrints.length > 0 && shopProducts.length > 0 && <Separator />}

							{shopProducts.length > 0 && (
								<div>
									<div className='flex items-center gap-2 mb-3'>
										<Package className='h-4 w-4' />
										<h3 className='font-semibold text-sm'>Shop Products</h3>
									</div>
									{shopProducts.map(item => (
										<BasketItem
											key={item.id}
											item={item}
											onQuantityChange={handleQuantityChange}
											onRemove={handleRemoveItem}
										/>
									))}
								</div>
							)}
						</div>
					) : (
						<div className='text-center py-8 text-muted-foreground'>
							<ShoppingBasket className='h-12 w-12 mx-auto mb-2 opacity-50' />
							<p>Your basket is empty</p>
						</div>
					)}
				</div>

				<DrawerFooter>
					<div className=''>
						<h3 className='font-bold text-xl'>Total:</h3>
						<p>{numToGBP(basketItems.reduce((sum, item) => sum + item.price * item.quantity, 0))}</p>
					</div>

					{hasCustomPrints && !orderValidation.orderNameValid && (
						<div className='flex items-center gap-2 text-amber-500 text-sm mb-2'>
							<AlertCircle className='h-4 w-4' />
							<p>Please provide a valid order name for your custom prints</p>
						</div>
					)}

					<Button disabled={isCheckoutDisabled}>
						<ShoppingBasket className='mr-2' />
						Checkout ({totalItems} {totalItems === 1 ? 'item' : 'items'})
					</Button>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
