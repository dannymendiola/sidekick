import { importProject } from '$lib';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
	const formData = await request.formData();
	const file = formData.get('file') as File;

	await importProject(file);

	return new Response(JSON.stringify({}));
};
