<script lang="ts">
	import { vibrate } from '$lib';
	import { onMount } from 'svelte';
	import { elasticOut } from 'svelte/easing';
	import { scale } from 'svelte/transition';
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
		<button
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
		</button>
	</div>
</div>

<svelte:head>
	<title>Sidekick</title>
</svelte:head>
