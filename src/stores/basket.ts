import { Order, Product } from '@/payload-types';
import { persistentAtom } from '@nanostores/persistent';

export type CustomPrint = {
	// <- not the same as Order
	id: string; //* to differentiate each custom print NOT TO STORE IN DB
	model: {
		filename: string;
		filetype: 'stl' | '3mf';
	};
	printingOptions: {
		preset?: string; // relationship to presets
		layerHeight?: number;
		infill?: number;
		plastic: string;
		colour: string;
	};
	quantity: number;
	price: number | null;
};

export type ShopProduct = {
	id: string; //* to differentiate each shop product NOT TO STORE IN DB
	product: {
		name: Product['name'];
		description: Product['description'];
		pictures: Product['pictures'];
		price: Product['price'];
		orders: Product['orders'];
		printingOptions: {
			//* ADMIN CHOOSES THESE
			plastic: string;
			layerHeight: number;
			infill: number;
			colour: string; //* USER ONLY CHOOSES THIS
		};
	};
	price: Product['price'];
	quantity: number;
};

export type BasketItem = ShopProduct | CustomPrint;

export const $basket = persistentAtom<BasketItem[]>('basket', [], {
	encode: JSON.stringify,
	decode: JSON.parse,
});

export const resetBasket = () => {
	$basket.set([]);
};

export const addToBasket = (product: BasketItem) => {
	const existingItem = $basket.get().find(p => p.id === product.id);

	if (existingItem) {
		$basket.set($basket.get().map(p => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p)));
	} else {
		$basket.set([...$basket.get(), { ...product, quantity: product.quantity }]);
	}
};

export const addShopProductToBasket = (product: ShopProduct) => {
	addToBasket(product);
};

export const addCustomPrintToBasket = (product: CustomPrint) => {
	addToBasket(product);
};

export const setItemQuantity = (id: string, quantity: number) => {
	$basket.set($basket.get().map(p => (p.id === id ? { ...p, quantity } : p)));

	if (quantity === 0) {
		$basket.set($basket.get().filter(p => p.id !== id));
	}
};
