import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				// https://coolors.co/ffe900-d62828-28536b-b4c1c9-18181b
				donkey: {
					50: '#f6f7f8',
					100: '#eaedef',
					200: '#d9e0e4',
					300: '#b4c1c9',
					400: '#a0b0ba',
					500: '#899aa8',
					600: '#778799',
					700: '#6b788a',
					800: '#5a6473',
					900: '#4b535d',
					950: '#30353b'
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
			}
		}
	},

	plugins: []
} as Config;
