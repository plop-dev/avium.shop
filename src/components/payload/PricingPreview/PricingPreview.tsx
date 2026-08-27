'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { useField, TextInput, FieldLabel, toast } from '@payloadcms/ui';
import { evaluate } from 'mathjs';

const FormulaField = ({ field: { label, required = false }, path }: { field: { label: string; required?: boolean }; path: string }) => {
	const { value, setValue, showError, errorMessage } = useField<string>({ path });
	const [preview, setPreview] = useState<string>('');

	useEffect(() => {
		try {
			// Example inputs for preview (cost and weight parameters are deprecated, use volume instead)
			const result = evaluate(value, { volume: 10, time: 1800, filamentMultiplier: 0.02232 });

			if (result < 0) {
				setPreview(
					`Invalid formula: Preview (10cm³ volume, 30mins time, filament multipler 0.02232): £${(result / 100).toFixed(2)}`,
				);
			}

			if (result === Infinity || isNaN(result) || !Number.isSafeInteger(result)) {
				setPreview('Invalid formula');
				return;
			}
			setPreview(`Preview (10cm³ volume, 30mins time, 0.02232 filament multiplier): £${(result / 100).toFixed(2)}`);
		} catch (err) {
			setPreview('Invalid formula');
		}
	}, [value]);

	return (
		<div>
			<TextInput
				path={path}
				value={value}
				placeholder='price = (volume * filamentMultiplier / 1000) + (time * 5)'
				onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
				style={{ width: '100%', fontFamily: 'monospace' }}
			/>
			<p style={{ display: 'block', marginTop: '0.5rem', color: preview.includes('Invalid formula') ? 'red' : 'green' }}>{preview}</p>
		</div>
	);
};

export default FormulaField;
