import { v7 } from 'uuid';
import type { Delta } from 'quill/core';

export const uuid = v7;

export const serializeDelta = (delta: Delta) => {
	return JSON.stringify(delta).replace(/\\/g, '\\\\');
};
