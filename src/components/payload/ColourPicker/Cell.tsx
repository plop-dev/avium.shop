import React from 'react';

interface ColourPickerCellProps {
	cellData?: string;
}

const ColourPickerCell: React.FC<ColourPickerCellProps> = ({ cellData }) => {
	if (!cellData) return <span className='text-gray-400'>No color</span>;

	return (
		<div className='flex items-center gap-2'>
			<div className='w-4 h-4 rounded border border-gray-300 flex-shrink-0' style={{ backgroundColor: cellData }} />
			<span className='text-sm font-medium font-mono'>{cellData}</span>
		</div>
	);
};

export default ColourPickerCell;
