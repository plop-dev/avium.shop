import { Product } from '@/payload-types';
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
	colour: string; //* USER ONLY CHOOSES THIS
	price: Product['price'];
	quantity: number;
	time: Product['time'];
};

export type BasketItem = ShopProduct | CustomPrint;

export const $basket = persistentAtom<BasketItem[]>('basket', [], {
	encode: JSON.stringify,
	decode: JSON.parse,
});

const isShopProduct = (item: BasketItem): item is ShopProduct => 'product' in item;

export const getBasketItemSignature = (item: BasketItem) => {
	if (isShopProduct(item)) {
		return JSON.stringify({
			type: 'shop-product',
			productId: item.id,
			colour: item.colour,
			product: {
				name: item.product.name,
				description: item.product.description,
				price: item.product.price,
				time: item.product.time,
				printingOptions: item.product.printingOptions,
			},
		});
	}

	return JSON.stringify({
		type: 'custom-print',
		itemId: item.id,
		model: item.model,
		printingOptions: item.printingOptions,
		price: item.price,
		time: item.time,
	});
};

export const resetBasket = () => {
	$basket.set([]);
};

export const addToBasket = (product: BasketItem) => {
	const basket = $basket.get();
	const productSignature = getBasketItemSignature(product);
	const existingItemIndex = basket.findIndex(item => getBasketItemSignature(item) === productSignature);

	if (existingItemIndex >= 0) {
		const existingItem = basket[existingItemIndex];
		const nextQuantity = existingItem.quantity + Math.max(product.quantity, 1);
		const updatedBasket = basket.map((item, index) => (index === existingItemIndex ? { ...item, quantity: nextQuantity } : item));
		$basket.set(updatedBasket);
		return;
	}

	$basket.set([...basket, { ...product, quantity: Math.max(product.quantity, 1) }]);
};

export const addShopProductToBasket = (product: ShopProduct) => {
	addToBasket(product);
};

export const addCustomPrintToBasket = (product: CustomPrint) => {
	addToBasket(product);
};

export const setItemQuantity = (itemKey: string, quantity: number) => {
	const basket = $basket.get();
	const nextQuantity = Math.max(quantity, 0);

	if (nextQuantity === 0) {
		$basket.set(basket.filter(item => getBasketItemSignature(item) !== itemKey));
		return;
	}

	$basket.set(basket.map(item => (getBasketItemSignature(item) === itemKey ? { ...item, quantity: nextQuantity } : item)));
};
