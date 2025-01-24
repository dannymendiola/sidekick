import { DEFAULT_SETTINGS } from '$lib';

class SKState {
	#settings: typeof DEFAULT_SETTINGS | undefined = $state();
	quillInit = $state(false);
	showSaveLoad = $state(false);

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

	get touchscreen() {
		return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
	}
}

export const skstate = new SKState();
