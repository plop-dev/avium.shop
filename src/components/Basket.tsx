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
import { $basket, setItemQuantity, CustomPrint, ShopProduct, BasketItem as BasketItemType, resetBasket } from '@/stores/basket';
import { $orderValidation, $orderDetails, setOrderDetails, setOrderNameValid } from '@/stores/order';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { LoadingSwap } from './ui/loading-swap';
import { useRouter } from 'next/navigation';
import { Order } from '@/payload-types';
import { Where } from 'payload';
import { checkout } from '@/actions/checkout';
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const isCustomPrint = (item: BasketItemType): item is CustomPrint => {
	return 'model' in item;
};

const isShopProduct = (item: BasketItemType): item is ShopProduct => {
	return 'product' in item;
};

export default function Basket() {
	const router = useRouter();
	const [totalItems, setTotalItems] = useState(0);
	const basketItems = useStore($basket);
	const orderValidation = useStore($orderValidation);

	const orderDetails = useStore($orderDetails);
	const [orderCommentsLocal, setOrderCommentsLocal] = useState<string | null>(orderDetails.comments || '');

	const handleQuantityChange = (id: string, newQuantity: number) => {
		setItemQuantity(id, newQuantity);
	};

	const handleRemoveItem = (id: string) => {
		setItemQuantity(id, 0);
	};

	useEffect(() => {
		setTotalItems(basketItems.reduce((sum, item) => sum + item.quantity, 0));
	}, [basketItems]);

	useEffect(() => {
		setOrderCommentsLocal(orderDetails.comments || '');
	}, [orderDetails.comments]);

	// Separate items by type
	const customPrints = basketItems.filter(isCustomPrint);
	const shopProducts = basketItems.filter(isShopProduct);

	const hasCustomPrints = customPrints.length > 0;
	const isCheckoutDisabled = basketItems.length === 0 || !orderValidation.orderNameValid;

	const [isSubmitting, setIsSubmitting] = useState(false);

	// New: handle checkout - create order in Payload via REST API (/api/orders)
	const handleCheckout = async () => {
		if (isCheckoutDisabled) return;

		setIsSubmitting(true);

		// Map basket items to Payload Order.prints shapes
		const prints = basketItems.map(item => {
			if (isCustomPrint(item)) {
				// custom print shape
				return {
					blockType: 'customPrint',
					quote: item.id,
					model: item.model,
					printingOptions: item.printingOptions,
					quantity: item.quantity,
					price: 0, // price will be calculated server-side based on the quote
				};
			}

			// shop product shape
			const shopItem = item as ShopProduct;
			return {
				blockType: 'shopProduct',
				product: shopItem.id,
				quantity: shopItem.quantity,
				price: 0, // price will be calculated server-side based on the product
			};
		});

		const me = await fetch('/api/users/me');
		if (me.status !== 200) {
			toast.error('Failed to retrieve user information.');
			setIsSubmitting(false);
			return;
		}
		const userId = (await me.json()).user.id;

		const orders = await (
			await fetch(`/api/orders?sort=-queue&limit=1&select[queue]=true&depth=0`, {
				method: 'GET',
			})
		).json();
		const queue = orders?.docs?.[0]?.queue ? orders.docs[0].queue + 1 : 1;

		const payload = {
			name: (orderValidation && orderValidation.orderName) || `Order ${new Date().toISOString()}`,
			customer: userId,
			prints,
			queue,
			status: {
				statuses: [
					{
						stage: 'in-queue',
						timestamp: new Date().toISOString(),
					},
				],
				currentStatus: 'in-queue',
			},
			comments: orderDetails.comments,
			pricing: {
				shipping: 300,
				tax: 0,
			},
			payment: {
				status: 'awaiting-payment',
			},
		};

		// create order
		const res = await fetch('/api/orders', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(payload),
			credentials: 'include', // include cookies
		});

		if (!res.ok) {
			const text = await res.json();
			console.log('Failed to create order: ', text.errors.join('\n'));
			toast.error('Failed to create order');
			setIsSubmitting(false);
			return;
		}

		const resJSON = await res.json();

		toast.success('Order created successfully.');

		toast.info('Redirecting to checkout...');
		const checkoutRes = await checkout(resJSON.doc.id);

		if (checkoutRes.success && checkoutRes.message) {
			setOrderDetails({ orderName: '', comments: '' });
			setOrderNameValid(false, '');
			resetBasket();

			router.push(checkoutRes.message);
		} else {
			// mark the checkout as failed
			await fetch(`/api/orders/${resJSON.doc.id}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					payment: {
						status: 'checkout-failed',
					},
				}),
				credentials: 'include',
			}).catch(err => {
				console.error('Failed to mark order as checkout-failed: ', err);
			});

			toast.error(checkoutRes.message || 'Failed to create checkout session. Please try again, or visit your dashboard.');
			setIsSubmitting(false);

			return;
		}
	};

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
					<DrawerDescription>View the custom prints or shop products you&apos;ve added to your basket.</DrawerDescription>
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
											progress={100}
										/>
									))}

									{/* Order comments for custom prints */}
									<div className='mt-3'>
										<label
											htmlFor='basketOrderComments'
											className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'>
											Order Comments (Optional)
										</label>
										<Textarea
											id='basketOrderComments'
											placeholder='Any special instructions, material preferences, or questions about your order?'
											value={orderCommentsLocal || ''}
											onChange={e => {
												setOrderCommentsLocal(e.target.value);
												setOrderDetails({ orderName: orderValidation.orderName || '', comments: e.target.value });
											}}
											className='min-h-[80px] w-full mt-2'
										/>
										<p className='text-sm text-muted-foreground mt-2'>These comments will apply to the entire order</p>
									</div>
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
											progress={100}
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
						<h3 className='font-bold text-xl'>Estimated total:</h3>
						<p>{numToGBP(basketItems.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0))}</p>
					</div>

					{!orderValidation.orderNameValid && (
						<div className='flex items-center gap-2 text-amber-500 text-sm mb-2'>
							<AlertCircle className='h-4 w-4' />
							<p>Please provide a valid order name for your custom prints</p>
						</div>
					)}

					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button disabled={isCheckoutDisabled || isSubmitting}>
								<LoadingSwap isLoading={isSubmitting}>
									<div className='flex'>
										<ShoppingBasket className='mr-2' />
										Checkout ({totalItems} {totalItems === 1 ? 'item' : 'items'})
									</div>
								</LoadingSwap>
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle>You are responsible for your delivery address</AlertDialogTitle>
								<AlertDialogDescription>
									If you enter your delivery address incorrectly and your order is not able to be delivered, you will be
									responsible for any additional shipping costs. Please double-check your delivery address before
									proceeding with checkout.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter>
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<AlertDialogAction onClick={handleCheckout}>Continue with Checkout</AlertDialogAction>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				</DrawerFooter>
			</DrawerContent>
		</Drawer>
	);
}
