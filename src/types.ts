export interface User {
	id: string;
	emailVerified?: string | null;
	name: string;
	image?: string | null;
	email: string;
	role?: ('customer' | 'employee' | 'admin' | 'developer') | null;
	address?:
		| {
				line1: string;
				line2?: string | null;
				city: string;
				postalCode: string;
				country: string;
				id?: string | null;
		  }[]
		| null;
	orders?: (string | Order)[] | null;
	subscription?: {
		plan?: ('none' | 'plus') | null;
		status?: ('Active' | 'PastDue' | 'Unpaid' | 'Paused') | null;
		stripeSubscriptionId?: string | null;
		currentPeriodStart?: string | null;
		currentPeriodEnd?: string | null;
	};
	stripeCustomerId?: string | null;
	accounts?:
		| {
				provider: string;
				providerAccountId: string;
				type: 'oidc' | 'oauth' | 'email' | 'webauthn';
				id?: string | null;
		  }[]
		| null;
	updatedAt: string;
	createdAt: string;
	enableAPIKey?: boolean | null;
	apiKey?: string | null;
	apiKeyIndex?: string | null;
	resetPasswordToken?: string | null;
	resetPasswordExpiration?: string | null;
	salt?: string | null;
	hash?: string | null;
	_verified?: boolean | null;
	_verificationToken?: string | null;
	loginAttempts?: number | null;
	lockUntil?: string | null;
	password?: string | null;
	collection: 'users';
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "orders".
 */
export interface Order {
	id: string;
	/**
	 * The name of the order
	 */
	name: string;
	/**
	 * The user who placed the order
	 */
	customer: string | User;
	prints: (
		| {
				product: string | Product;
				quantity: number;
				/**
				 * Price fetched from product at order time
				 */
				price: number;
				/**
				 * Mark as printed
				 */
				completed?: boolean | null;
				id?: string | null;
				blockName?: string | null;
				blockType: 'shopProduct';
		  }
		| {
				/**
				 * Reference to the original quote
				 */
				quote: string | Quote;
				/**
				 * The 3D model associated with this item
				 */
				model: {
					filename: string;
					filetype: 'stl' | '3mf';
					/**
					 * The unique download URL to the model
					 */
					modelUrl: string;
					/**
					 * The unique download URL to the G-code file
					 */
					gcodeUrl: string;
				};
				printingOptions: {
					preset?: (string | null) | Preset;
					layerHeight?: number | null;
					infill?: number | null;
					plastic: string;
					colour: string;
				};
				/**
				 * Estimated print time as returned by the slicer
				 */
				time?: string | null;
				/**
				 * Estimated filament usage in grams as returned by the slicer
				 */
				filament?: number | null;
				quantity: number;
				/**
				 * Price fetched from quote at order time
				 */
				price: number;
				/**
				 * Mark as printed
				 */
				completed?: boolean | null;
				id?: string | null;
				blockName?: string | null;
				blockType: 'customPrint';
		  }
	)[];
	payment?: {
		/**
		 * Payment provider used for this order
		 */
		provider?: string | null;
		/**
		 * Stripe Customer ID
		 */
		stripeCustomerId?: string | null;
		/**
		 * Stripe Checkout Session ID
		 */
		stripeCheckoutSessionId?: string | null;
		/**
		 * Stripe Payment Intent ID
		 */
		stripePaymentIntentId?: string | null;
		/**
		 * Stripe Charge ID
		 */
		stripeChargeId?: string | null;
		/**
		 * Currency used for this order
		 */
		currency?: string | null;
		/**
		 * Amount paid
		 */
		amount?: number | null;
		status?:
			| ('awaiting-payment' | 'paid' | 'failed' | 'refunded' | 'partially-refunded' | 'cancelled' | 'expired' | 'checkout-failed')
			| null;
		/**
		 * Date and time when the payment was made
		 */
		paidAt?: string | null;
		/**
		 * Whether the payment was refunded
		 */
		refunded?: boolean | null;
		/**
		 * Amount refunded
		 */
		refundedAmount?: number | null;
		/**
		 * Date and time when the payment was refunded
		 */
		refundedAt?: string | null;
		/**
		 * URL to the payment receipt
		 */
		receiptUrl?: string | null;
	};
	/**
	 * GoShippo details details for the order
	 */
	shipping?: {
		/**
		 * Shipment ID
		 */
		shipmentId?: string | null;
		/**
		 * Shipment transaction ID
		 */
		transactionId?: string | null;
		/**
		 * Shipping carrier
		 */
		carrier?: string | null;
		/**
		 * Shipping service
		 */
		service?: string | null;
		/**
		 * Tracking number
		 */
		trackingNumber?: string | null;
		/**
		 * Tracking URL
		 */
		trackingUrl?: string | null;
		/**
		 * Shipping label URL
		 */
		labelUrl?: string | null;
		/**
		 * Date and time when the label was purchased
		 */
		labelPurchasedAt?: string | null;
		/**
		 * Date and time when the order was shipped
		 */
		shippedAt?: string | null;
		/**
		 * Date and time when the order was delivered
		 */
		deliveredAt?: string | null;
	};
	shippingAddress?: {
		fullName?: string | null;
		line1?: string | null;
		line2?: string | null;
		city?: string | null;
		county?: string | null;
		postcode?: string | null;
		country?: string | null;
	};
	/**
	 * Pricing details for the order. EVERYTHING IN PENCE, ALWAYS.
	 */
	pricing: {
		/**
		 * The subtotal of the order in pennies (or smallest equivalent of the currency). Calculated from the prints.
		 */
		subtotal?: number | null;
		/**
		 * The shipping cost of the order. Always 300p.
		 */
		shipping?: number | null;
		/**
		 * The tax of the order. Always £0 since we are not VAT registered, yet.
		 */
		tax?: number | null;
		/**
		 * Total Price of everything in this field (subtotal + shipping + tax).
		 */
		total?: number | null;
	};
	/**
	 * The print queue this order is assigned to
	 */
	queue: number;
	status: {
		statuses?:
			| {
					stage: 'in-queue' | 'printing' | 'packaging' | 'shipped' | 'cancelled';
					timestamp: string;
					id?: string | null;
			  }[]
			| null;
		/**
		 * Current order status
		 */
		currentStatus: 'in-queue' | 'printing' | 'packaging' | 'shipped' | 'cancelled';
	};
	/**
	 * Comments on this order
	 */
	comments?: string | null;
	updatedAt: string;
	createdAt: string;
}
/**
 * Products available for purchase in the shop. DO NOT DELETE PRODUCTS, ARCHIVE INSTEAD.
 *
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "products".
 */
export interface Product {
	id: string;
	/**
	 * The name of the product.
	 */
	name: string;
	/**
	 * A detailed description of the product
	 */
	description: string;
	pictures: (string | Media)[];
	/**
	 * The price of the product in GBP (£) (e.g. 1.5)
	 */
	price: number;
	/**
	 * The estimated print time for the product (e.g. "2h30m")
	 */
	time: string;
	/**
	 * The number of times this product has been bought
	 */
	orders?: number | null;
	printingOptions: {
		plastic: {
			/**
			 * The name of the plastic type
			 */
			name: string;
			/**
			 * A brief description of the plastic type
			 */
			description?: string | null;
			colours?:
				| {
						colour: string;
						id?: string | null;
				  }[]
				| null;
			id?: string | null;
			blockName?: string | null;
			blockType: 'plastic';
		}[];
		/**
		 * The layer height of the product. This is set by the preset and cannot be changed by the user.
		 */
		layerHeight: number;
		/**
		 * The infill percentage of the product. This is set by the preset and cannot be changed by the user.
		 */
		infill: number;
	};
	updatedAt: string;
	createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "media".
 */
export interface Media {
	id: string;
	/**
	 * Alt text for images / caption for videos
	 */
	alt: string;
	updatedAt: string;
	createdAt: string;
	url?: string | null;
	thumbnailURL?: string | null;
	filename?: string | null;
	mimeType?: string | null;
	filesize?: number | null;
	width?: number | null;
	height?: number | null;
	focalX?: number | null;
	focalY?: number | null;
}
/**
 * Quotes generated for 3D models, used to create orders
 *
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "quotes".
 */
export interface Quote {
	id: string;
	/**
	 * The 3D model associated with this item
	 */
	model: {
		filename: string;
		filetype: 'stl' | '3mf';
		/**
		 * The unique download URL to the model
		 */
		modelUrl?: string | null;
		/**
		 * The unique download URL to the G-code file
		 */
		gcodeUrl?: string | null;
	};
	printingOptions: {
		preset?: (string | null) | Preset;
		layerHeight?: number | null;
		infill?: number | null;
		/**
		 * The plastic/material ID
		 */
		plastic: string;
		/**
		 * The colour ID
		 */
		colour: string;
	};
	/**
	 * The user who requested the quote
	 */
	customer: string | User;
	/**
	 * Estimated filament usage in grams as returned by the slicer
	 */
	filament?: number | null;
	/**
	 * Estimated print time as returned by the slicer (total)
	 */
	time?: string | null;
	price?: number | null;
	updatedAt: string;
	createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "presets".
 */
export interface Preset {
	id: string;
	/**
	 * The name of the preset
	 */
	name: string;
	/**
	 * A brief description of the preset
	 */
	description?: string | null;
	/**
	 * The filename of the profile of the preset (process) in Bambu Studio/Orca Slicer. DO NOT INCLUDE FILE EXTENSION. See C:\Program Files\OrcaSlicer\resources\profiles\BBL\process
	 */
	bambulabName?: string | null;
	updatedAt: string;
	createdAt: string;
}
/**
 * This interface was referenced by `Config`'s JSON-Schema
 * via the `definition` "filaments".
 */
export interface Filament {
	id: string;
	/**
	 * The name of the filament/material. USE THIS FORMAT: PLA, PETG, ABS, etc.
	 */
	name: string;
	/**
	 * JSON data from filament folder in Bambu Labs or Orca Slicer. Path: C:/Program Files/OrcaSlicer/resources/profiles/BBL
	 */
	data:
		| {
				[k: string]: unknown;
		  }
		| unknown[]
		| string
		| number
		| boolean
		| null;
	updatedAt: string;
	createdAt: string;
}
