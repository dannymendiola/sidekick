import type { Config } from 'tailwindcss';

import defaultTheme from 'tailwindcss/defaultTheme';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				title: ['Castoro', ...defaultTheme.fontFamily.serif],
				sans: ['Noto Sans', ...defaultTheme.fontFamily.sans]
			},
			colors: {
				// https://coolors.co/ffe900-d62828-28536b-b4c1c9-18181b
				donkey: {
					50: '#f5f6f6',
					100: '#e5e7e8',
					200: '#ced1d3',
					300: '#acb1b4',
					400: '#82898e',
					500: '#676e73',
					600: '#4b4f53',
					700: '#3a3c3f',
					800: '#2a2c2f',
					900: '#161619',
					950: '#060709'
				},

				genie: {
					50: '#eff9fc',
					100: '#d7eff6',
					200: '#b4e0ed',
					300: '#80cae0',
					400: '#45a9cb',
					500: '#2a8db0',
					600: '#257295',
					700: '#245d7a',
					800: '#28536b',
					900: '#234256',
					950: '#122a3a'
				},
				robin: {
					50: '#fef2f2',
					100: '#fde3e3',
					200: '#fdcbcb',
					300: '#faa7a7',
					400: '#f57474',
					500: '#eb4848',
					600: '#d62828',
					700: '#b52020',
					800: '#961e1e',
					900: '#7c2020',
					950: '#430c0c'
				},
				smithers: {
					50: '#fdffe7',
					100: '#f9ffc1',
					200: '#f8ff86',
					300: '#fcff41',
					400: '#fff70d',
					500: '#ffe900',
					600: '#d1ad00',
					700: '#a67d02',
					800: '#89610a',
					900: '#744f0f',
					950: '#442a04'
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
