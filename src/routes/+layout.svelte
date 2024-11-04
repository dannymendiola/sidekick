<script lang="ts">
	import { skstate, DEFAULT_SETTINGS, Navbar } from '$lib';
	import { goto } from '$app/navigation';
	import { vibrate } from '$lib';
	import { onMount } from 'svelte';
	import '../app.css';

	let { children } = $props();

	const storedSettings = localStorage.getItem('sk-settings');
	skstate.settings = storedSettings ? JSON.parse(storedSettings) : DEFAULT_SETTINGS;

	let pageColor: TWColor = $derived(skstate.darkMode ? 'bg-donkey-950' : 'bg-donkey-100');

	$effect(() => {
		if (document.body && !document.body.classList.contains(pageColor)) {
			document.body.className = `${skstate.darkMode ? 'dark ' : ''}${pageColor}`;
		}
	});
</script>

{@render SkinnyTopbar()}

<div class="wrapper flex h-screen flex-col-reverse md:flex-row">
	<div class="navbar">
		<Navbar />
	</div>
	<div class="flex grow justify-center overflow-auto">
		<!-- <div class="mt-20 flex-1 md:mt-0 skinny:px-[1vw]"> -->
		{@render children()}
		<!-- </div> -->
	</div>
</div>

{#snippet SkinnyTopbar()}
	<div
		class="fixed flex h-20 w-screen items-center justify-between p-4 md:bg-transparent md:pr-8 dark:md:bg-transparent"
	>
		<button
			class="rounded-xl bg-donkey-100 drop-shadow-lg hover:bg-donkey-200 dark:bg-donkey-900 dark:drop-shadow-none hover:dark:bg-donkey-800 md:hidden"
			onpointerup={() => {
				vibrate();
				goto('/');
			}}
		>
			<img
				class="h-auto w-16 drop-shadow-lg"
				src="/logo-square.png"
				alt="The word 'Sidekick' in yellow serif font over a red oval"
			/>
		</button>
		<div class="hidden md:block"></div>
		<button
			class="rounded-full bg-donkey-100 p-2 hover:bg-donkey-200 dark:bg-donkey-900 dark:hover:bg-donkey-800 md:bg-donkey-200"
			onpointerup={() => {
				skstate.settings = { theme: skstate.darkMode ? 'light' : 'dark' };
			}}
		>
			{@render ThemeIcon(skstate.darkMode ? 'sun' : 'moon')}
		</button>
	</div>
{/snippet}

{#snippet ThemeIcon(icon: 'sun' | 'moon')}
	{#if icon === 'sun'}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="size-6 dark:stroke-donkey-300"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z"
			/>
		</svg>
	{:else if icon === 'moon'}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			class="size-6 dark:stroke-donkey-300"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z"
			/>
		</svg>
	{/if}
{/snippet}

<style>
	.wrapper {
		padding-bottom: env(safe-area-inset-bottom);
		padding-top: env(safe-area-inset-top);
	}

	.navbar {
		position: sticky;
		padding-bottom: env(safe-area-inset-bottom);
		bottom: 0;
	}
</style>
