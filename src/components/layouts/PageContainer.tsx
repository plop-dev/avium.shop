import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

export default function PageContainer({
	children,
	scrollable = true,
	className,
}: {
	children: React.ReactNode;
	scrollable?: boolean;
	className?: string;
}) {
	return (
		<>
			{scrollable ? (
				<ScrollArea className={cn('h-[100vh-4rem]', className)}>
					<div className='flex flex-1'>{children}</div>
				</ScrollArea>
			) : (
				<div className={cn('flex flex-1', className)}>{children}</div>
			)}
		</>
	);
}
