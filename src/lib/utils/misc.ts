export const vibrate = (ms: number | number[] = 1) => {
	if ('vibrate' in navigator) navigator.vibrate(ms);
};
