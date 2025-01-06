import { db } from '$lib/db';

const serializeProject = async () => {
	console.log(JSON.stringify(await db.moments.toArray()));
};

export const saveProject = async () => {
	await serializeProject();
};
