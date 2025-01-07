export const vibrate = (ms: number | number[] = 1) => {
	if ('vibrate' in navigator) navigator.vibrate(ms);
};

export const capitalize = (str: string) =>
	str
		.replace(/_|-/g, ' ')
		.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substring(1).toLowerCase());

type DateStyle = Intl.DateTimeFormatOptions['dateStyle'];
export const formatDate = (
	date: string = new Date().toISOString(),
	dateStyle: DateStyle = 'medium',
	locales = 'en'
) => {
	const formatter = new Intl.DateTimeFormat(locales, { dateStyle, timeZone: 'UTC' });

	return formatter.format(new Date(date));
};
