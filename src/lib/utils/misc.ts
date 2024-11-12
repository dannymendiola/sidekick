export const vibrate = (ms: number | number[] = 1) => {
	if ('vibrate' in navigator) navigator.vibrate(ms);
};

export const capitalize = (str: string) =>
	str
		.replace(/_|-/g, ' ')
		.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substring(1).toLowerCase());
