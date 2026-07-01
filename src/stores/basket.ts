import { Order, Product } from '@/payload-types';
import { createHash } from 'crypto';
import { persistentAtom } from '@nanostores/persistent';

export type CustomPrint = {
	// <- not the same as Order
	id: string; //* to differentiate each custom print NOT TO STORE IN DB
	model: {
		filename: string;
		filetype: 'stl' | '3mf';
		modelUrl: string;
		gcodeUrl: string;
	};
	printingOptions: {
		preset?: string; // relationship to presets, so an ID string is stored
		layerHeight?: number;
		infill?: number;
		plastic: string;
		colour: string;
	};
	quantity: number;
	price: number | null;
	time: string | null;
};

export type ShopProduct = {
	id: string; //* to differentiate each shop product NOT TO STORE IN DB
	product: {
		name: Product['name'];
		description: Product['description'];
		pictures: Product['pictures'];
		price: Product['price'];
		time: Product['time'];
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
	time: Product['time'];
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
	const existingItem = $basket.get().find(p => {
		if ('product' in p && 'product' in product) {
			createHash('sha256').update(Object.values(p.product).join('')).digest('base64') ===
				createHash('sha256').update(Object.values(product.product).join('')).digest('base64');
		} else {
			return p.id === product.id;
		}
	});

	if (existingItem) {
		$basket.set($basket.get().map(p => (p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p)));
	} else {
		console.log('Adding new item to basket:', product);
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
