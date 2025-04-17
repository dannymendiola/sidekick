<script lang="ts">
	import { db } from '$lib/db';
	import { SKInput, skstate } from '$lib';
	import { goto } from '$app/navigation';

	let newProjName = $state('');
	// let newProjNameCleaned = $derived(newProjName?.replace('\n', ''));

	const goToNewProj = async () => {
		let p = await db.projects.add({ name: newProjName });
		skstate.updateSettings({ currProj: p });
		goto('/projects');
	};
</script>

<div class="sk-content mt-[10vh] md:mt-[30vh]">
	<h1 class="mb-4 font-title text-3xl font-bold">New project</h1>
	<div class="h-min">
		<SKInput
			placeholder="Untitled project"
			disableSpellCheck
			twClass="text-xl font-semibold"
			bind:text={newProjName}
		/>
	</div>
	<div class="mt-4 flex w-full justify-end">
		<button
			class="rounded-xl border border-donkey-300 bg-donkey-200 p-2 drop-shadow-lg hover:bg-donkey-300 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-donkey-200 dark:border-donkey-700 dark:bg-donkey-800 dark:hover:bg-donkey-500 disabled:hover:dark:bg-donkey-800"
			aria-label="Submit"
			onpointerup={goToNewProj}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				class="size-5 stroke-donkey-600 dark:stroke-donkey-200"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
			</svg>
		</button>
	</div>
</div>
