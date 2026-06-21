'use client';

import { useTheme } from 'next-themes';
import { Toaster, ToasterProps } from 'sonner';

export default function CustomToaster() {
	const { resolvedTheme } = useTheme();

	return <Toaster richColors duration={5000} theme={resolvedTheme as ToasterProps['theme']} position='top-right'></Toaster>;
}
