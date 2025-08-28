export default function validateUrl(url: string, trailingSlash = false): string {
	try {
		const parsed = new URL(url);
		if (trailingSlash) {
			if (!parsed.pathname.endsWith('/')) {
				parsed.pathname += '/';
			}
		} else {
			if (parsed.pathname.endsWith('/')) {
				parsed.pathname = parsed.pathname.slice(0, -1);
			}
		}
		return parsed.pathname;
	} catch {
		return url;
	}
}
