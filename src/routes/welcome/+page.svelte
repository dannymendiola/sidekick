<script lang="ts">
	import { vibrate, QLEditor } from '$lib';
	import { onMount } from 'svelte';
	import { elasticOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';
	import { version } from '$app/environment';
	let mounted = false;
	onMount(() => {
		mounted = true;
	});
</script>

<div class="sk-content">
	{#if mounted}
		<h1
			in:scale={{ duration: 600, easing: elasticOut }}
			class="mt-[15vh] -rotate-3 select-none text-center font-brand text-5xl uppercase text-robin-700 dark:text-smithers-600"
		>
			Sidekick
		</h1>
	{/if}
	<div class="mt-6 flex flex-col items-center justify-center gap-8">
		<p class="select-none font-title font-bold text-donkey-600 dark:text-donkey-400">
			- Map your story -
		</p>
		<p class="text-center dark:text-donkey-500 md:px-32">
			⚠️ This is a pre-beta version complete with bugs, limited functionality, and potential
			breaking changes. For a stable, fully-featured app, please check back later.
		</p>
		<!-- <button
			class="flex items-center gap-2 rounded-full bg-genie-500 px-4 py-2 text-genie-100 hover:bg-genie-600 dark:bg-genie-950 dark:hover:bg-genie-900"
			onpointerup={() => {
				vibrate();
				console.log('tour not implemented');
			}}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				class="size-4 stroke-genie-100 dark:stroke-genie-300"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M12 18v-5.25m0 0a6.01 6.01 0 0 0 1.5-.189m-1.5.189a6.01 6.01 0 0 1-1.5-.189m3.75 7.478a12.06 12.06 0 0 1-4.5 0m3.75 2.383a14.406 14.406 0 0 1-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 1 0-7.517 0c.85.493 1.509 1.333 1.509 2.316V18"
				/>
			</svg>

			<p class="text-genie-100 dark:text-genie-300">Take a quick tour</p>
		</button> -->
		<a
			class="flex items-center gap-2 rounded-full bg-genie-500 px-4 py-2 text-genie-100 hover:bg-genie-600 dark:bg-genie-950 dark:hover:bg-genie-900"
			onpointerup={() => {
				vibrate();
				// console.log('tour not implemented');
			}}
			href="/all/moments"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				class="size-4 stroke-genie-100 dark:stroke-genie-300"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
				/>
			</svg>

			<p class="text-genie-100 dark:text-genie-300">Get started</p>
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
