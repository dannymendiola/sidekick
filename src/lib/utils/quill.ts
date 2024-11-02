import Quill from 'quill';
import { type Delta } from 'quill/core';

/**
 * Transforms a Quill delta into a stringified JSON
 *
 * @param delta
 * @returns the serialized delta as JSON
 */
const serializeDelta = (delta: Delta | undefined) => {
	return delta ? JSON.stringify(delta).replace(/\\/g, '\\\\') : '';
};

/**
 * Adds the application's keybindings to a Quill instance
 *
 * @param quill Reference to the Quill instance
 * @returns A cleanup function for created event listener
 */
const addKeybinds = (quill: Quill) => {
	quill.keyboard.addBinding({
		key: ']',
		shortKey: true,
		handler: () => {
			quill.format('indent', '+1');
		}
	});

	// This is necessary to override the default keybind for CTRL+[ in Chrome, and it only kind of works, thanks Google
	const keydown = (e: KeyboardEvent) => {
		if ((e.ctrlKey || e.metaKey) && e.key === '[') {
			e.preventDefault();
			quill.focus();
			quill.format('indent', '-1');
		}
	};

	document.addEventListener('keydown', keydown, true);

	return () => {
		document.removeEventListener('keydown', keydown, true);
	};
};

type IconName = 'indent' | 'outdent';

export { type IconName, addKeybinds, serializeDelta };
