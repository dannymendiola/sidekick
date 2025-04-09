<script lang="ts">
	import { vibrate, skstate, db } from '$lib';
	import { onMount } from 'svelte';
	import { elasticOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';
	import { version } from '$app/environment';
	let mounted = $state(false);
	onMount(() => {
		mounted = true;
	});

	const project = $derived.by(async () => {
		return skstate.projectID ? await db.projects.get(skstate.projectID) : undefined;
	});
</script>

<div class="sk-content">
	{#if mounted}
		<h1
			in:scale={{ duration: skstate.prefersReducedMotion ? 0 : 600, easing: elasticOut }}
			class="mt-[15vh] -rotate-3 select-none text-center font-brand text-5xl uppercase text-robin-500 dark:text-smithers-600"
		>
			Sidekick
		</h1>
	{/if}
	<div class="mt-2 flex flex-col items-center justify-center gap-8">
		<h2 class="select-none font-title text-lg font-bold text-donkey-600 dark:text-donkey-400">
			Map your story
		</h2>
		<p class=" max-w-xl text-center dark:text-donkey-400 md:px-32">
			⚠️ This pre-beta version has limited functionality and isn't ready for use. Future updates
			will likely break your projects. For a stable app, please check back later.
		</p>
		<a
			class="flex items-center gap-2 rounded-xl border border-donkey-300 bg-donkey-200 px-4 py-2 text-donkey-100 hover:bg-donkey-300 dark:border-donkey-600 dark:bg-donkey-900 dark:hover:bg-donkey-800"
			onpointerup={() => {
				vibrate();
			}}
			href="/projects"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				class="size-4 fill-donkey-800 dark:fill-donkey-300"
			>
				<path
					d="M5.127 3.502 5.25 3.5h9.5c.041 0 .082 0 .123.002A2.251 2.251 0 0 0 12.75 2h-5.5a2.25 2.25 0 0 0-2.123 1.502ZM1 10.25A2.25 2.25 0 0 1 3.25 8h13.5A2.25 2.25 0 0 1 19 10.25v5.5A2.25 2.25 0 0 1 16.75 18H3.25A2.25 2.25 0 0 1 1 15.75v-5.5ZM3.25 6.5c-.04 0-.082 0-.123.002A2.25 2.25 0 0 1 5.25 5h9.5c.98 0 1.814.627 2.123 1.502a3.819 3.819 0 0 0-.123-.002H3.25Z"
				/>
			</svg>

			{#await project}
				<p class="text-donkey-800 dark:text-donkey-300">...</p>
			{:then project}
				<p class="text-donkey-800 dark:text-donkey-300">
					{#if project}
						Project:
						<span class="font-semibold text-donkey-900 dark:text-donkey-200">
							{project.name || 'Untitled project'}
						</span>
					{:else}
						Open or create a project
					{/if}
				</p>
			{/await}
		</a>
	</div>
</div>

<div
	class="fixed bottom-0 right-0 mb-20 mr-3 text-sm font-bold text-donkey-300 dark:text-donkey-600 md:mb-3"
>
	{version}
</div>

<svelte:head>
	<title>Sidekick</title>
</svelte:head>
