'use server';

import { getPayload } from 'payload';
import config from '@payload-config';
import { Order } from '@/payload-types';
import { revalidatePath } from 'next/cache';

export async function updateOrder(
	orderId: string,
	data: Omit<Order, 'pricing' | 'id' | 'queue' | 'updatedAt' | 'createdAt'>,
): Promise<Order | string> {
	const payload = await getPayload({ config });

	try {
		const res = await payload.update({
			collection: 'orders',
			id: orderId,
			data,
		});

		return res;
	} catch (error) {
		console.error('Error updating order:', error);
		return 'Failed to update order';

		// throw new Error('Failed to update order');
	}

	revalidatePath('/dashboard/home');
}
