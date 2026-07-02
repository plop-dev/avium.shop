import { atom } from 'nanostores';

export type OrderValidation = {
	orderNameValid: boolean;
	orderName: string;
};

export type OrderDetails = {
	orderName: string;
	comments: string;
};

// Store for order validation state
export const $orderValidation = atom<OrderValidation>({
	orderNameValid: false,
	orderName: '',
});

// Actions to update order validation state
export function setOrderNameValid(isValid: boolean, name: string = '') {
	$orderValidation.set({
		orderNameValid: isValid,
		orderName: name,
	});
}

export const $orderDetails = atom<OrderDetails>({
	orderName: '',
	comments: '',
});

export function setOrderDetails(details: { orderName: string; comments: string }) {
	$orderDetails.set(details);
}
