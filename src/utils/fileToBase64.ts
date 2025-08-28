export default function fileToBase64(file: File) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => {
			// Remove data:mime;base64, prefix
			if (typeof reader?.result !== 'string') return reject(new Error('Could not read file'));
			const base64 = reader?.result.split(',')[1];
			resolve(base64);
		};
		reader.onerror = reject;
	});
}
