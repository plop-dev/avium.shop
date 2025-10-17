'use client';

import React, { useState, useEffect, ChangeEvent } from 'react';
import { useField, TextInput, FieldLabel, toast } from '@payloadcms/ui';
import { evaluate } from 'mathjs';

const FormulaField = ({ field: { label, required = false }, path }: { field: { label: string; required?: boolean }; path: string }) => {
	const { value, setValue, showError, errorMessage } = useField<string>({ path });
	const [preview, setPreview] = useState<string>('');

	useEffect(() => {
		try {
			// Example inputs for preview
			const result = evaluate(value, { weight: 12, time: 3600, cost: 0.2 });

			if (result < 0) {
				setPreview(`Invalid formula: Preview (12 grams weight, £0.2 cost, 1h time): £${(result / 100).toFixed(2)}`);
			}
			if (result === Infinity || isNaN(result)) {
				setPreview('Invalid formula');
				return;
			}
			setPreview(`Preview (12 grams weight, £0.2 cost, 1h time): £${(result / 100).toFixed(2)}`);
		} catch (err) {
			setPreview('Invalid formula');
		}
	}, [value]);

	return (
		<div>
			<TextInput
				path={path}
				value={value}
				placeholder='price = (weight * cost / 1000) + (time * 5)'
				onChange={(e: ChangeEvent<HTMLInputElement>) => setValue(e.target.value)}
				style={{ width: '100%', fontFamily: 'monospace' }}
			/>
			<p style={{ display: 'block', marginTop: '0.5rem', color: preview.includes('Invalid formula') ? 'red' : 'green' }}>{preview}</p>
		</div>
	);
};

export default FormulaField;
