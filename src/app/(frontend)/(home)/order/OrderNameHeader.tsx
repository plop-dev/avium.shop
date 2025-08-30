'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { $orderValidation, setOrderNameValid } from '@/stores/order';
import { useStore } from '@nanostores/react';
import { CheckCircle } from 'lucide-react';

export default function OrderNameHeader() {
	const [orderName, setOrderName] = useState('');
	const orderValidation = useStore($orderValidation);

	// Update order name validation whenever it changes
	useEffect(() => {
		const isValid = orderName.trim().length >= 3;
		setOrderNameValid(isValid, orderName);
	}, [orderName]);

	const isValid = orderName.trim().length >= 3;

	return (
		<div className='mb-12'>
			{/* Clean step indicator */}
			<div className='flex items-center mb-4 justify-center'>
				<div className='inline-flex items-center'>
					<div
						className={cn(
							'rounded-full w-8 h-8 flex items-center justify-center font-medium',
							isValid ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground',
						)}>
						1
					</div>
					<h2 className='ml-2 text-lg font-medium'>Name your order</h2>
				</div>
			</div>

			{/* Order name card */}
			<div
				className={cn(
					'rounded-lg border p-6 transition-all max-w-xl mx-auto',
					isValid ? 'border-primary/30 bg-primary/5' : 'border-border',
				)}>
				<div className='space-y-4'>
					{/* Instructions */}
					<p className='text-sm text-muted-foreground'>
						Give your order a name so you can easily identify it later. Your order can include custom prints, shop products, or
						both.
					</p>

					{/* Input field */}
					<div>
						<div className='flex items-center justify-between'>
							<label htmlFor='orderName' className='text-sm font-medium mb-2'>
								Order Name <span className='text-destructive'>*</span>
							</label>
							{isValid && <CheckCircle className='h-4 w-4 text-primary' />}
						</div>

						<Input
							id='orderName'
							placeholder='e.g., My 3D Project, Christmas Gifts...'
							value={orderName}
							onChange={e => setOrderName(e.target.value)}
							className={cn(
								isValid ? 'border-primary/50' : orderName && orderName.trim().length > 0 ? 'border-amber-500/50' : '',
							)}
						/>

						{/* Status message */}
						<div className='mt-2'>
							{!orderName ? (
								<p className='text-xs text-muted-foreground'>Enter a name with at least 3 characters</p>
							) : orderName.trim().length < 3 ? (
								<p className='text-xs text-amber-500'>Order name must be at least 3 characters long</p>
							) : (
								<p className='text-xs text-primary'>You can now add products or custom prints below</p>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
