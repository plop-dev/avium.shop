'use server';

import { getPayload } from 'payload';
import config from '@payload-config';
import { revalidatePath } from 'next/cache';
import { getUser } from '@/utils/getUser';

export async function cancelOrder(orderId: string): Promise<{ success: boolean; message: string }> {
	const payload = await getPayload({ config });
	const user = await getUser();

	try {
		if (!user?.id) {
			return { success: false, message: 'User not authenticated' };
		}

		const order = await payload.findByID({
			collection: 'orders',
			id: orderId,
			overrideAccess: true,
		});

		const customerId = typeof order.customer === 'string' ? order.customer : order.customer.id;

		if (customerId !== user.id) {
			return { success: false, message: 'You do not have permission to cancel this order' };
		}

		if (order.status.currentStatus === 'shipped' || order.status.currentStatus === 'packaging') {
			return { success: false, message: 'Cannot cancel orders that are already being shipped' };
		}

		if (order.status.currentStatus === 'cancelled') {
			return { success: false, message: 'This order is already cancelled' };
		}

		const userDoc = await payload.findByID({
			collection: 'users',
			id: user.id,
		});

		const now = new Date().toISOString();
		const statuses = order.status.statuses || [];
		const updatedStatuses = [...statuses, { stage: 'cancelled' as const, timestamp: now }];

		await payload.update({
			collection: 'orders',
			id: orderId,
			data: {
				status: {
					currentStatus: 'cancelled',
					statuses: updatedStatuses,
				},
				comments: order.comments
					? `${order.comments}\n\nCancelled by customer on ${new Date().toLocaleDateString()}`
					: `Cancelled by customer on ${new Date().toLocaleDateString()}`,
			},
			overrideAccess: true, //* this is only true because users are not allowed to update orders, at all
			user: userDoc,
		});

		revalidatePath('/dashboard/home');
		return { success: true, message: 'Order cancelled successfully' };
	} catch (error) {
		console.error('Error cancelling order:', error);
		return { success: false, message: 'Failed to cancel order' };
	}
}
