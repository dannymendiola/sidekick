import { goto } from '$app/navigation';
import { Character, db, Dynamic, Section, Location } from '$lib/db';
import { skstate } from '$lib/skstate.svelte';
import { formatDate } from './misc';

interface ProjectData {
	projectID: string;
	dbVersion: number;
	creationDate: number;
	exportDate: number;
	projectName: string;
	sections: Section[];
	characters: Character[];
	characterDynamics: Dynamic[];
	locations: Location[];
}

const serializeProject = async (projID: string) => {
	const project = await db.projects.get(projID);
	if (!project) {
		return JSON.stringify({
			error: 'Project not found'
		});
	}

	let exportData: ProjectData = {
		projectID: projID,
		dbVersion: db.verno,
		creationDate: project.createdAt!,
		exportDate: Date.now(),
		projectName: project.name || '',
		sections: await db.sections.where({ project: projID }).toArray(),
		characters: await db.characters.where({ project: projID }).toArray(),
		characterDynamics: await db.dynamics.where({ project: projID }).toArray(),
		locations: await db.locations.where({ project: projID }).toArray()
	};

	return JSON.stringify(exportData);
};

export const isValidProjectData = (data: any): data is ProjectData => {
	if (!data || typeof data !== 'object') return false;
	if (!data.hasOwnProperty('projectID') || typeof data.projectID !== 'string') return false;
	const importedProjID = data.projectID;
	if (!data.hasOwnProperty('dbVersion') || typeof data.dbVersion !== 'number') return false;
	if (!data.hasOwnProperty('projectName') || typeof data.projectName !== 'string') return false;
	if (!data.hasOwnProperty('exportDate') || typeof data.exportDate !== 'number') return false;
	if (!data.hasOwnProperty('creationDate') || typeof data.creationDate !== 'number') return false;

	if (!data.hasOwnProperty('sections') || !Array.isArray(data.sections)) return false;
	const sections = data.sections as any[];
	if (!sections.every((section) => section.hasOwnProperty('id'))) return false;
	if (!sections.every((section) => section.hasOwnProperty('project'))) return false;
	if (!sections.every((section) => section.project === importedProjID)) return false;

	if (!data.hasOwnProperty('characters') || !Array.isArray(data.characters)) return false;
	const characters = data.characters as any[];
	if (!characters.every((character) => character.hasOwnProperty('id'))) return false;
	if (!characters.every((character) => character.hasOwnProperty('project'))) return false;
	if (!characters.every((character) => character.project === importedProjID)) return false;

	if (!data.hasOwnProperty('characterDynamics') || !Array.isArray(data.characterDynamics))
		return false;
	const dynamics = data.characterDynamics as any[];
	if (!dynamics.every((dynamic) => dynamic.hasOwnProperty('id'))) return false;
	if (!dynamics.every((dynamic) => dynamic.hasOwnProperty('project'))) return false;
	if (!dynamics.every((dynamic) => dynamic.project === importedProjID)) return false;

	if (!data.hasOwnProperty('locations') || !Array.isArray(data.locations)) return false;
	const locations = data.locations as any[];
	if (!locations.every((location) => location.hasOwnProperty('id'))) return false;
	if (!locations.every((location) => location.hasOwnProperty('project'))) return false;
	if (!locations.every((location) => location.project === importedProjID)) return false;

	return true;
};

export const exportProject = async (projID: string, filename?: string) => {
	const data = await serializeProject(projID);
	const blob = new Blob([data], { type: 'application/octet-stream' });
	// if ()

	// filename = filename && filename.endsWith('.sidekick') ? filename : `${filename || 'Untitled'}.sidekick`
	if (filename) {
		filename = filename.endsWith('.sidekick') ? filename : `${filename}.sidekick`;
	}
	filename = filename || `${(await db.projects.get(projID))?.name || 'Untitled'}.sidekick`;

	const file = new File([blob], filename, { type: 'application/octet-stream' });

	if (navigator.canShare && navigator.canShare({ files: [file] })) {
		console.log('Share');
		await navigator.share({
			files: [file]
		});
	} else {
		console.log('Download');
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = filename;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	}
};

export const clearProject = async (projID: string) => {
	await db.projects.delete(projID);
	await db.sections.where({ project: projID }).delete();
	await db.characters.where({ project: projID }).delete();
	await db.dynamics.where({ project: projID }).delete();
	await db.locations.where({ project: projID }).delete();
};

export const importProject = async (file: File | null) => {
	if (!file) return;

	const reader = new FileReader();

	reader.onload = async (e) => {
		try {
			const data = JSON.parse(e.target?.result as string);

			console.log(data);

			if (!isValidProjectData(data)) {
				alert('Unfortunately, the selected file is invalid or corrupted, and cannot be imported.');
				return;
			}

			if (data.dbVersion !== db.verno) {
				const ok = confirm(
					'Project file version does not match the current database version. Importing may cause data loss or other problems. Continue?'
				);
				if (!ok) {
					return;
				}
			}

			const existingProjIDs = await db.projects.toArray().then((p) => p.map((proj) => proj.id));
			if (existingProjIDs.includes(data.projectID)) {
				const existingProj = (await db.projects.get(data.projectID))!;
				const importedProjAge = {
					date: formatDate(data.exportDate, 'medium'),
					time: formatDate(data.exportDate, undefined, 'short')
				};
				const ok = confirm(
					`Importing this project will overwrite ${existingProj.name ? `the existing project "${existingProj.name}"` : 'an untitled project'}.\n\nThe project file you're IMPORTING was created on ${importedProjAge.date} at ${importedProjAge.time}.\n\nDo you want to continue?`
				);
				if (!ok) {
					return;
				}
				await clearProject(data.projectID);
			}

			await db.projects.add({
				name: data.projectName,
				id: data.projectID,
				createdAt: data.creationDate
			});

			await db.sections.bulkAdd(data.sections);
			await db.characters.bulkAdd(data.characters);
			await db.dynamics.bulkAdd(data.characterDynamics);
			await db.locations.bulkAdd(data.locations);

			skstate.updateSettings({ currProj: data.projectID });
			goto('/all/sections');
		} catch (err) {
			console.error(err);
			alert('Error loading project file.');
		}
	};

	reader.readAsText(file);
};
