type RGB = { r: number; g: number; b: number };
type HSL = { h: number; s: number; l: number };

export const rgbToHex = ({ r, g, b }: RGB): string => {
	const toHex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, '0');
	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const hexToRgb = (hex: string): RGB | null => {
	const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	return result
		? {
				r: Number.parseInt(result[1], 16),
				g: Number.parseInt(result[2], 16),
				b: Number.parseInt(result[3], 16),
		  }
		: null;
};

export const rgbToHsl = ({ r, g, b }: RGB): HSL => {
	r /= 255;
	g /= 255;
	b /= 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	let h = 0;
	let s = 0;
	const l = (max + min) / 2;

	if (max !== min) {
		const d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

		switch (max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}

		h /= 6;
	}

	return {
		h: Math.round(h * 360),
		s: Math.round(s * 100),
		l: Math.round(l * 100),
	};
};

export const hslToRgb = ({ h, s, l }: HSL): RGB => {
	h /= 360;
	s /= 100;
	l /= 100;

	let r: number, g: number, b: number;

	if (s === 0) {
		r = g = b = l;
	} else {
		const hue2rgb = (p: number, q: number, t: number) => {
			if (t < 0) t += 1;
			if (t > 1) t -= 1;
			if (t < 1 / 6) return p + (q - p) * 6 * t;
			if (t < 1 / 2) return q;
			if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
			return p;
		};

		const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
		const p = 2 * l - q;

		r = hue2rgb(p, q, h + 1 / 3);
		g = hue2rgb(p, q, h);
		b = hue2rgb(p, q, h - 1 / 3);
	}

	return {
		r: Math.round(r * 255),
		g: Math.round(g * 255),
		b: Math.round(b * 255),
	};
};

export const formatRgba = (rgb: RGB, a = 1): string => {
	return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${a})`;
};

export const formatHsla = (hsl: HSL, a = 1): string => {
	return `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${a})`;
};

export const hexToHsv = (hex: string): { h: number; s: number; v: number } => {
	// Remove # if present
	hex = hex.replace(/^#/, '');

	// Parse the hex values
	const r = parseInt(hex.substring(0, 2), 16) / 255;
	const g = parseInt(hex.substring(2, 4), 16) / 255;
	const b = parseInt(hex.substring(4, 6), 16) / 255;

	const max = Math.max(r, g, b);
	const min = Math.min(r, g, b);
	const delta = max - min;

	// Calculate hue
	let h = 0;
	if (delta !== 0) {
		if (max === r) h = ((g - b) / delta) % 6;
		else if (max === g) h = (b - r) / delta + 2;
		else h = (r - g) / delta + 4;
	}

	h = Math.round(h * 60);
	if (h < 0) h += 360;

	// Calculate saturation and value
	const s = max === 0 ? 0 : delta / max;
	const v = max;

	return { h, s, v };
};

export const hsvToHex = (h: number, s: number, v: number): string => {
	h = (h % 360) / 60;

	// Calculate chroma, x, and m
	const c = v * s;
	const x = c * (1 - Math.abs((h % 2) - 1));
	const m = v - c;

	let r = 0,
		g = 0,
		b = 0;

	if (h >= 0 && h < 1) {
		r = c;
		g = x;
		b = 0;
	} else if (h >= 1 && h < 2) {
		r = x;
		g = c;
		b = 0;
	} else if (h >= 2 && h < 3) {
		r = 0;
		g = c;
		b = x;
	} else if (h >= 3 && h < 4) {
		r = 0;
		g = x;
		b = c;
	} else if (h >= 4 && h < 5) {
		r = x;
		g = 0;
		b = c;
	} else {
		r = c;
		g = 0;
		b = x;
	}

	// Convert to hex
	const toHex = (comp: number) => {
		const hex = Math.round((comp + m) * 255).toString(16);
		return hex.length === 1 ? '0' + hex : hex;
	};

	return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};
