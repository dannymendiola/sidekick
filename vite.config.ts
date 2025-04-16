import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
// import { SvelteKitPWA } from '@vite-pwa/sveltekit';

export default defineConfig({
	plugins: [
		sveltekit()
		// SvelteKitPWA({
		// 	srcDir: 'src',
		// 	filename: 'sw.ts'
		// })
	],

	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		environment: 'jsdom',
		setupFiles: ['./src/lib/db/test-setup.ts']
	}
});
