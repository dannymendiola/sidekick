import Quill from 'quill';
import { type Delta } from 'quill/core';

/**
 * Transforms a Quill delta into a stringified JSON
 *
 * @param delta
 * @returns the serialized delta as JSON
 */
const serializeDelta = (delta: Delta) => {
	return JSON.stringify(delta).replace(/\\/g, '\\\\');
};

/**
 * Adds the application's keybindings to a Quill instance
 *
 * @param quill Reference to the Quill instance
 */
const addKeybinds = (quill: Quill) => {};

type IconName = 'indent' | 'outdent';

export { type IconName, addKeybinds, serializeDelta };
