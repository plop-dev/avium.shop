'use client';

import { useField, TextInput, FieldLabel, toast } from '@payloadcms/ui';
import './ColourPicker.css';
import { useEffect, useRef, useState, useCallback } from 'react';
import { hexToHsv, hsvToHex } from '@/utils/colourUtils';

const ColourPicker = ({ field: { label, required = false }, path }: { field: { label: string; required?: boolean }; path: string }) => {
	const { value, setValue, showError, errorMessage } = useField<string>({ path });

	// Initialize with black if no value
	const defaultColor = value || '#000000';

	// Convert hex to HSV
	const hsv = hexToHsv(defaultColor);
	const [hue, setHue] = useState<number>(hsv.h);
	const [saturation, setSaturation] = useState<number>(hsv.s);
	const [brightness, setBrightness] = useState<number>(hsv.v);

	// Picker visibility state
	const [showPicker, setShowPicker] = useState<boolean>(false);

	// Refs for interaction
	const satValGridRef = useRef<HTMLDivElement>(null);
	const hueSliderRef = useRef<HTMLDivElement>(null);
	const pickerRef = useRef<HTMLDivElement>(null);

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

	// Hide picker when clicking outside
	useEffect(() => {
		if (!showPicker) return;
		const handleClickOutside = (event: MouseEvent) => {
			if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
				setShowPicker(false);
			}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, [showPicker]);

	// Handle preview click with proper toggle behavior
	const handlePreviewClick = () => {
		setShowPicker(prev => !prev);
	};

	return (
		<div className={'colourPickerContainer'}>
			<FieldLabel htmlFor={path} label={label} required={required} />

			<div className={'pickerWrapper'}>
				{/* Controls row with preview and hex input */}
				<div className={'controlsRow'}>
					<div
						className={'colorPreview'}
						style={{ backgroundColor: value || '#000000', cursor: 'pointer' }}
						onClick={handlePreviewClick}
						tabIndex={0}
						aria-label='Open color picker'
					/>
					<div className={'textInputWrapper'}>
						<TextInput path={path} value={value || ''} onChange={handleTextChange} placeholder='#000000' showError={showError} />
					</div>
				</div>

				{showPicker && (
					<div className={`gridWrapper ${showPicker ? 'pickerVisible' : ''}`} ref={pickerRef}>
						<div
							ref={satValGridRef}
							className={'saturationValueGrid'}
							style={{ backgroundColor: `hsl(${hue}, 100%, 50%)` }}
							onMouseDown={handleMouseDown(handleSatValChange)}
							onTouchStart={handleMouseDown(handleSatValChange)}>
							<div className={'saturationLayer'}></div>
							<div className={'valueLayer'}>
								<div
									className={'gridPointer'}
									style={{
										left: `${saturation * 100}%`,
										top: `${(1 - brightness) * 100}%`,
										backgroundColor: value || '#000000',
									}}
								/>
							</div>
						</div>

						<div
							ref={hueSliderRef}
							className={'hueSlider'}
							onMouseDown={handleMouseDown(handleHueChange)}
							onTouchStart={handleMouseDown(handleHueChange)}>
							<div className={'hueSliderPointer'} style={{ left: `${(hue / 360) * 100}%` }} />
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ColourPicker;
