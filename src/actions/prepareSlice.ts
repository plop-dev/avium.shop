'use server';

import { getPayload } from 'payload';
import config from '@payload-config';

import { getUser } from '@/utils/getUser';
import { aviumServerFetch } from '@/lib/backendHelper';

export async function prepareSliceResources(quoteId: string) {
	const user = await getUser();

	if (!user?.id) {
		throw new Error('Not authenticated');
	}

	const payload = await getPayload({ config });

	const userDoc = await payload.findByID({
		collection: 'users',
		id: user.id,
	});

	// verify the user has permission to access this quote
	const quote = await payload.findByID({
		collection: 'quotes',
		id: quoteId,
		depth: 2,
		overrideAccess: false,
		user: userDoc,
	});

	const plastic = quote.printingOptions.plastic;

	// get filament profile straight from the db
	const filaments = await payload.find({
		collection: 'filaments',
		where: {
			name: {
				equals: plastic,
			},
		},
		limit: 1,
	});

	const filament = filaments.docs[0];

	if (!filament) {
		throw new Error(`No filament profile found for ${plastic}`);
	}

	const filamentForm = new FormData();

	filamentForm.append('name', filament.id);
	filamentForm.append('file', new Blob([JSON.stringify(filament.data)], { type: 'application/json' }), 'filament.json');

	const filamentResponse = await aviumServerFetch('/profiles/filaments', {
		method: 'POST',
		body: filamentForm,
	});

	if (!filamentResponse.ok) {
		throw new Error('Failed to prepare filament profile');
	}

	let presetName: string;

	if (quote.printingOptions.preset) {
		const preset =
			typeof quote.printingOptions.preset === 'string'
				? await payload.findByID({
						collection: 'presets',
						id: quote.printingOptions.preset,
					})
				: quote.printingOptions.preset;

		presetName = preset.bambulabName;
	} else {
		presetName = quote.id;

		const response = await aviumServerFetch('/generate/presets', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				name: quote.id,
				layerHeight: quote.printingOptions.layerHeight ?? 0.2,
				infill: quote.printingOptions.infill ?? 15,
			}),
		});

		if (!response.ok) {
			throw new Error('Failed to generate preset');
		}
	}

	return {
		filament: filament.id,
		preset: presetName,
	};
}
