/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			transition: {
				width: 'width',
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)',
			},
			colors: {
				background: 'oklch(var(--background))',
				foreground: 'oklch(var(--foreground))',
				card: {
					DEFAULT: 'oklch(var(--card))',
					foreground: 'oklch(var(--card-foreground))',
				},
				popover: {
					DEFAULT: 'oklch(var(--popover))',
					foreground: 'oklch(var(--popover-foreground))',
				},
				primary: {
					DEFAULT: 'oklch(var(--primary))',
					foreground: 'oklch(var(--primary-foreground))',
				},
				secondary: {
					DEFAULT: 'oklch(var(--secondary))',
					foreground: 'oklch(var(--secondary-foreground))',
				},
				muted: {
					DEFAULT: 'oklch(var(--muted))',
					foreground: 'oklch(var(--muted-foreground))',
				},
				accent: {
					DEFAULT: 'oklch(var(--accent))',
					foreground: 'oklch(var(--accent-foreground))',
				},
				destructive: {
					DEFAULT: 'oklch(var(--destructive))',
					foreground: 'oklch(var(--destructive-foreground))',
				},
				success: {
					DEFAULT: 'oklch(var(--success))',
					foreground: 'oklch(var(--success-foreground))',
				},
				border: 'oklch(var(--border))',
				input: 'oklch(var(--input))',
				ring: 'oklch(var(--ring))',
				chart: {
					1: 'oklch(var(--chart-1))',
					2: 'oklch(var(--chart-2))',
					3: 'oklch(var(--chart-3))',
					4: 'oklch(var(--chart-4))',
					5: 'oklch(var(--chart-5))',
				},
				sidebar: {
					DEFAULT: 'oklch(var(--background))',
					foreground: 'oklch(var(--foreground))',
					primary: 'oklch(var(--primary))',
					'primary-foreground': 'oklch(var(--primary-foreground))',
					accent: 'oklch(var(--accent))',
					'accent-foreground': 'oklch(var(--accent-foreground))',
					border: 'oklch(var(--border))',
					ring: 'oklch(var(--ring))',
				},
			},
		},
	},
	plugins: [require('tailwindcss-animate'), require('tailwindcss-animated')],
};
