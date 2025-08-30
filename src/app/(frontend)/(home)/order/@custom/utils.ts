import fileToBase64 from '@/utils/fileToBase64';
import validateUrl from '@/utils/validateUrl';

export type UploadChunk = {
	id: string;
	chunkIndex: number;
	currentChunk: number;
	totalChunks: number;
	filetype: string;
	data: string; // base64
};

export type UploadedChunkResponse = {
	received: number;
	total: number;
	complete: false;
};

export type UploadedFileResponse = {
	id: string;
	filename: string;
	size: number;
	filetype: string;
	url: string;
	complete: true;
};

async function uploadChunk(chunk: UploadChunk, serverUrl: string) {
	const response = await fetch(`${serverUrl}upload`, {
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

	return response.json() as Promise<UploadedFileResponse | UploadedChunkResponse>;
}

export async function uploadFile(
	file: File,
	onProgress: (progress: number, currentChunk: number, totalChunks: number) => void,
	serverUrl: string,
	CHUNK_SIZE = 5 * 1024 * 1024,
) {
	const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
	const uploadId = crypto.randomUUID();
	let uploadResponse: UploadedFileResponse | undefined = undefined;

	console.log(`Uploading ${file.name} in ${totalChunks} chunks`);

	for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
		const start = chunkIndex * CHUNK_SIZE;
		const end = Math.min(start + CHUNK_SIZE, file.size);
		const chunk = file.slice(start, end);

		// Convert chunk to base64
		const base64Data = await fileToBase64(chunk as File);

		const chunkPayload = {
			id: uploadId,
			chunkIndex,
			currentChunk: chunkIndex + 1,
			totalChunks: totalChunks,
			filetype: file.name.split('.').pop() || 'bin',
			data: base64Data as string,
		};

		const res = await uploadChunk(chunkPayload, serverUrl);
		console.log(`Chunk ${chunkIndex + 1}/${totalChunks} upload response:`, res);
		if ('complete' in res && res.complete) {
			uploadResponse = res;
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
