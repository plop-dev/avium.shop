import { atom } from 'nanostores';

// Store for order validation state
export const $orderValidation = atom({
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
