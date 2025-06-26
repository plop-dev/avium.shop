'use client';

import { useState, useEffect } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThemeToggle() {
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		// Check for saved theme preference or default to light mode
		const savedTheme = localStorage.getItem('theme');
		const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

		if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
			setIsDark(true);
			document.documentElement.classList.add('dark');
		}
	}, []);

	const toggleTheme = () => {
		const newTheme = !isDark;
		setIsDark(newTheme);

		if (newTheme) {
			document.documentElement.classList.add('dark');
			localStorage.setItem('theme', 'dark');
		} else {
			document.documentElement.classList.remove('dark');
			localStorage.setItem('theme', 'light');
		}
	};

	return (
		<Button variant='outline' size='icon' onClick={toggleTheme} className='relative overflow-hidden transition-all duration-300 '>
			<Sun className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 ${isDark ? 'rotate-90 scale-0' : 'rotate-0 scale-100'}`} />
			<Moon
				className={`absolute h-[1.2rem] w-[1.2rem] transition-all duration-300 ${
					isDark ? 'rotate-0 scale-100' : '-rotate-90 scale-0'
				}`}
			/>
			<span className='sr-only'>Toggle theme</span>
		</Button>
	);
}
