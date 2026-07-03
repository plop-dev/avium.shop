'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
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
import { cancelOrder } from '@/actions/cancelOrder';
import { X } from 'lucide-react';

export function CancelOrderButton({ orderId, currentStatus, canCancel }: { orderId: string; currentStatus: string; canCancel: boolean }) {
	const [isLoading, setIsLoading] = useState(false);

	if (!canCancel) return null;

	const handleCancel = async () => {
		setIsLoading(true);
		try {
			const result = await cancelOrder(orderId);
			if (result.success) {
				toast.success('Order cancelled successfully');
			} else {
				toast.error(result.message);
			}
		} catch (error) {
			toast.error('Failed to cancel order');
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<AlertDialog>
			<AlertDialogTrigger asChild>
				<Button variant='destructive' size='sm' className='gap-2' disabled={isLoading}>
					<X className='size-4' />
					Cancel Order
				</Button>
			</AlertDialogTrigger>
			<AlertDialogContent>
				<AlertDialogHeader>
					<AlertDialogTitle>Cancel this order?</AlertDialogTitle>
					<AlertDialogDescription className='space-y-3' asChild>
						<div>
							<p>Are you sure you want to cancel this order? This action cannot be undone.</p>
							<p className='font-semibold text-red-600 dark:text-red-400'>
								⚠️ No refund will be issued for cancelled orders.
							</p>
							<p className='text-sm'>If you have already made a payment, please contact support to discuss your options.</p>
						</div>
					</AlertDialogDescription>
				</AlertDialogHeader>
				<AlertDialogFooter>
					<AlertDialogCancel>Keep Order</AlertDialogCancel>
					<AlertDialogAction
						onClick={handleCancel}
						disabled={isLoading}
						className='bg-destructive text-destructive-foreground hover:bg-destructive/90'>
						{isLoading ? 'Cancelling...' : 'Cancel Order'}
					</AlertDialogAction>
				</AlertDialogFooter>
			</AlertDialogContent>
		</AlertDialog>
	);
}
