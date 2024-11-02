export const DEFAULT_SETTINGS: SKSettings = {
	theme: 'dark',
	currPath: '/'
};

export interface SKSettings {
	theme: 'dark' | 'light';
	currPath: string;
}
