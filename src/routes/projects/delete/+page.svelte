<script lang="ts">
	import { db, Project } from '$lib/db';
	import { QLEditor, skstate, vibrate } from '$lib';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { liveQuery, type Observable } from 'dexie';

	// let newProjName = $state('');
	// let newProjNameCleaned = $derived(newProjName?.replace('\n', ''));

	// const goToNewProj = async () => {
	// 	let p = await db.projects.add({ name: newProjNameCleaned });
	// 	skstate.updateSettings({ currProj: p });
	// 	goto('/projects');
	// };

	vibrate([20, 3, 3]);

	let project: Project | undefined = $state();

	const getProject = async () => {
		const proj = await db.projects.get(page.url.searchParams.get('id') || '');
		if (!proj) {
			goto('/projects');
		}
		project = proj;
		return proj;
	};

	let qNumSections: Observable<number> | undefined = $state();
	$effect(() => {
		qNumSections = liveQuery(() => db.sections.where({ project: project?.id || '' }).count());
	});

	let qNumChars: Observable<number> | undefined = $state();
	$effect(() => {
		qNumChars = liveQuery(() => db.characters.where({ project: project?.id || '' }).count());
	});

	let qNumDynamics: Observable<number> | undefined = $state();
	$effect(() => {
		qNumDynamics = liveQuery(() => db.dynamics.where({ project: project?.id || '' }).count());
	});

	let qNumLocations: Observable<number> | undefined = $state();
	$effect(() => {
		qNumLocations = liveQuery(() => db.locations.where({ project: project?.id || '' }).count());
	});

	const numSections = $derived($qNumSections || 0);
	const numChars = $derived($qNumChars || 0);
	const numDynamics = $derived($qNumDynamics || 0);
	const numLocations = $derived($qNumLocations || 0);
	const emptyProject = $derived(numSections + numChars + numDynamics + numLocations === 0);
</script>

<div class="sk-content mt-[10vh] md:mt-[30vh]">
	{#await getProject() then project}
		<h1 class="mb-4 font-title text-3xl font-bold text-robin-700 dark:text-robin-600">
			Delete Project
		</h1>
		<h2 class="mb-4 text-xl">
			Are you sure you want to delete
			<span class="font-semibold dark:text-robin-600">
				{project?.name?.trim() || 'untitled project'}
			</span>?
		</h2>
		{#if !emptyProject}
			<div class="font-semibold">
				<p>This action will delete:</p>
				<ul class="mb-4 list-inside list-disc [&>li]:ml-4">
					{#if (numSections || 0) > 0}
						<li>
							{numSections} outline section{#if numSections > 1}s{/if}
						</li>
					{/if}
					{#if numChars > 0}
						<li>
							{numChars} character{#if numChars > 1}s{/if}
						</li>
					{/if}
					{#if numDynamics > 0}
						<li>
							{numDynamics} character dynamic{#if numDynamics > 1}s{/if}
						</li>
					{/if}
					{#if numLocations > 0}
						<li>
							{numLocations} location{#if numLocations > 1}s{/if}
						</li>
					{/if}
				</ul>
			</div>
		{/if}
		<div class="mt-4 flex w-full justify-end gap-4">
			<a
				class="rounded-xl border border-donkey-300 bg-donkey-200 p-2 text-sm uppercase drop-shadow-lg hover:bg-donkey-300 dark:border-donkey-700 dark:bg-donkey-800 dark:hover:bg-donkey-500 disabled:hover:dark:bg-donkey-800"
				aria-label="Delete"
				href="/projects"
			>
				Cancel
			</a>
			<button
				class="rounded-xl border border-robin-300 bg-robin-200 p-2 text-sm font-semibold uppercase drop-shadow-lg hover:bg-robin-400 dark:border-robin-700 dark:bg-robin-800 dark:hover:bg-robin-500"
				aria-label="Delete"
				onclick={async () => {
					vibrate([20, 3, 3]);
					const sections = (await db.sections.where({ project: project?.id }).toArray()).map(
						(s) => s.id
					);
					await db.sections.bulkDelete(sections);
					const characters = (await db.characters.where({ project: project?.id }).toArray()).map(
						(c) => c.id
					);
					await db.characters.bulkDelete(characters);
					const dynamics = (await db.dynamics.where({ project: project?.id }).toArray()).map(
						(d) => d.id
					);
					await db.dynamics.bulkDelete(dynamics);
					const locations = (await db.locations.where({ project: project?.id }).toArray()).map(
						(l) => l.id
					);
					await db.locations.bulkDelete(locations);
					await db.projects.delete(project?.id || '');
					skstate.updateSettings({
						currProj: project?.id === skstate.projectID ? undefined : skstate.projectID
					});
					goto('/projects');
				}}
			>
				Delete
			</button>
		</div>
	{/await}
</div>
