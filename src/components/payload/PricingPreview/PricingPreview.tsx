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
			const result = evaluate(value, { volume: 100, time: 3600, filamentMultiplier: 1.0 });

			if (result < 0) {
				setPreview(`Invalid formula: Preview (100cm³ volume, 1h time, filament multipler 1.0): £${(result / 100).toFixed(2)}`);
			}
			if (result === Infinity || isNaN(result)) {
				setPreview('Invalid formula');
				return;
			}
			setPreview(`Preview (100cm³ volume, 1h time, 1.0 filament multiplier): £${(result / 100).toFixed(2)}`);
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
