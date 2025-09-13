'use client';

import { Minus, Plus, Trash2, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BasketItem as BasketItemType, CustomPrint, ShopProduct } from '@/stores/basket';
import { NumberInput } from './ui/number-input';
import { Preset, PrintingOption } from '@/payload-types';
import useSWR, { Fetcher } from 'swr';
import numToGBP from '@/utils/numToGBP';
import { Progress } from './ui/progress';
import { LoadingSwap } from './ui/loading-swap';
import ms from 'ms';
import { multiplyTimeString } from '@/utils/multiplyTimeString';

// Type guards
const isCustomPrint = (item: BasketItemType): item is CustomPrint => {
	return 'model' in item;
};

const isShopProduct = (item: BasketItemType): item is ShopProduct => {
	return 'product' in item;
};

// Custom hooks
function usePreset(id: string | null) {
	const fetcher: Fetcher<Preset, string> = (url: string) => fetch(url).then(res => res.json());
	return useSWR(id ? `/api/presets/${id}` : null, fetcher);
}

function usePlastic() {
	const fetcher: Fetcher<PrintingOption, string> = (url: string) => fetch(url).then(res => res.json());
	return useSWR(`/api/globals/printing-options`, fetcher);
}

export default function BasketItem({
	item,
	onQuantityChange,
	onRemove,
	progress,
}: {
	item: BasketItemType;
	onQuantityChange?: (id: string, newQuantity: number) => void;
	onRemove?: (id: string) => void;
	progress?: number; // used for print upload in quotes
}) {
	// Get preset and plastic data at component level
	const presetId = isCustomPrint(item) && item.printingOptions.preset ? item.printingOptions.preset : null;
	const needsPlastic = isCustomPrint(item) && item.printingOptions.plastic;

	const { data: presetData, isLoading: presetLoading, error } = usePreset(presetId);
	const { data: plasticData, isLoading: plasticLoading } = usePlastic();

	const handleQuantityChange = (value: number) => {
		onQuantityChange?.(item.id, value);
	};

	const renderCustomPrint = (print: CustomPrint) => {
		return (
			<>
				<div>
					<h4 className='font-medium text-sm'>{print.model.filename}</h4>
					<p className='text-xs text-muted-foreground'>{print.id}</p>
				</div>

				<div className='flex flex-wrap gap-1'>
					{print.printingOptions.plastic && (
						<Badge variant='default' className='text-xs'>
							{plasticLoading
								? 'Loading...'
								: plasticData
								? plasticData.plastic?.find(p => p.id === print.printingOptions.plastic)?.name
								: 'Preset not found'}
						</Badge>
					)}
					{print.printingOptions.layerHeight && (
						<Badge variant='default' className='text-xs'>
							{print.printingOptions.layerHeight}mm layer
						</Badge>
					)}
					{print.printingOptions.infill && (
						<Badge variant='outline' className='text-xs'>
							{print.printingOptions.infill}% infill
						</Badge>
					)}

					{print.printingOptions.preset && (
						<Badge variant='secondary' className='text-xs'>
							{presetLoading ? 'Loading...' : presetData ? presetData.name : 'Preset not found'}
						</Badge>
					)}
					<Badge variant='secondary' style={{ backgroundColor: print.printingOptions.colour }} className='text-xs'>
						<p className='contrast-[9000] invert grayscale brightness-[1.5]' style={{ color: print.printingOptions.colour }}>
							{print.printingOptions.colour}
						</p>
					</Badge>
				</div>
			</>
		);
	};

	const renderShopProduct = (product: ShopProduct) => (
		<>
			<div>
				<h4 className='font-medium text-sm'>{product.product.name}</h4>
				<p className='text-xs text-muted-foreground'>{product.id}</p>
			</div>

			<div className='flex flex-wrap gap-1'>
				<Badge variant='default' className='text-xs'>
					{product.product.printingOptions.plastic}
				</Badge>
				<Badge variant='default' className='text-xs'>
					{product.product.printingOptions.layerHeight}mm layer
				</Badge>
				<Badge variant='outline' className='text-xs'>
					{product.product.printingOptions.infill}% infill
				</Badge>
				<Badge variant='secondary' style={{ backgroundColor: product.product.printingOptions.colour }} className='text-xs'>
					<p
						className='contrast-[9000] invert grayscale brightness-[1.2]'
						style={{ color: product.product.printingOptions.colour }}>
						{product.product.printingOptions.colour}
					</p>
				</Badge>
			</div>
		</>
	);

	return (
		<Card className='mb-3 py-0 relative overflow-hidden !border-none'>
			<CardContent className='p-4'>
				<div className='flex items-start justify-between'>
					<div className='flex items-start space-x-3 flex-1'>
						<div className='flex-1 space-y-2'>
							{isCustomPrint(item) && renderCustomPrint(item)}
							{isShopProduct(item) && renderShopProduct(item)}
						</div>
					</div>

					<Button
						variant='ghost'
						size='sm'
						onClick={() => onRemove?.(item.id)}
						className='text-destructive hover:text-destructive'>
						<Trash2 className='h-4 w-4' />
					</Button>
				</div>

				<div className='flex items-center justify-between mt-3 pt-3 border-t'>
					<NumberInput min={1} max={100000} value={item.quantity} onChange={handleQuantityChange}></NumberInput>
					<div className='flex items-center gap-4'>
						<Badge variant={'outline'} className='text-md h-10'>
							<span className='text-sm text-muted-foreground'>
								<LoadingSwap isLoading={!item.time} loaderClassName='size-4 my-1 mx-2' className='!w-auto'>
									{multiplyTimeString(item.time || '2h', item.quantity)}
								</LoadingSwap>
							</span>
						</Badge>

						<Badge variant={'outline'} className='text-md h-10'>
							<span className='text-sm text-muted-foreground'>
								<LoadingSwap isLoading={!item.price} loaderClassName='size-4 my-1 mx-2'>
									{numToGBP((item.price || 0) * item.quantity)}
								</LoadingSwap>
							</span>
						</Badge>
					</div>
				</div>
			</CardContent>
			{progress !== undefined && <Progress value={progress} className='absolute inset-x-0 bottom-0 h-1' />}
		</Card>
	);
}
