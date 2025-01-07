import { db } from '$lib/db';

const serializeProject = async () => {
	return JSON.stringify({
		moments: await db.moments.toArray(),
		// themes: await db.themes.toArray(),
		characters: await db.characters.toArray(),
		characterDynamics: await db.dynamics.toArray(),
		locations: await db.locations.toArray()
	});
};

export const saveProject = async (filename?: string) => {
	const data = await serializeProject();
	const blob = new Blob([data], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	if (filename) {
		filename = filename.endsWith('.json') ? filename : `${filename}.json`;
	}
	link.download = filename || 'SidekickProject.json';
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	URL.revokeObjectURL(url);
};

export const clearProject = async () => {
	await db.moments.clear();
	await db.characters.clear();
	await db.dynamics.clear();
	await db.locations.clear();
};
