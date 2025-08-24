import { Product } from '@/payload-types';
import { atom } from 'nanostores';

export type BasketItem = Product & { quantity: number };

export const $basket = atom<BasketItem[]>([]);

export const resetBasket = () => {
	$basket.set([]);
};

export const addToBasket = (product: Product) => {
	if ($basket.get().find(p => p.id === product.id)) {
		$basket.set($basket.get().map(p => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p)));
	} else {
		$basket.set([...$basket.get(), { ...product, quantity: 1 }]);
	}
};

export const setItemQuantity = (id: string, quantity: number) => {
	$basket.set($basket.get().map(p => (p.id === id ? { ...p, quantity } : p)));

	if (quantity === 0) {
		$basket.set($basket.get().filter(p => p.id !== id));
	}
};
