'use server';

import { getPayload } from 'payload';
import config from '@payload-config';
import { Order } from '@/payload-types';
import { revalidatePath } from 'next/cache';
import { getUser } from '@/utils/getUser';

export async function updateOrder(
	orderId: string,
	data: Omit<Order, 'pricing' | 'id' | 'queue' | 'updatedAt' | 'createdAt'>,
): Promise<Order | string> {
	const payload = await getPayload({ config });
	const user = await getUser();

	try {
		const userDoc = await payload.findByID({
			collection: 'users',
			id: user?.id || '',
		});

		const res = await payload.update({
			collection: 'orders',
			id: orderId,
			data,
			overrideAccess: false,
			user: userDoc,
		});

		revalidatePath('/dashboard/home');
		return res;
	} catch (error) {
		return 'Failed to update order';
	}
}
