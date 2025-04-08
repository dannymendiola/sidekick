<script lang="ts">
	import { db, skstate, QLEditor, formatDate, saveProject, loadProject } from '$lib';
	import { liveQuery } from 'dexie';
	import { quintOut } from 'svelte/easing';
	import { slide } from 'svelte/transition';

	const qCurrProj = liveQuery(() => db.projects.get(skstate.projectID || ''));
	let activeProject = $derived($qCurrProj);

	let projectName = $state('');

	const qAllProjects = liveQuery(() => db.projects.toArray());
	const allProjects = $derived($qAllProjects);

	let showManageProjects = $state(false);
</script>

<div class="sk-content">
	<h1 class="mb-6 flex justify-center text-robin-600 dark:text-smithers-600 md:mt-32">
		<div class="flex items-center gap-2">
			<img
				class="hidden size-48 md:block"
				src="/logo-square-sm.png"
				alt="A red oval with the word 'Sidekick' in yellow serif font"
			/>
			<p
				class="font-title text-3xl font-semibold text-robin-600 dark:text-smithers-500 md:text-donkey-600 md:dark:text-donkey-400"
			>
				Projects
			</p>
		</div>
	</h1>
	<div
		class="h-min rounded-lg border border-donkey-200 bg-donkey-100 p-4 dark:border-donkey-700 dark:bg-donkey-900 md:px-6 lg:px-12"
	>
		<div class="flex flex-col items-center justify-center md:flex-row md:justify-between">
			<hgroup class="hidden text-center md:block md:text-left">
				<h2 class="text-lg font-semibold">Create a new project</h2>
				<h3 class="text-sm text-donkey-400 dark:text-donkey-300">A fresh start</h3>
			</hgroup>
			<a
				class="flex h-min w-full justify-center gap-1 rounded-xl border border-donkey-300 bg-donkey-200 px-2 py-2 text-white hover:bg-donkey-300 dark:border-donkey-700 dark:bg-donkey-800 hover:dark:bg-donkey-600 md:w-min"
				href="/project/new"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
					/>
				</svg>

				<span class="hidden md:block">Create</span>
				<span class="md:hidden">Create a new project</span>
			</a>
		</div>
		<hr class="my-4 hidden border-donkey-200 dark:border-donkey-600 md:block" />

		<!-- Open an existing project section -->
		<div class="flex flex-col items-center justify-center md:flex-row md:justify-between">
			<hgroup class="hidden text-center md:block md:text-left">
				<h2 class="text-lg font-semibold">Manage existing projects</h2>
				<h3 class="text-sm text-donkey-400 dark:text-donkey-300">
					Open, rename, or delete
					{#if activeProject}
						<br />
						Current project:
						<span class="font-semibold dark:text-donkey-200">
							{activeProject.name || 'Untitled project'}
						</span>
					{/if}
				</h3>
				<!-- <h3 class="text-sm text-donkey-400 dark:text-donkey-300"></h3> -->
			</hgroup>
			<button
				class="mt-4 flex h-min w-full justify-center gap-1 rounded-xl border border-donkey-300 bg-donkey-200 px-2 py-2 text-white hover:bg-donkey-300 dark:border-donkey-700 dark:bg-donkey-800 hover:dark:bg-donkey-600 md:mt-0 md:w-min"
				onclick={() => (showManageProjects = !showManageProjects)}
			>
				<!-- <svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
					/>
				</svg> -->
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122"
					/>
				</svg>

				<span class="hidden md:block">Manage</span>
				<span class="md:hidden">Manage projects</span>
			</button>
		</div>

		{#if showManageProjects}
			<section
				class="max-h-[20vh] overflow-y-auto"
				transition:slide={{ duration: skstate.prefersReducedMotion ? 0 : 100, easing: quintOut }}
			>
				<div class="mt-2 flex w-full flex-col gap-1">
					{#each allProjects as project, i}
						<div class="flex rounded border border-donkey-200 p-1 dark:border-donkey-700">
							<!-- <h3 class="">{project.name || 'Untitled Project'}</h3> -->
							<div class="grow">
								<QLEditor
									id="proj-{i}"
									initText={project.name}
									inputMode="info"
									fieldID={project.id}
									fieldTable={db.projects}
								/>
							</div>
							asdf
						</div>
					{/each}
				</div>
			</section>
		{/if}

		<hr class="my-4 hidden border-donkey-200 dark:border-donkey-600 md:block" />

		<!-- Import a project from a file section -->
		<div class="flex flex-col items-center justify-center md:flex-row md:justify-between">
			<hgroup class="hidden text-center md:block md:text-left">
				<h2 class="text-lg font-semibold">Import a project from a file</h2>
				<h3 class="text-sm text-donkey-400 dark:text-donkey-300">
					Load a project from another Sidekick instance
				</h3>
			</hgroup>
			<button
				class="mt-4 flex h-min w-full justify-center gap-1 rounded-xl border border-donkey-300 bg-donkey-200 px-2 py-2 text-white hover:bg-donkey-300 dark:border-donkey-700 dark:bg-donkey-800 hover:dark:bg-donkey-600 md:mt-0 md:w-min"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m-6 3.75 3 3m0 0 3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75"
					/>
				</svg>

				<span class="hidden md:block">Import</span>
				<span class="md:hidden">Import a project</span>
			</button>
		</div>
		<hr class="my-4 hidden border-donkey-200 dark:border-donkey-600 md:block" />

		<!-- Export a project to a file section -->
		<div class="flex flex-col items-center justify-center md:flex-row md:justify-between">
			<hgroup class="hidden text-center md:block md:text-left">
				<h2 class="text-lg font-semibold">Export a project to file</h2>
				<h3 class="text-sm text-donkey-400 dark:text-donkey-300">
					For importing to another device
				</h3>
			</hgroup>
			<button
				class="mt-4 flex h-min w-full justify-center gap-1 rounded-xl border border-donkey-300 bg-donkey-200 px-2 py-2 text-white hover:bg-donkey-300 dark:border-donkey-700 dark:bg-donkey-800 hover:dark:bg-donkey-600 md:mt-0 md:w-min"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					stroke="currentColor"
					class="size-6"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m0-3-3-3m0 0-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75"
					/>
				</svg>

				<span class="hidden md:block">Export</span>
				<span class="md:hidden">Export a project</span>
			</button>
		</div>
	</div>
</div>

<svelte:head>
	<title>Projects</title>
</svelte:head>
