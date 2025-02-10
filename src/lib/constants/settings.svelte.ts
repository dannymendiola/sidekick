export const DEFAULT_SETTINGS: SKSettings = {
	theme: 'dark',
	currPath: '/welcome'
};

export interface SKSettings {
	theme: 'dark' | 'light';
	currPath: string;
}
