import { Order, Product } from '@/payload-types';
import { persistentAtom } from '@nanostores/persistent';

export type CustomPrint = {
	id: string;
	model: {
		filename: string;
		filetype: 'stl' | 'obj' | '3mf';
		serverPath: string;
	};
	printingOptions: {
		preset?: string; // relationship to presets
		layerHeight?: number;
		infill?: number;
	};
	price: number;
	quantity: number;
};

export type BasketItem = (Product & { quantity: number }) | CustomPrint;

export const $basket = persistentAtom<BasketItem[]>('basket', [], {
	encode: JSON.stringify,
	decode: JSON.parse,
});

export const resetBasket = () => {
	$basket.set([]);
};

export const addToBasket = (product: Product | Omit<CustomPrint, 'quantity'>) => {
	const existingItem = $basket.get().find(p => p.id === product.id);

	if (existingItem) {
		$basket.set($basket.get().map(p => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p)));
	} else {
		$basket.set([...$basket.get(), { ...product, quantity: 1 } as BasketItem]);
	}
};

export const setItemQuantity = (id: string, quantity: number) => {
	$basket.set($basket.get().map(p => (p.id === id ? { ...p, quantity } : p)));

	if (quantity === 0) {
		$basket.set($basket.get().filter(p => p.id !== id));
	}
};
