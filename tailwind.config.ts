import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				donkey: {
					50: '#e5e6e6',
					100: '#d6d7d7',
					200: '#c0c1c1',
					300: '#9fa1a0',
					400: '#777978',
					500: '#5c5e5d',
					600: '#4c4e4d',
					700: '#3e403f',
					800: '#343636',
					900: '#2c2d2d',
					950: '#1a1b1b'
				},
				smithers: {
					50: '#fffee7',
					100: '#ffffc1',
					200: '#fffa86',
					300: '#ffef41',
					400: '#ffdf0d',
					500: '#facc00',
					600: '#d19800',
					700: '#a66d02',
					800: '#89550a',
					900: '#74450f',
					950: '#442404'
				},
				robin: {
					50: '#fef2f2',
					100: '#fee2e2',
					200: '#fecacb',
					300: '#fca5a6',
					400: '#f97072',
					500: '#ee2e31',
					600: '#dd2528',
					700: '#ba1b1d',
					800: '#9a1a1c',
					900: '#7f1d1f',
					950: '#450a0b'
				}
			}
		}
	},

	plugins: []
} as Config;
