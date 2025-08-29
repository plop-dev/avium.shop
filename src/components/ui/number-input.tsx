import NumberFlow from '@number-flow/react';
import clsx from 'clsx';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from './button';
import { Minus, Plus } from 'lucide-react';

type Props = {
	value?: number;
	min?: number;
	max?: number;
	onChange?: (value: number) => void;
	className?: string;
	defaultValue?: number;
};

export function NumberInput({ value, min = -Infinity, max = Infinity, onChange, className, defaultValue }: Props) {
	const isControlled = value !== undefined;
	const [internalValue, setInternalValue] = React.useState<number>(defaultValue ?? 0);
	const currentValue = isControlled ? (value as number) : internalValue;

	const clamp = React.useCallback((v: number) => Math.min(Math.max(v, min), max), [min, max]);

	const inputRef = React.useRef<HTMLInputElement>(null);
	const [animated, setAnimated] = React.useState(true);
	// Hide the caret during transitions so you can't see it shifting around:
	const [showCaret, setShowCaret] = React.useState(true);

	const setValue = React.useCallback(
		(next: number) => {
			const clamped = clamp(next);
			if (!isControlled) setInternalValue(clamped);
			onChange?.(clamped);
		},
		[clamp, isControlled, onChange],
	);

	const handleInput: React.ChangeEventHandler<HTMLInputElement> = ({ currentTarget: el }) => {
		setAnimated(false);
		if (el.value === '') {
			const fallback = Number.isFinite(min) ? min : 0; // Use min if defined, else 0
			setValue(fallback);
			return;
		}
		const num = parseInt(el.value);
		if (isNaN(num) || (min != null && num < min) || (max != null && num > max)) {
			// Revert input's value:
			el.value = String(currentValue);
		} else {
			// Manually update value in case they e.g. start with a "0" or end with a "."
			// which won't trigger a DOM update (because the number is the same):
			el.value = String(num);
			setValue(num);
		}
	};

	const handlePointerDown = (diff: number) => (event: React.PointerEvent<HTMLButtonElement>) => {
		setAnimated(true);
		if (event.pointerType === 'mouse') {
			event?.preventDefault();
			inputRef.current?.focus();
		}
		const newVal = clamp(currentValue + diff);
		setValue(newVal);
	};

	return (
		<div
			className={cn(
				'group flex h-10 items-stretch rounded-md border border-input bg-transparent text-sm font-medium shadow-xs transition-all',
				className,
			)}>
			<button
				aria-hidden
				tabIndex={-1}
				className='flex items-center rounded-l-md px-2.5 hover:bg-accent/50 disabled:pointer-events-none disabled:opacity-50'
				disabled={currentValue <= min}
				type='button'
				onPointerDown={handlePointerDown(-1)}>
				<Minus className='size-4' strokeWidth={2.5} />
			</button>
			{/* <Button
				aria-hidden
				size={'icon'}
				variant={'ghost'}
				tabIndex={-1}
				disabled={currentValue <= min}
				onClick={handlePointerDown(-1)}>
				-
			</Button> */}
			<div className="relative grid w-auto items-center justify-items-center text-center [grid-template-areas:'overlap'] *:[grid-area:overlap]">
				<input
					ref={inputRef}
					className={clsx(
						showCaret ? 'caret-primary' : 'caret-transparent',
						'spin-hide w-full bg-transparent py-2 text-center font-[inherit] text-transparent outline-none focus:outline-none outline-transparent',
					)}
					// Make sure to disable kerning, to match NumberFlow:
					style={{ fontKerning: 'none' }}
					type='number'
					min={Number.isFinite(min) ? min : undefined}
					step={1}
					autoComplete='off'
					inputMode='numeric'
					max={Number.isFinite(max) ? max : undefined}
					value={currentValue}
					onInput={handleInput}
				/>
				<NumberFlow
					value={currentValue}
					format={{ useGrouping: false }}
					aria-hidden
					animated={animated}
					onAnimationsStart={() => setShowCaret(false)}
					onAnimationsFinish={() => setShowCaret(true)}
					className='pointer-events-none'
					willChange
				/>
			</div>
			{/* <Button aria-hidden size={'icon'} variant={'ghost'} tabIndex={-1} disabled={currentValue >= max} onClick={handlePointerDown(1)}>
				+
			</Button> */}
			<button
				aria-hidden
				tabIndex={-1}
				className='flex items-center rounded-r-md px-2.5 hover:bg-accent/50 disabled:pointer-events-none disabled:opacity-50'
				disabled={currentValue >= max}
				type='button'
				onPointerDown={handlePointerDown(1)}>
				<Plus className='size-4' strokeWidth={2.5} />
			</button>
		</div>
	);
}

export default { Input: NumberInput };
