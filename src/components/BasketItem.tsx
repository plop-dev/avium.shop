import { Minus, Plus, Trash2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BasketItem as BasketItemType } from '@/stores/basket';

export default function BasketItem({
	print,
	onQuantityChange,
	onRemove,
}: {
	print: BasketItemType;
	onQuantityChange: (id: string, newQuantity: number) => void;
	onRemove: (id: string) => void;
}) {
	const handleQuantityChange = (delta: number) => {
		const newQuantity = Math.max(1, Math.min(1000, print.quantity + delta));
		onQuantityChange(print.id, newQuantity);
	};

	return (
		<Card className='mb-3 py-0'>
			<CardContent className='p-4'>
				<div className='flex items-start justify-between'>
					<div className='flex items-start space-x-3 flex-1'>
						<div className='flex-1 space-y-2'>
							<div>
								<h4 className='font-medium text-sm'>{print.name}</h4>
								<p className='text-xs text-muted-foreground'>{print.id}</p>
							</div>

							<div className='flex flex-wrap gap-1'>
								{print.printingOptions.plastic && (
									<Badge variant='default' className='text-xs'>
										{print.printingOptions.plastic[0].name}
									</Badge>
								)}
								{print.printingOptions.layerHeight && (
									<Badge variant='default' className='text-xs'>
										{print.printingOptions.layerHeight}mm layer
									</Badge>
								)}
								<Badge variant='outline' className='text-xs'>
									{print.printingOptions.infill}% infill
								</Badge>
							</div>
						</div>
					</div>

					<Button
						variant='ghost'
						size='sm'
						onClick={() => onRemove(print.id)}
						className='text-destructive hover:text-destructive'>
						<Trash2 className='h-4 w-4' />
					</Button>
				</div>

				<div className='flex items-center justify-between mt-3 pt-3 border-t'>
					<div className='flex items-center space-x-2'>
						<Button variant='outline' size='sm' onClick={() => handleQuantityChange(-1)} disabled={print.quantity <= 1}>
							<Minus className='h-3 w-3' />
						</Button>
						<span className='font-medium min-w-[2rem] text-center'>{print.quantity}</span>
						<Button variant='outline' size='sm' onClick={() => handleQuantityChange(1)} disabled={print.quantity >= 1000}>
							<Plus className='h-3 w-3' />
						</Button>
					</div>
					<p className='text-sm text-muted-foreground'>{print.quantity > 1 ? `${print.quantity} prints` : '1 print'}</p>
				</div>
			</CardContent>
		</Card>
	);
}
