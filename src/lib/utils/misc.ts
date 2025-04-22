export const vibrate = (ms: number | number[] = 8) => {
	if ('vibrate' in navigator) navigator.vibrate(ms);
};

export const capitalize = (str: string) =>
	str
		.replace(/_|-/g, ' ')
		.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substring(1).toLowerCase());

type DateStyle = Intl.DateTimeFormatOptions['dateStyle'];
type TimeStyle = Intl.DateTimeFormatOptions['timeStyle'];

export const formatDate = (
	date: string | number = Date.now(),
	dateStyle: DateStyle = undefined,
	timeStyle: TimeStyle = undefined,
	timeZone: string = Intl.DateTimeFormat().resolvedOptions().timeZone,
	locales: string | string[] = navigator.language
) => {
	const formatter = new Intl.DateTimeFormat(locales, { dateStyle, timeStyle, timeZone });

	return formatter.format(new Date(date));
};

export const formatBytes = (bytes: number) => {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	const converted = bytes / Math.pow(k, i);
	return `${converted.toFixed(2)} ${sizes[i]}`;
};
