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
		filename = filename.endsWith('.sidekick') ? filename : `${filename}.sidekick`;
	}
	link.download = filename || 'project.json';
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

export const loadProject = async (
	event: Event & {
		currentTarget: EventTarget & HTMLInputElement;
	}
) => {
	const file = event.currentTarget.files && event.currentTarget.files[0];

	if (!file) return;

	if (!file.name.endsWith('.sidekick') && !file.name.endsWith('.json')) {
		alert('Please select a valid Sidekick project file.');
		return;
	}

	const reader = new FileReader();

	reader.onload = async (e) => {
		try {
			const data = JSON.parse(e.target?.result as string);

			console.log(data);

			await clearProject();

			await db.moments.bulkAdd(data.moments);
			// await db.themes.bulkAdd(data.themes);
			await db.characters.bulkAdd(data.characters);
			await db.dynamics.bulkAdd(data.characterDynamics);
			await db.locations.bulkAdd(data.locations);
			console.log('Project loaded successfully.');
		} catch (err) {
			console.error(err);
			alert('Error loading project file.');
		}
	};

	reader.readAsText(file);
};
