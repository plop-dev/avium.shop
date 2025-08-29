'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PrintingOption, Product } from '@/payload-types';
import { addShopProductToBasket, addToBasket } from '@/stores/basket';
import numToGBP from '@/utils/numToGBP';
import Image from 'next/image';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { NumberInput } from '../ui/number-input';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { toast } from 'sonner';

export default function ShopProduct({ key, product }: { key: number; product: Product }) {
	const [open, setOpen] = useState(false);
	const [qty, setQty] = useState(1);
	const [selectedColour, setSelectedColour] = useState<string>('');

	const availableColours = useMemo(() => {
		return product.printingOptions.plastic[0].colours || [{ colour: '#eee', id: 'default' }];
	}, []);

	// Set default colour when dialog opens
	const handleDialogOpen = (isOpen: boolean) => {
		setOpen(isOpen);
		if (isOpen && availableColours.length > 0 && !selectedColour) {
			setSelectedColour(availableColours[0].colour);
		}
	};

	const handleAddToCart = (product: Product, quantity = 1) => {
		toast.success(`Added ${quantity} x ${product.name} to basket`);
		addShopProductToBasket({
			id: crypto.randomUUID(),
			price: product.price,
			quantity: quantity,
			product: {
				name: product.name,
				description: product.description,
				pictures: product.pictures,
				price: product.price,
				orders: product.orders,
				printingOptions: {
					plastic: product.printingOptions.plastic[0].name,
					colour: selectedColour,
					layerHeight: product.printingOptions.layerHeight,
					infill: product.printingOptions.infill,
				},
			},
		});
	};

	const pic = product.pictures?.[0];
	const pictures = useMemo(() => (Array.isArray(product.pictures) ? product.pictures : []).filter(Boolean), [product.pictures]);

	return (
		<>
			<div
				key={key}
				className='h-auto min-w-48 rounded-lg border shadow-sm hover:shadow-md transition-shadow duration-200 flex flex-col cursor-pointer'
				onClick={() => handleDialogOpen(true)}
				role='button'
				tabIndex={0}
				onKeyDown={e => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						handleDialogOpen(true);
					}
				}}>
				<div className='h-48 flex items-center justify-center rounded-t-lg'>
					{typeof pic === 'string' ? (
						<img className='h-48 w-48 aspect-square bg-cover object-cover' src={pic} alt='Product Image' />
					) : (
						<Image
							className='h-48 w-48 aspect-square bg-cover object-cover'
							src={pic?.url ?? '#'}
							width={pic?.width ?? 512}
							height={pic?.height ?? pic?.width ?? 512}
							alt={pic?.alt ?? product.name}
						/>
					)}
				</div>
				<div className='p-4 flex flex-col flex-grow'>
					<h3 className='font-medium'>{product.name}</h3>
					<p className='text-sm text-muted-foreground mt-1 line-clamp-2'>{product.description}</p>
					<div className='mt-auto pt-3 flex items-center justify-between'>
						<span className='font-medium'>{numToGBP(product.price)}</span>
						<Button variant='default' size='sm'>
							Add to cart
						</Button>
					</div>
				</div>
			</div>

			<Dialog open={open} onOpenChange={handleDialogOpen}>
				<DialogContent className='xl:!max-w-6xl xl:!w-6xl p-0 !max-w-2xl !w-2xl'>
					<div className='flex gap-x-8 p-6 overflow-auto'>
						<div className='relative'>
							<div className='rounded-lg border bg-gradient-to-br from-muted/40 to-transparent p-2'>
								<Carousel className='w-xl'>
									<CarouselContent className='-ml-0'>
										{pictures.length > 0 ? (
											pictures.map((p, idx: number) => (
												<CarouselItem key={idx} className='pl-0'>
													<div className='w-full flex justify-center'>
														{typeof p === 'string' ? (
															<img
																className='max-h-[60vh] w-auto object-contain rounded-md select-none shadow-sm bg-background'
																src={p}
																alt={`Product image ${idx + 1}`}
																draggable={false}
															/>
														) : (
															<Image
																className='max-h-[60vh] w-auto object-contain rounded-md select-none shadow-sm bg-background'
																src={p?.url ?? '#'}
																width={p?.width ?? 1024}
																height={p?.height ?? p?.width ?? 1024}
																alt={p?.alt ?? product.name}
																draggable={false}
															/>
														)}
													</div>
												</CarouselItem>
											))
										) : (
											<CarouselItem className='pl-0'>
												<div className='w-full h-[300px] flex items-center justify-center rounded-md bg-muted'>
													<span className='text-muted-foreground text-sm'>No images</span>
												</div>
											</CarouselItem>
										)}
									</CarouselContent>
									{pictures.length > 1 && (
										<>
											<CarouselPrevious className='ml-8' />
											<CarouselNext className='mr-8' />
										</>
									)}
								</Carousel>
							</div>

							{pictures.length > 1 && (
								<div className='absolute top-3 left-3 rounded-full border bg-background/80 backdrop-blur px-2 py-0.5 text-xs font-medium shadow-sm'>
									{pictures.length} images
								</div>
							)}
						</div>

						<div className='flex flex-col gap-y-2 min-h-0 w-full'>
							<DialogHeader className='p-0'>
								<DialogTitle className='text-2xl font-semibold tracking-tight pb-0'>{product.name}</DialogTitle>
								<DialogDescription asChild>
									<div className='mt-1 flex items-center gap-2'>
										<Badge variant={'outline'} className='text-md'>
											<span className='text-md text-muted-foreground'>{numToGBP(product.price)}</span>
										</Badge>
									</div>
								</DialogDescription>
							</DialogHeader>

							<Separator />

							<div className='space-y-4 overflow-auto pr-1'>
								<p className='text-md leading-relaxed'>{product.description}</p>

								{product.printingOptions && (
									<div className='space-y-2'>
										<div className='flex flex-wrap items-center gap-2'>
											{'plastic' in product.printingOptions && product.printingOptions.plastic != null && (
												<Badge variant={'outline'}>Plastic: {product.printingOptions.plastic[0].name}</Badge>
											)}
											{'layerHeight' in product.printingOptions && product.printingOptions.layerHeight != null && (
												<Badge variant={'default'}>Layer height: {product.printingOptions.layerHeight} mm</Badge>
											)}
											{'infill' in product.printingOptions && product.printingOptions.infill != null && (
												<Badge variant={'secondary'}>Infill: {product.printingOptions.infill}%</Badge>
											)}
										</div>
									</div>
								)}
							</div>

							<hr className='my-4 border-muted/40' />

							<div className='mt-2 mb-2 grid grid-cols-1 sm:grid-cols-2 items-start gap-4'>
								<div className='flex flex-col gap-4'>
									<div className='flex flex-col gap-2'>
										<label className='text-xs font-medium text-muted-foreground'>Quantity</label>
										<div className='flex items-center gap-2'>
											<NumberInput
												min={1}
												max={100000}
												className='w-28'
												value={qty}
												onChange={(e: any) => {
													const raw = (e?.target?.value ?? e?.value ?? e) as any;
													const v = Number(raw);
													const n = Number.isFinite(v) ? v : 1;
													setQty(Math.min(100000, Math.max(1, n)));
												}}
											/>
										</div>
									</div>

									{availableColours.length > 0 && (
										<div className='flex flex-col gap-2'>
											<label className='text-xs font-medium text-muted-foreground'>Colour</label>
											<Select value={selectedColour} onValueChange={setSelectedColour}>
												<SelectTrigger className='w-full'>
													<SelectValue placeholder='Select a colour'>
														{selectedColour && (
															<div className='flex items-center gap-2'>
																<div
																	className='w-4 h-4 rounded-full border border-border'
																	style={{
																		backgroundColor: availableColours.find(
																			c => c.colour === selectedColour,
																		)?.colour,
																	}}
																/>
																{availableColours.find(c => c.colour === selectedColour)?.colour}
															</div>
														)}
													</SelectValue>
												</SelectTrigger>
												<SelectContent>
													{availableColours.map(colour => (
														<SelectItem key={colour.id} value={colour.colour}>
															<div className='flex items-center gap-2'>
																<div
																	className='w-4 h-4 rounded-full border border-border'
																	style={{ backgroundColor: colour.colour }}
																/>
																{colour.colour}
															</div>
														</SelectItem>
													))}
												</SelectContent>
											</Select>
										</div>
									)}
								</div>

								<div className='flex flex-col gap-2 mt-auto sm:items-end'>
									<span className='text-xs font-medium text-muted-foreground'>Total</span>
									<div className='inline-flex items-center rounded-lg border px-3 py-1.5 text-sm font-semibold bg-background shadow-sm'>
										{numToGBP((product.price || 0) * qty)}
									</div>
								</div>
							</div>

							<div className='flex gap-2 sm:justify-end'>
								<Button variant='secondary' onClick={() => setOpen(false)}>
									Close
								</Button>
								<Button
									onClick={() => {
										handleAddToCart(product, qty);
										setOpen(false);
									}}
									disabled={availableColours.length > 0 && !selectedColour}>
									Add {qty} to cart
								</Button>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</>
	);
}
