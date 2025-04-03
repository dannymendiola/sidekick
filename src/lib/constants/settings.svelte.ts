export const DEFAULT_SETTINGS: SKSettings = {
	theme: 'dark',
	currPath: '/welcome',
	currProj: undefined
};

export interface SKSettings {
	theme: 'dark' | 'light';
	currPath: string;
	currProj?: string;
}
