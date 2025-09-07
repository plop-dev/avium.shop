import fileToBase64 from '@/utils/fileToBase64';
import validateUrl from '@/utils/validateUrl';

export type UploadChunk = {
	id: string;
	chunkIndex: number;
	currentChunk: number;
	totalChunks: number;
	filetype: string;
	data: string; // base64
	settings?: SlicingSettings; // For slicing settings when used with slice upload
};

export type UploadedChunkResponse = {
	received: number;
	total: number;
	complete: boolean;
};

export type FilamentInfo = {
	used_mm?: string;
	used_cm3?: string;
	used_g?: string;
	cost?: string;
};

export type SlicingResult = {
	id: string;
	modelFilename: string;
	gcodeFilename: string;
	modelSize: number;
	gcodeSize: number;
	modelUrl: string;
	gcodeUrl: string;
	complete: boolean;
	times: {
		model: string;
		total: string;
	};
	filament: FilamentInfo;
};

export interface SlicingSettings {
	printer?: string;
	preset?: string;
	filament?: string;
	bedType?: string;
	plate?: string;
	multicolorOnePlate?: boolean;
	arrange?: boolean;
	orient?: boolean;
	exportType?: 'gcode' | '3mf';
}

export type Category = 'printers' | 'presets' | 'filaments';

async function uploadChunk(chunk: UploadChunk, baseServerUrl: string) {
	const response = await fetch(`${baseServerUrl}slice`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'omit',
		body: JSON.stringify(chunk),
	});

	if (!response.ok) {
		throw new Error(`Chunk upload failed: ${response.statusText}`);
	}

	return response.json() as Promise<SlicingResult | UploadedChunkResponse>;
}

export async function uploadFile(
	file: File,
	onProgress: (progress: number, currentChunk: number, totalChunks: number) => void,
	baseServerUrl: string,
	CHUNK_SIZE = 5 * 1024 * 1024,
	slicerSettings: SlicingSettings,
) {
	const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
	const uploadId = crypto.randomUUID();
	let uploadResponse: SlicingResult | undefined = undefined;

	console.log(`Uploading ${file.name} in ${totalChunks} chunks`);

	for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
		const start = chunkIndex * CHUNK_SIZE;
		const end = Math.min(start + CHUNK_SIZE, file.size);
		const chunk = file.slice(start, end);

		// Convert chunk to base64
		const base64Data = await fileToBase64(chunk as File);

		const chunkData: UploadChunk = {
			id: uploadId,
			chunkIndex,
			currentChunk: chunkIndex + 1,
			totalChunks: totalChunks,
			filetype: file.name.split('.').pop() || 'bin',
			data: base64Data as string,
			...(chunkIndex === 0 && { settings: slicerSettings }),
		};

		const res = await uploadChunk(chunkData, baseServerUrl);
		console.log(`Chunk ${chunkIndex + 1}/${totalChunks} upload response:`, res);

		if ('complete' in res && res.complete && 'url' in res && 'id' in res) {
			uploadResponse = res as SlicingResult;
		}

		const currentChunk = chunkIndex + 1;
		// Report progress
		if (onProgress) {
			const progress = (currentChunk / totalChunks) * 100;
			onProgress(progress, currentChunk, totalChunks);
		}

		//! TESTING
		await new Promise(res => setTimeout(res, 1000));
	}

	return uploadResponse;
}
