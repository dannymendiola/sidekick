<script lang="ts">
	import { db, skstate, QLEditor } from '$lib';
	import { liveQuery } from 'dexie';

	const query = liveQuery(() => db.projects.get(skstate.projectID || ''));
	const project = $derived($query);

	let projectName = $state('');
</script>

<div class="sk-content md:mt-16">
	<h1 class="mb-6 -rotate-2 font-brand text-4xl uppercase text-smithers-500">Projects</h1>
	<section
		title="Project"
		class="h-min w-full rounded-2xl border border-donkey-400 p-2 dark:border-donkey-800 dark:bg-donkey-900"
	>
		{#if project}
			<h2 class="font-title text-3xl">Current project</h2>
			<QLEditor
				id="project-name"
				initText={project.name}
				placeholder="Untitled project"
				inputMode="info"
				twBG="bg-donkey-50 dark:bg-donkey-900"
				twText="text-donkey-900 dark:text-donkey-50"
				twClass="w-full [&>.ql-editor]:pl-0 drop-shadow-none max-w-[80%] [&>.ql-editor>*]:font-title [&>.ql-editor>*]:text-2xl cursor-pointer [&>.ql-editor::before]:font-title [&>.ql-editor::before]:text-2xl [&>.ql-editor::before]:!italic [&>.ql-editor::before]:dark:text-donkey-700 [&>.ql-editor::before]:text-donkey-300"
				onkeyup={async () => {
					await db.projects.update(skstate.projectID!, { name: projectName });
				}}
				onfocusout={async () => {
					await db.projects.update(skstate.projectID!, { name: projectName });
				}}
				bind:text={projectName}
			/>
		{:else}
			<div class="my-3 text-xl font-bold text-donkey-700 dark:text-donkey-400">
				No project selected
			</div>
		{/if}
	</section>
</div>
