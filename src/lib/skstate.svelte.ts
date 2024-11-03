import { DEFAULT_SETTINGS, type SKSettings } from '$lib';
import { page } from '$app/stores';

class SKState {
	#settings: typeof DEFAULT_SETTINGS | undefined = $state();

	get settings() {
		return this.#settings ? this.#settings : DEFAULT_SETTINGS;
	}

	set settings(vals: Partial<typeof DEFAULT_SETTINGS>) {
		this.#settings = this.#settings
			? { ...this.#settings, ...vals }
			: { ...DEFAULT_SETTINGS, ...vals };
		localStorage.setItem('sk-settings', JSON.stringify(this.#settings));
	}

	get darkMode() {
		return this.#settings ? this.#settings.theme === 'dark' : DEFAULT_SETTINGS.theme === 'dark';
	}
}

export const skstate = new SKState();

page.subscribe((val) => {
	if (val.url) {
		skstate.settings = { currPath: val.url.pathname };
	}
});
