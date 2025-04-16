import adapter from '@sveltejs/adapter-netlify';
// import pkg from './package.json' with { type: 'json' };
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';

const pkgjson = fileURLToPath(new URL('./package.json', import.meta.url));
const pkg = JSON.parse(readFileSync(pkgjson, 'utf8'));

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({
			edge: false,
			split: false
		}),

		version: {
			name: pkg.version
		}

		// files: {
		// 	serviceWorker: 'src/sw.ts'
		// }
	}
};

export default config;
