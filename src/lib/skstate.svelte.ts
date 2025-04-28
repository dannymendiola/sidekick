import { prefersReducedMotion } from 'svelte/motion';
import { formatBytes } from '$lib/utils';
import { browser } from '$app/environment';

const DEFAULT_SETTINGS: SKSettings = {
	theme: 'dark',
	currPath: '/welcome',
	currProj: undefined,
	displayMode: 'expanded'
};

interface SKSettings {
	theme: 'dark' | 'light';
	currPath: string;
	currProj?: string;
	displayMode: 'condensed' | 'expanded';
}

class SKState {
	#settings: typeof DEFAULT_SETTINGS | undefined = $state();
	prefersReducedMotion = $derived(prefersReducedMotion.current);
	projectID = $derived(this.#settings?.currProj);

	constructor() {
		if (browser) {
			const storedSettings = localStorage.getItem('sk-settings');
			if (storedSettings) {
				this.#settings = { ...DEFAULT_SETTINGS, ...JSON.parse(storedSettings) };
			} else {
				this.#settings = DEFAULT_SETTINGS;
			}
		}
	}

	get settings() {
		return this.#settings ? this.#settings : DEFAULT_SETTINGS;
	}

	updateSettings(vals: Partial<typeof DEFAULT_SETTINGS>) {
		this.#settings = this.#settings
			? { ...this.#settings, ...vals }
			: { ...DEFAULT_SETTINGS, ...vals };
		localStorage.setItem('sk-settings', JSON.stringify(this.#settings));
	}

	get darkMode() {
		return this.#settings ? this.#settings.theme === 'dark' : DEFAULT_SETTINGS.theme === 'dark';
	}

	get displayMode() {
		return this.#settings ? this.#settings.displayMode : DEFAULT_SETTINGS.displayMode;
	}

	get touchscreen() {
		return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	}

	async getUsage() {
		const quota = await navigator.storage.estimate();
		return `${formatBytes(quota.usage || 0)} / ${formatBytes(quota.quota || 0)} (${((quota.usage || 0) / (quota.quota || 0)).toFixed(1)}%)`;
	}
}

export const skstate = new SKState();
