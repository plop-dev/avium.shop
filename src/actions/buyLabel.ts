'use server';

import { shippo } from '@/lib/shippo';
import { Order } from '@/payload-types';
import { getPayload } from 'payload';
import config from '@payload-config';
import { AddressCreateRequest, DistanceUnitEnum, LabelFileTypeEnum, ParcelCreateRequest, WeightUnitEnum } from 'shippo';

export async function buyLabel(orderId: string, dimensions: Order['dimensions']) {
	// we could either get dimensions from the ui (should be safe, only admins use it anyways) or
	// get it from the db, but that's an extra process (even from server components)

	const payload = await getPayload({ config });
	const adminDetails = await payload.findGlobal({
		slug: 'admin-details',
	});

	const orderDetails = await payload.findByID({
		collection: 'orders',
		id: orderId,
		depth: 2,
	});

	const addressFrom: AddressCreateRequest = {
		name: adminDetails.shippingAddress.fullName,
		street1: adminDetails.shippingAddress.line1,
		street2: adminDetails.shippingAddress.line2 ?? '',
		city: adminDetails.shippingAddress.city,
		state: adminDetails.shippingAddress.county,
		zip: adminDetails.shippingAddress.postcode,
		country: 'GB',
	};

	if (!orderDetails.shippingAddress) {
		throw new Error('Order does not have a shipping address');
	}

	const addressTo: AddressCreateRequest = {
		name: orderDetails.shippingAddress?.fullName ?? '',
		street1: orderDetails.shippingAddress?.line1 ?? '',
		street2: orderDetails.shippingAddress?.line2 ?? '',
		city: orderDetails.shippingAddress?.city ?? '',
		state: orderDetails.shippingAddress?.county ?? '',
		zip: orderDetails.shippingAddress?.postcode ?? '',
		country: orderDetails.shippingAddress?.country ?? '',
	};

	if (!dimensions) {
		throw new Error('Order does not have dimensions');
	}

	const parcel: ParcelCreateRequest = {
		length: `${dimensions.length}`,
		width: `${dimensions.width}`,
		height: `${dimensions.height}`,
		distanceUnit: DistanceUnitEnum.Cm,
		weight: `${dimensions.weight}`,
		massUnit: WeightUnitEnum.G,
		metadata: orderId,
	};

	const shipment = await shippo.shipments.create({
		addressFrom: addressFrom,
		addressTo: addressTo,
		parcels: [parcel],
		async: false,
	});

	// pick the cheapest rate
	const rate = shipment.rates.sort((a, b) => Number(a.amount) - Number(b.amount))[0];

	const transaction = await shippo.transactions.create({
		rate: rate?.objectId,
		labelFileType: LabelFileTypeEnum.Pdf,
		async: false,
	});

	// update the order with the shipping details
	try {
		await payload.update({
			collection: 'orders',
			id: orderId,
			data: {
				shipping: {
					shipmentId: shipment.objectId,
					transactionId: transaction.objectId,
					carrier: rate?.provider,
					service: rate?.servicelevel?.name,
					trackingNumber: transaction.trackingNumber,
					trackingUrl: transaction.trackingUrlProvider,
					labelUrl: transaction.labelUrl,
					labelPurchasedAt: rate.objectCreated?.toISOString(),
				},
			},
		});
	} catch (error) {
		console.error('Error updating order with shipping details:', error);
		throw new Error('Failed to update order with shipping details');
	}
}
