'use client';

import { useEffect } from 'react';
import { $orderDetails, $orderValidation } from '@/stores/order';

export default function NanostoreManager() {
	useEffect(() => {
		const stored = localStorage.getItem('orderDetails');
		const storedValidation = localStorage.getItem('orderValidation');

		if (stored) {
			$orderDetails.set(JSON.parse(stored));
		}

		if (storedValidation) {
			$orderValidation.set(JSON.parse(storedValidation));
		}

		const unsubscribeDetails = $orderDetails.listen(value => {
			localStorage.setItem('orderDetails', JSON.stringify(value));
		});

		const unsubscribeValidation = $orderValidation.listen(value => {
			localStorage.setItem('orderValidation', JSON.stringify(value));
		});

		return () => {
			unsubscribeDetails();
			unsubscribeValidation();
		};
	}, []);

	return null;
}
