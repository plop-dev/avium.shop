'use client';

import { useState, useTransition } from 'react';
import { checkout } from '@/actions/checkout';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/router';
import { toast } from 'sonner';

type RetryCheckoutButtonProps = {
	orderId: string;
};

export function RetryCheckoutButton({ orderId }: RetryCheckoutButtonProps) {
	const router = useRouter();
	const [isPending, startTransition] = useTransition();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const handleRetry = () => {
		setErrorMessage(null);

		startTransition(async () => {
			const response = await checkout(orderId);

			if (response.success && response.message) {
				toast.info('Redirecting to checkout...');
				router.push(response.message);
				return;
			}

			setErrorMessage(response.message || 'Unable to retry checkout right now.');
		});
	};

	return (
		<div className='flex flex-col items-start gap-2'>
			<Button type='button' variant='outline' size='sm' onClick={handleRetry} disabled={isPending}>
				{isPending ? 'Retrying…' : 'Retry checkout'}
			</Button>
			{errorMessage ? <p className='text-xs text-destructive'>{errorMessage}</p> : null}
		</div>
	);
}
