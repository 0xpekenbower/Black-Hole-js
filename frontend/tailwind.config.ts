import type { Config } from 'tailwindcss'

export default {
	darkMode: 'class',
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				// Theme colors
				primary: {
					1: 'var(--primary-1)',
					2: 'var(--primary-2)',
					3: 'var(--primary-3)',
				},
				back: {
					1: 'var(--back-1)',
					2: 'var(--back-2)',
					3: 'var(--back-3)',
				},
				border: {
					1: 'var(--border-1)',
					2: 'var(--border-2)',
					3: 'var(--border-3)',
				},
				success: {
					1: 'var(--success-1)',
					2: 'var(--success-2)',
					3: 'var(--success-3)',
				},
				error: {
					1: 'var(--error-1)',
					2: 'var(--error-2)',
					3: 'var(--error-3)',
				},
				warning: {
					1: 'var(--warning-1)',
					2: 'var(--warning-2)',
					3: 'var(--warning-3)',
				},
			},
			textColor: {
				'theme-front': 'var(--frontground)',
			},
			backgroundColor: {
				'theme-back': 'var(--background)',
			},
		},
	},
	plugins: [],
} satisfies Config 