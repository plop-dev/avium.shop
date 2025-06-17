'use client';

import { useField, TextInput, FieldLabel, toast } from '@payloadcms/ui';
import styles from './colourPicker.module.css';
import { useEffect, useRef, useState, useCallback } from 'react';

// Color conversion utilities
const hexToHsv = (hex: string): { h: number; s: number; v: number } => {
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

const hsvToHex = (h: number, s: number, v: number): string => {
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

const ColourPicker = ({ field: { label, required = false }, path }: { field: { label: string; required?: boolean }; path: string }) => {
	const { value, setValue, showError, errorMessage } = useField<string>({ path });

	// Initialize with black if no value
	const defaultColor = value || '#000000';

	// Convert hex to HSV
	const hsv = hexToHsv(defaultColor);
	const [hue, setHue] = useState<number>(hsv.h);
	const [saturation, setSaturation] = useState<number>(hsv.s);
	const [brightness, setBrightness] = useState<number>(hsv.v);

	// Refs for interaction
	const satValGridRef = useRef<HTMLDivElement>(null);
	const hueSliderRef = useRef<HTMLDivElement>(null);

	// Update hsv when external value changes
	useEffect(() => {
		if (value) {
			try {
				const newHsv = hexToHsv(value);
				setHue(newHsv.h);
				setSaturation(newHsv.s);
				setBrightness(newHsv.v);
			} catch (error) {
				// Handle invalid hex values gracefully
			}
		}
	}, [value]);

	// Update the hex value when HSV changes
	useEffect(() => {
		const newHexValue = hsvToHex(hue, saturation, brightness);
		setValue(newHexValue);
	}, [hue, saturation, brightness, setValue]);

	// Handle text input change
	const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = e.target.value;
		setValue(val);

		// Validate hex color format
		if (val && !val.startsWith('#')) {
			toast.error('Color value must start with #', {
				id: `colour-picker-format-${path}`,
				duration: 2000,
				dismissible: true,
			});
		} else if (val && val.length === 7 && !/^#[0-9A-Fa-f]{6}$/.test(val)) {
			toast.error('Invalid hex color format', {
				id: `colour-picker-format-${path}`,
				duration: 2000,
				dismissible: true,
			});
		}
	};

	// Handle saturation-value grid interaction
	const handleSatValChange = useCallback((e: React.MouseEvent | React.TouchEvent) => {
		if (!satValGridRef.current) return;

		const rect = satValGridRef.current.getBoundingClientRect();
		let clientX, clientY;

		// Handle both mouse and touch events
		if ('touches' in e) {
			clientX = e.touches[0].clientX;
			clientY = e.touches[0].clientY;
		} else {
			e.preventDefault();
			clientX = e.clientX;
			clientY = e.clientY;
		}

		// Calculate new saturation and brightness based on position
		let newSat = (clientX - rect.left) / rect.width;
		let newBrightness = 1 - (clientY - rect.top) / rect.height;

		// Clamp values between 0 and 1
		newSat = Math.max(0, Math.min(1, newSat));
		newBrightness = Math.max(0, Math.min(1, newBrightness));

		setSaturation(newSat);
		setBrightness(newBrightness);
	}, []);

	// Handle hue slider interaction
	const handleHueChange = useCallback((e: React.MouseEvent | React.TouchEvent) => {
		if (!hueSliderRef.current) return;

		const rect = hueSliderRef.current.getBoundingClientRect();
		let clientX;

		// Handle both mouse and touch events
		if ('touches' in e) {
			clientX = e.touches[0].clientX;
		} else {
			e.preventDefault();
			clientX = e.clientX;
		}

		// Calculate new hue based on position
		let newHue = ((clientX - rect.left) / rect.width) * 360;

		// Clamp value between 0 and 359
		newHue = Math.max(0, Math.min(359, newHue));

		setHue(newHue);
	}, []);

	// Mouse/touch event handlers
	const handleMouseDown = (handler: (e: React.MouseEvent | React.TouchEvent) => void) => (e: React.MouseEvent | React.TouchEvent) => {
		handler(e);

		const moveHandler = (e: MouseEvent | TouchEvent) => handler(e as any);
		const upHandler = () => {
			document.removeEventListener('mousemove', moveHandler);
			document.removeEventListener('mouseup', upHandler);
			document.removeEventListener('touchmove', moveHandler);
			document.removeEventListener('touchend', upHandler);
		};

		document.addEventListener('mousemove', moveHandler);
		document.addEventListener('mouseup', upHandler);
		document.addEventListener('touchmove', moveHandler, { passive: false });
		document.addEventListener('touchend', upHandler);
	};

	// Error handling
	useEffect(() => {
		if (showError && errorMessage) {
			toast.error(errorMessage, {
				id: `colour-picker-error-${path}`,
				duration: 2000,
				dismissible: true,
			});
		}
	}, [showError, errorMessage, path]);

	return (
		<div className={styles.colourPickerContainer}>
			<FieldLabel htmlFor={path} label={label} required={required} />

			<div className={styles.pickerWrapper}>
				{/* Controls row with preview and hex input */}
				<div className={styles.controlsRow}>
					<div className={styles.colorPreview} style={{ backgroundColor: value || '#000000' }} />
					<div className={styles.textInputWrapper}>
						<TextInput path={path} value={value || ''} onChange={handleTextChange} placeholder='#000000' showError={showError} />
					</div>
				</div>

				{/* Color grid with saturation and brightness */}
				<div
					ref={satValGridRef}
					className={styles.saturationValueGrid}
					style={{ backgroundColor: `hsl(${hue}, 100%, 50%)` }}
					onMouseDown={handleMouseDown(handleSatValChange)}
					onTouchStart={handleMouseDown(handleSatValChange)}>
					<div className={styles.saturationLayer}>
						<div className={styles.valueLayer}>
							<div
								className={styles.gridPointer}
								style={{
									left: `${saturation * 100}%`,
									top: `${(1 - brightness) * 100}%`,
									backgroundColor: value || '#000000',
								}}
							/>
						</div>
					</div>
				</div>

				{/* Hue slider */}
				<div
					ref={hueSliderRef}
					className={styles.hueSlider}
					onMouseDown={handleMouseDown(handleHueChange)}
					onTouchStart={handleMouseDown(handleHueChange)}>
					<div className={styles.hueSliderPointer} style={{ left: `${(hue / 360) * 100}%` }} />
				</div>
			</div>
		</div>
	);
};

export default ColourPicker;
