import { DEFAULT_SETTINGS, type SKSettings } from '$lib';
import { page } from '$app/stores';

class SKState {
	#settings = $state(DEFAULT_SETTINGS);

	get settings() {
		return this.#settings;
	}

	set settings(vals: Partial<typeof DEFAULT_SETTINGS>) {
		this.#settings = { ...this.#settings, ...vals };
		localStorage.setItem('sk-settings', JSON.stringify(this.#settings));
	}

	get darkMode() {
		return this.#settings.theme === 'dark';
	}
}

export const skstate = new SKState();
