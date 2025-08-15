import NumberFlow from '@number-flow/react';
import clsx from 'clsx';
import { Minus, Plus } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';

type Props = {
	value?: number;
	min?: number;
	max?: number;
	onChange?: (value: number) => void;
	className?: string;
};

export function Input({ value = 0, min = -Infinity, max = Infinity, onChange, className }: Props) {
	const defaultValue = React.useRef(value);
	const inputRef = React.useRef<HTMLInputElement>(null);
	const [animated, setAnimated] = React.useState(true);
	// Hide the caret during transitions so you can't see it shifting around:
	const [showCaret, setShowCaret] = React.useState(true);
	const handleInput: React.ChangeEventHandler<HTMLInputElement> = ({ currentTarget: el }) => {
		setAnimated(false);
		if (el.value === '') {
			onChange?.(min ?? 0); // Use min if defined, else 0
			return;
		}
		const num = parseInt(el.value);
		if (isNaN(num) || (min != null && num < min) || (max != null && num > max)) {
			// Revert input's value:
			el.value = String(value);
		} else {
			// Manually update value in case they e.g. start with a "0" or end with a "."
			// which won't trigger a DOM update (because the number is the same):
			el.value = String(num);
			onChange?.(num);
		}
	};
	const handlePointerDown = (diff: number) => (event: React.PointerEvent<HTMLButtonElement>) => {
		setAnimated(true);
		if (event.pointerType === 'mouse') {
			event?.preventDefault();
			inputRef.current?.focus();
		}
		const newVal = Math.min(Math.max(value + diff, min), max);
		onChange?.(newVal);
	};
	return (
		<div
			className={cn(
				'group flex h-9 items-stretch rounded-md border border-input bg-transparent text-sm font-medium shadow-xs transition-all',
				className,
			)}>
			<button
				aria-hidden
				tabIndex={-1}
				className='flex items-center rounded-l-md px-2.5 hover:bg-accent/50 disabled:pointer-events-none disabled:opacity-50'
				disabled={value <= min}
				onPointerDown={handlePointerDown(-1)}>
				<Minus className='size-4' strokeWidth={2.5} />
			</button>
			<div className="relative grid w-8 items-center justify-items-center text-center [grid-template-areas:'overlap'] *:[grid-area:overlap]">
				<input
					ref={inputRef}
					className={clsx(
						showCaret ? 'caret-primary' : 'caret-transparent',
						'spin-hide w-full bg-transparent py-2 text-center font-[inherit] text-transparent outline-none focus:outline-none outline-transparent',
					)}
					// Make sure to disable kerning, to match NumberFlow:
					style={{ fontKerning: 'none' }}
					type='number'
					min={min}
					step={1}
					autoComplete='off'
					inputMode='numeric'
					max={max}
					value={value}
					onInput={handleInput}
				/>
				<NumberFlow
					value={value}
					format={{ useGrouping: false }}
					aria-hidden
					animated={animated}
					onAnimationsStart={() => setShowCaret(false)}
					onAnimationsFinish={() => setShowCaret(true)}
					className='pointer-events-none'
					willChange
				/>
			</div>
			<button
				aria-hidden
				tabIndex={-1}
				className='flex items-center rounded-r-md px-2.5 hover:bg-accent/50 disabled:pointer-events-none disabled:opacity-50'
				disabled={value >= max}
				onPointerDown={handlePointerDown(1)}>
				<Plus className='size-4' strokeWidth={2.5} />
			</button>
		</div>
	);
}

export default { Input };
