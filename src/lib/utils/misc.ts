import { v7 } from 'uuid';

/**
 * Generates a UUID v7
 */
export const uuid = v7;

export const vibrate = (ms: number | number[] = 1) => {
	if ('vibrate' in navigator) navigator.vibrate(ms);
};
