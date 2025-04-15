<script lang="ts">
	import { db, skstate, formatDate, saveProject, loadProject, SKInput } from '$lib';
	import { liveQuery } from 'dexie';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';
	import { fade, slide } from 'svelte/transition';

	const qCurrProj = liveQuery(() => db.projects.get(skstate.projectID || ''));
	let activeProject = $derived($qCurrProj);

	let projectName = $state('');

	const qAllProjects = liveQuery(() => db.projects.orderBy('openedAt').toArray());
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
				href="/projects/new"
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
		<div
			class="flex flex-col items-center justify-center md:flex-row md:justify-between {allProjects?.length ===
				0 && 'opacity-40'}"
		>
			<hgroup class="hidden text-center md:block md:text-left">
				<h2 class="text-lg font-semibold">Manage existing projects</h2>
				<h3 class="text-sm text-donkey-400 dark:text-donkey-300">
					Open, rename, or delete
					<br />
					{#if activeProject}
						Current project:
						<span class="font-semibold dark:text-donkey-200">
							{activeProject.name || 'Untitled project'}
						</span>
					{:else if allProjects?.length > 0}
						<p class="text-donkey-400 dark:text-donkey-300">No project selected</p>
					{:else}
						<p class="text-donkey-400 dark:text-donkey-300">No projects yet</p>
					{/if}
				</h3>
				<!-- <h3 class="text-sm text-donkey-400 dark:text-donkey-300"></h3> -->
			</hgroup>
			<button
				class="mt-4 flex h-min w-full justify-center gap-1 rounded-xl border border-donkey-300 px-2 py-2 disabled:hover:bg-donkey-200 dark:border-donkey-700 disabled:hover:dark:!bg-donkey-800 md:mt-0 md:w-min {showManageProjects
					? 'bg-donkey-300 dark:bg-donkey-600 '
					: 'bg-donkey-200 hover:bg-donkey-300 dark:bg-donkey-800 hover:dark:bg-donkey-600 '}"
				onclick={() => (showManageProjects = !showManageProjects)}
				disabled={allProjects?.length === 0}
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
						d="M6 6.878V6a2.25 2.25 0 0 1 2.25-2.25h7.5A2.25 2.25 0 0 1 18 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 0 0 4.5 9v.878m13.5-3A2.25 2.25 0 0 1 19.5 9v.878m0 0a2.246 2.246 0 0 0-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0 1 21 12v6a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18v-6c0-.98.626-1.813 1.5-2.122"
					/>
				</svg>

				<span class="hidden md:block">Manage</span>
				<span class="md:hidden">Manage projects</span>
			</button>
		</div>

		{#if showManageProjects}
			<div
				transition:slide={{ easing: quintOut, duration: skstate.prefersReducedMotion ? 0 : 100 }}
			>
				<p class="mt-4 text-sm text-donkey-400 dark:text-donkey-300 md:mt-0">
					Est. used space:
					<span class="font-semibold dark:text-donkey-200">
						{#await skstate.getUsage() then usage}
							{usage}
						{/await}
					</span>
				</p>
				<section class="my-4 max-h-[33vh] overflow-y-auto md:my-0 md:mt-2">
					<div class="flex w-full flex-col gap-1">
						{#each allProjects?.toReversed() as project (`project-${project.id}`)}
							<div
								animate:flip={{
									duration: skstate.prefersReducedMotion ? 0 : 200,
									easing: quintOut
								}}
								class="flex items-center rounded border border-donkey-200 p-1 dark:border-donkey-700 {project.id ===
								activeProject?.id
									? 'bg-donkey-200 dark:bg-donkey-800'
									: ''}"
							>
								<div class="grow">
									<SKInput
										boundField={{
											entityID: project.id,
											entityTable: db.projects,
											fieldName: 'name',
											bindAs: 'text'
										}}
										disableLineBreak
										disableSpellCheck
										placeholder="Untitled project"
										twClass="px-1 max-w-[80%]"
									/>
								</div>
								<div class="flex items-center gap-1">
									<button
										class="rounded-xl border border-smithers-400 bg-smithers-50 p-2 dark:border-smithers-900 dark:bg-smithers-950"
										onclick={async () => {
											const deselect = project.id === activeProject?.id;
											skstate.updateSettings({ currProj: deselect ? undefined : project.id });
											activeProject = deselect ? undefined : await db.projects.get(project.id);
											if (!deselect) {
												db.projects.update(project.id, {
													openedAt: Date.now()
												});
											}
										}}
										aria-label={project.id === activeProject?.id
											? 'Deselect project'
											: 'Select project'}
									>
										{#if project.id === activeProject?.id}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="1.5"
												stroke="currentColor"
												class="size-5 stroke-smithers-900 dark:stroke-smithers-400"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15"
												/>
											</svg>
										{:else}
											<svg
												xmlns="http://www.w3.org/2000/svg"
												fill="none"
												viewBox="0 0 24 24"
												stroke-width="1.5"
												stroke="currentColor"
												class="size-5 stroke-smithers-900 dark:stroke-smithers-400"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15M12 9l3 3m0 0-3 3m3-3H2.25"
												/>
											</svg>
										{/if}
									</button>
									<a
										href={`/projects/delete?id=${project.id}`}
										class="rounded-xl border border-robin-400 bg-robin-300 p-2 dark:border-robin-900 dark:bg-robin-950"
										onclick={async () => {
											const deselect = project.id === activeProject?.id;
											skstate.updateSettings({ currProj: deselect ? undefined : project.id });
											activeProject = deselect ? undefined : await db.projects.get(project.id);
										}}
										aria-label={project.id === activeProject?.id
											? 'Deselect project'
											: 'Select project'}
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
												d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
											/>
										</svg>
									</a>
								</div>
							</div>
						{/each}
					</div>
				</section>
			</div>
		{/if}

		<hr class="my-4 hidden border-donkey-200 dark:border-donkey-600 md:block" />

		<!-- Import a project from a file section -->
		<div class="flex flex-col items-center justify-center md:flex-row md:justify-between">
			<hgroup class="hidden text-center md:block md:text-left">
				<h2 class="text-lg font-semibold">Import a project from a file</h2>
				<h3 class="text-sm text-donkey-400 dark:text-donkey-300">
					Load a project from another Sidekick instance (coming in a future update)
				</h3>
			</hgroup>
			<button
				class="mt-4 flex h-min w-full justify-center gap-1 rounded-xl border border-donkey-300 bg-donkey-200 px-2 py-2 text-white opacity-40 dark:border-donkey-700 dark:bg-donkey-800 md:mt-0 md:w-min"
			>
				<!-- FOR WHEN IMPLEMENTED:  -->
				<!-- class="mt-4 flex h-min w-full justify-center gap-1 rounded-xl border border-donkey-300 bg-donkey-200 px-2 py-2 text-white hover:bg-donkey-300 dark:border-donkey-700 dark:bg-donkey-800 hover:dark:bg-donkey-600 md:mt-0 md:w-min" -->
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
					For importing to another device (coming in a future update)
				</h3>
			</hgroup>
			<button
				class="mt-4 flex h-min w-full justify-center gap-1 rounded-xl border border-donkey-300 bg-donkey-200 px-2 py-2 text-white opacity-40 dark:border-donkey-700 dark:bg-donkey-800 md:mt-0 md:w-min"
			>
				<!-- FOR WHEN IMPLEMENTED: -->
				<!-- class="mt-4 flex h-min w-full justify-center gap-1 rounded-xl border border-donkey-300 bg-donkey-200 px-2 py-2 text-white hover:bg-donkey-300 dark:border-donkey-700 dark:bg-donkey-800 hover:dark:bg-donkey-600 md:mt-0 md:w-min" -->
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
