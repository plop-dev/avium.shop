'use client';

import * as React from 'react';
import { Copy, Check } from 'lucide-react';

// Payload CMS imports
import { useField } from '@payloadcms/ui';
import { FieldLabel } from '@payloadcms/ui/fields/FieldLabel';
import { TextInputProps } from '@payloadcms/ui/fields/Text';

// Validation
import { validateHexColour } from './config';

// Utilities and components
import { cn } from '@/lib/utils';
import * as ColorUtils from '@/utils/colourUtils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

type ColorMode = 'hex' | 'rgba' | 'hsla';
type CopyState = { [key in ColorMode]: boolean };

// Payload CMS compatible component
const ColourPicker: React.FC<TextInputProps> = props => {
	const { path, label, required } = props;

	// Use Payload's useField hook
	const { value, setValue } = useField<string>({
		path,
		validate: validateHexColour,
	});

	const currentColour = value || '#000000';
	const [colorMode, setColorMode] = React.useState<ColorMode>('hex');
	const [copied, setCopied] = React.useState<CopyState>({
		hex: false,
		rgba: false,
		hsla: false,
	});
	const colorPlaneRef = React.useRef<HTMLDivElement>(null);
	const isDragging = React.useRef(false);

	// Calculate color values
	const rgb = React.useMemo(() => {
		return ColorUtils.hexToRgb(currentColour) || { r: 0, g: 0, b: 0 };
	}, [currentColour]);

	const hsl = React.useMemo(() => {
		return ColorUtils.rgbToHsl(rgb);
	}, [rgb]);

	const rgbaString = React.useMemo(() => {
		return ColorUtils.formatRgba(rgb);
	}, [rgb]);

	const hslaString = React.useMemo(() => {
		return ColorUtils.formatHsla(hsl);
	}, [hsl]);

	// Color change handlers
	const updateHSL = React.useCallback(
		(h: number, s: number, l: number) => {
			const rgb = ColorUtils.hslToRgb({ h, s, l });
			setValue(ColorUtils.rgbToHex(rgb));
		},
		[setValue],
	);

	// Mouse/touch handlers for color plane
	const handleColorPlaneChange = React.useCallback(
		(e: React.MouseEvent | React.TouchEvent) => {
			if (!colorPlaneRef.current) return;

			const rect = colorPlaneRef.current.getBoundingClientRect();
			const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
			const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

			const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
			const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

			updateHSL(hsl.h, Math.round(x * 100), Math.round((1 - y) * 100));
		},
		[hsl.h, updateHSL],
	);

	const handleMouseDown = React.useCallback(
		(e: React.MouseEvent | React.TouchEvent) => {
			isDragging.current = true;
			handleColorPlaneChange(e);
		},
		[handleColorPlaneChange],
	);

	const handleMouseMove = React.useCallback(
		(e: React.MouseEvent | React.TouchEvent) => {
			if (isDragging.current) {
				handleColorPlaneChange(e);
			}
		},
		[handleColorPlaneChange],
	);

	const handleMouseUp = React.useCallback(() => {
		isDragging.current = false;
	}, []);

	// Global mouse up handler
	React.useEffect(() => {
		const handleGlobalMouseUp = () => {
			isDragging.current = false;
		};

		window.addEventListener('mouseup', handleGlobalMouseUp);
		window.addEventListener('touchend', handleGlobalMouseUp);

		return () => {
			window.removeEventListener('mouseup', handleGlobalMouseUp);
			window.removeEventListener('touchend', handleGlobalMouseUp);
		};
	}, []);

	// Copy to clipboard functionality
	const copyToClipboard = React.useCallback((text: string, format: ColorMode) => {
		navigator.clipboard.writeText(text);
		setCopied(prev => ({ ...prev, [format]: true }));
		setTimeout(() => {
			setCopied(prev => ({ ...prev, [format]: false }));
		}, 1500);
	}, []);

	// Input change handlers
	const handleHexChange = React.useCallback(
		(e: React.ChangeEvent<HTMLInputElement>) => {
			const hex = e.target.value;
			setValue(hex);
		},
		[setValue],
	);

	const handleRgbChange = React.useCallback(
		(key: keyof typeof rgb, value: string) => {
			const numValue = Number.parseInt(value);
			if (!isNaN(numValue) && numValue >= 0 && numValue <= 255) {
				const newRgb = { ...rgb, [key]: numValue };
				setValue(ColorUtils.rgbToHex(newRgb));
			}
		},
		[rgb, setValue],
	);

	const handleHslChange = React.useCallback(
		(key: keyof typeof hsl, value: string) => {
			const numValue = Number.parseInt(value);
			if (isNaN(numValue)) return;

			const max = key === 'h' ? 360 : 100;
			if (numValue >= 0 && numValue <= max) {
				const newHsl = { ...hsl, [key]: numValue };
				const newRgb = ColorUtils.hslToRgb(newHsl);
				setValue(ColorUtils.rgbToHex(newRgb));
			}
		},
		[hsl, setValue],
	);

	return (
		<div className='space-y-2'>
			<FieldLabel htmlFor={path} label={label} required={required} />
			<Popover>
				<PopoverTrigger asChild>
					<Button variant='outline' className='w-full max-w-[240px] justify-start text-left font-normal'>
						<div className='w-full flex items-center gap-2'>
							<div className='h-4 w-4 rounded border border-gray-300 flex-shrink-0' style={{ backgroundColor: currentColour }} />
							<span className='truncate flex-1 font-mono'>{currentColour}</span>
						</div>
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-80'>
					<div className='grid gap-4'>
						{/* Color Plane */}
						<div
							ref={colorPlaneRef}
							className='relative w-full h-48 rounded-lg cursor-crosshair touch-none overflow-hidden border'
							style={{
								backgroundColor: `hsl(${hsl.h}, 100%, 50%)`,
							}}
							onMouseDown={handleMouseDown}
							onMouseMove={handleMouseMove}
							onMouseUp={handleMouseUp}
							onTouchStart={handleMouseDown}
							onTouchMove={handleMouseMove}
							onTouchEnd={handleMouseUp}>
							{/* Saturation gradient */}
							<div
								className='absolute inset-0'
								style={{
									background: 'linear-gradient(to right, #fff 0%, transparent 100%)',
								}}
							/>
							{/* Lightness gradient */}
							<div
								className='absolute inset-0'
								style={{
									background: 'linear-gradient(to top, #000 0%, transparent 100%)',
								}}
							/>
							{/* Color indicator */}
							<div
								className='absolute w-4 h-4 border-2 border-white rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none shadow-md'
								style={{
									left: `${hsl.s}%`,
									top: `${100 - hsl.l}%`,
									backgroundColor: currentColour,
								}}
							/>
						</div>

						{/* Hue Slider */}
						<div className='grid gap-2'>
							<Label>Hue</Label>
							<div
								className='relative h-6 w-full rounded-lg overflow-hidden border'
								style={{
									backgroundImage: `linear-gradient(to right, 
										hsl(0, 100%, 50%),
										hsl(60, 100%, 50%),
										hsl(120, 100%, 50%),
										hsl(180, 100%, 50%),
										hsl(240, 100%, 50%),
										hsl(300, 100%, 50%),
										hsl(360, 100%, 50%)
									)`,
								}}>
								<Slider
									value={[hsl.h]}
									max={360}
									step={1}
									className='absolute inset-0 [&_[role=slider]]:h-4 [&_[role=slider]]:w-4'
									onValueChange={([h]) => updateHSL(h, hsl.s, hsl.l)}
								/>
							</div>
						</div>

						{/* Color Format Tabs */}
						<Tabs value={colorMode} onValueChange={v => setColorMode(v as ColorMode)}>
							<TabsList className='w-full'>
								<TabsTrigger value='hex' className='flex-1'>
									Hex
								</TabsTrigger>
								<TabsTrigger value='rgba' className='flex-1'>
									RGBA
								</TabsTrigger>
								<TabsTrigger value='hsla' className='flex-1'>
									HSLA
								</TabsTrigger>
							</TabsList>

							<TabsContent value='hex' className='mt-2'>
								<div className='flex gap-2'>
									<Input value={currentColour} onChange={handleHexChange} className='font-mono' />
									<Button variant='ghost' size='icon' className='shrink-0' onClick={() => copyToClipboard(currentColour, 'hex')}>
										{copied.hex ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
									</Button>
								</div>
							</TabsContent>

							<TabsContent value='rgba' className='mt-2'>
								<div className='grid gap-4'>
									<div className='flex gap-2'>
										<Input value={rgbaString} readOnly className='font-mono' />
										<Button variant='ghost' size='icon' className='shrink-0' onClick={() => copyToClipboard(rgbaString, 'rgba')}>
											{copied.rgba ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
										</Button>
									</div>
									<div className='grid grid-cols-4 gap-2'>
										<div>
											<Label>R</Label>
											<Input value={rgb.r} onChange={e => handleRgbChange('r', e.target.value)} className='font-mono' />
										</div>
										<div>
											<Label>G</Label>
											<Input value={rgb.g} onChange={e => handleRgbChange('g', e.target.value)} className='font-mono' />
										</div>
										<div>
											<Label>B</Label>
											<Input value={rgb.b} onChange={e => handleRgbChange('b', e.target.value)} className='font-mono' />
										</div>
										<div>
											<Label>A</Label>
											<Input value='1' readOnly className='font-mono' />
										</div>
									</div>
								</div>
							</TabsContent>

							<TabsContent value='hsla' className='mt-2'>
								<div className='grid gap-4'>
									<div className='flex gap-2'>
										<Input value={hslaString} readOnly className='font-mono' />
										<Button variant='ghost' size='icon' className='shrink-0' onClick={() => copyToClipboard(hslaString, 'hsla')}>
											{copied.hsla ? <Check className='h-4 w-4' /> : <Copy className='h-4 w-4' />}
										</Button>
									</div>
									<div className='grid grid-cols-4 gap-2'>
										<div>
											<Label>H</Label>
											<Input value={hsl.h} onChange={e => handleHslChange('h', e.target.value)} className='font-mono' />
										</div>
										<div>
											<Label>S</Label>
											<Input value={hsl.s} onChange={e => handleHslChange('s', e.target.value)} className='font-mono' />
										</div>
										<div>
											<Label>L</Label>
											<Input value={hsl.l} onChange={e => handleHslChange('l', e.target.value)} className='font-mono' />
										</div>
										<div>
											<Label>A</Label>
											<Input value='1' readOnly className='font-mono' />
										</div>
									</div>
								</div>
							</TabsContent>
						</Tabs>

						{/* Color Preview */}
						<div className='h-6 rounded border' style={{ backgroundColor: currentColour }} />
					</div>
				</PopoverContent>
			</Popover>
		</div>
	);
};

export { ColourPicker };
