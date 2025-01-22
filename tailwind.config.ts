import type { Config } from 'tailwindcss';

import defaultTheme from 'tailwindcss/defaultTheme';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				title: ['Noto Serif', ...defaultTheme.fontFamily.serif],
				serif: ['Noto Serif', ...defaultTheme.fontFamily.serif],
				sans: ['Noto Sans', ...defaultTheme.fontFamily.sans],
				brand: ['Shrikhand', 'Noto Serif', ...defaultTheme.fontFamily.serif]
			},
			colors: {
				// https://coolors.co/ffe900-d62828-28536b-b4c1c9-18181b
				donkey: {
					'50': '#f2e8d6',
					'100': '#e9decb',
					'200': '#e0d4c0',
					'300': '#b1a89a',
					'400': '#827b73',
					'500': '#6a635b',
					'600': '#514b43',
					'700': '#444038',
					'800': '#312d24',
					'900': '#1e180f',
					'950': '#130c02'
				},
				genie: {
					'50': '#dafffe',
					'100': '#b9eeec',
					'200': '#a1e1df',
					'300': '#98e3e1',
					'400': '#6cb6b3',
					'500': '#5ea19f',
					'600': '#417b7b',
					'700': '#326766',
					'800': '#275958',
					'900': '#1f4746',
					'950': '#0e3333'
				},
				robin: {
					50: '#ffcecc',
					100: '#f8aca8',
					200: '#e78984',
					300: '#d5655f',
					400: '#c32f27',
					500: '#b12b23',
					600: '#a12720',
					700: '#92231d',
					800: '#85201a',
					900: '#791d18',
					950: '#430c0c'
				},
				smithers: {
					50: '#ffe8b7',
					100: '#ffdf98',
					200: '#ffd579',
					300: '#fdc243',
					400: '#f7b119',
					500: '#eba819',
					600: '#dc9d17',
					700: '#c88f15',
					800: '#ad7f1d',
					900: '#9a6f12',
					950: '#442a04'
				},
				wazowski: {
					'50': '#e4f7c9',
					'100': '#d3f1aa',
					'200': '#A7C679',
					'300': '#90B25E',
					'400': '#80A24D',
					'500': '#769645',
					'600': '#6C883E',
					'700': '#5F7639',
					'800': '#4B5D2D',
					'900': '#374420',
					'950': '#212B11'
				},
				donnie: {
					'50': '#deb4e9',
					'100': '#c79cd4',
					'200': '#b88ac6',
					'300': '#a877b8',
					'400': '#9f69b1',
					'500': '#955aa9',
					'600': '#875298',
					'700': '#784986',
					'800': '#663f71',
					'900': '#4e3255',
					'950': '#332237'
				}
			},
			screens: {
				short: { raw: '(max-height: 720px)' },
				midskinny: { raw: '(max-width: 624px)' },
				skinny: { raw: '(max-width: 360px)' }
			}
		}
	},

	plugins: []
} as Config;
