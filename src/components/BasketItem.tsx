import { Minus, Plus, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BasketItem as BasketItemType, CustomPrint, ShopProduct } from '@/stores/basket';
import { NumberInput } from './ui/number-input';

// Type guards
const isCustomPrint = (item: BasketItemType): item is CustomPrint => {
	return 'model' in item;
};

const isShopProduct = (item: BasketItemType): item is ShopProduct => {
	return 'product' in item;
};

export default function BasketItem({
	item,
	onQuantityChange,
	onRemove,
}: {
	item: BasketItemType;
	onQuantityChange: (id: string, newQuantity: number) => void;
	onRemove: (id: string) => void;
}) {
	const handleQuantityChange = (value: number) => {
		onQuantityChange(item.id, value);
	};

	const renderCustomPrint = (print: CustomPrint) => (
		<>
			<div>
				<h4 className='font-medium text-sm'>{print.model.filename}</h4>
				<p className='text-xs text-muted-foreground'>{print.id}</p>
			</div>

			<div className='flex flex-wrap gap-1'>
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
						{print.printingOptions.preset}
					</Badge>
				)}
			</div>
		</>
	);

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
		<Card className='mb-3 py-0'>
			<CardContent className='p-4'>
				<div className='flex items-start justify-between'>
					<div className='flex items-start space-x-3 flex-1'>
						<div className='flex-1 space-y-2'>
							{isCustomPrint(item) && renderCustomPrint(item)}
							{isShopProduct(item) && renderShopProduct(item)}
						</div>
					</div>

					<Button variant='ghost' size='sm' onClick={() => onRemove(item.id)} className='text-destructive hover:text-destructive'>
						<Trash2 className='h-4 w-4' />
					</Button>
				</div>

				<div className='flex items-center justify-between mt-3 pt-3 border-t'>
					<NumberInput min={1} max={100000} value={item.quantity} onChange={handleQuantityChange}></NumberInput>
					<p className='text-sm text-muted-foreground'>{item.quantity > 1 ? `${item.quantity} prints` : '1 print'}</p>
				</div>
			</CardContent>
		</Card>
	);
}
