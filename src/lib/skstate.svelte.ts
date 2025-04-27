import { prefersReducedMotion } from 'svelte/motion';
import { formatBytes } from '$lib/utils';
import { browser } from '$app/environment';

const DEFAULT_SETTINGS: SKSettings = {
	theme: 'dark',
	currPath: '/welcome',
	currProj: undefined,
	displayMode: 'view'
};

interface SKSettings {
	theme: 'dark' | 'light';
	currPath: string;
	currProj?: string;
	displayMode: 'view' | 'edit';
}

class SKState {
	#settings: typeof DEFAULT_SETTINGS | undefined = $state();
	quillInit = $state(false);
	showSaveLoad = $state(false);
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

	get viewMode() {
		return this.#settings ? this.#settings.displayMode : DEFAULT_SETTINGS.displayMode;
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
		return this.#settings ? this.#settings.theme === 'dark' : true;
	}

	get touchscreen() {
		return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	}

	async getUsage() {
		const quota = await navigator.storage.estimate();
		// let usage = quota.usage;
		// usage = usage ? usage - 49147 : 0;
		return `${formatBytes(quota.usage || 0)} / ${formatBytes(quota.quota || 0)} (${((quota.usage || 0) / (quota.quota || 0)).toFixed(1)}%)`;
	}
}

export const skstate = new SKState();
