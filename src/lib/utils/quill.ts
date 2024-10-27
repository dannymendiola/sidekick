import Quill from 'quill';
import { type Delta } from 'quill/core';

/**
 * Transforms a Quill delta into a stringified JSON
 *
 * @param delta
 * @returns the serialized delta as JSON
 */
export const serializeDelta = (delta: Delta) => {
	return JSON.stringify(delta).replace(/\\/g, '\\\\');
};

/**
 * Adds the application's keybindings to a Quill instance
 *
 * @param quill Reference to the Quill instance
 */
export const addKeybinds = (quill: Quill) => {
	quill.keyboard.addBinding({
		key: ']',
		shortKey: true,
		handler: () => {
			quill.format('indent', '+1');
		}
	});
	quill.keyboard.addBinding({
		key: '[',
		shortKey: true,
		handler: () => {
			quill.format('indent', '-1');
		}
	});
	quill.keyboard.addBinding({
		key: 'l',
		shortKey: true,
		handler: () => {
			quill.format('align', false);
		}
	});
	quill.keyboard.addBinding({
		key: 'e',
		shortKey: true,
		handler: () => {
			quill.format('align', 'center');
		}
	});
	quill.keyboard.addBinding({
		key: 'r',
		shortKey: true,
		handler: () => {
			quill.format('align', 'right');
		}
	});
	quill.keyboard.addBinding({
		key: 'j',
		shortKey: true,
		handler: () => {
			quill.format('align', 'justify');
		}
	});
};
