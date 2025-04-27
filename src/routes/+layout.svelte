<script lang="ts">
	import { skstate, Navbar } from '$lib';
	import { goto } from '$app/navigation';
	import { vibrate, SKInput } from '$lib';
	import { page } from '$app/state';
	import '../app.css';
	import { untrack } from 'svelte';
	import { db, Project } from '$lib/db';

	let { children } = $props();

	let pageColor: TWColor = $derived(skstate.darkMode ? 'bg-donkey-950' : 'bg-donkey-50');

	$effect(() => {
		if (document.body && !document.body.classList.contains(pageColor)) {
			document.body.className = `${skstate.darkMode ? 'dark ' : ''}${pageColor}`;
		}

		const metaTheme = document.querySelector('meta[name="theme-color"]');
		metaTheme?.setAttribute('content', skstate.darkMode ? '#130c02' : '#f2e8d6');
	});

	$effect(() => {
		if (page.url && page.url.pathname !== '/') {
			untrack(() => skstate.updateSettings({ currPath: `${page.url.pathname}${page.url.search}` }));
		}
	});

	const projectPromise = $derived.by(async () => {
		return skstate.projectID ? await db.projects.get(skstate.projectID) : undefined;
	});

	const onElemPage = $derived(
		['/character', '/location', '/section', '/character-dynamic'].includes(page.url.pathname)
	);

	const pathnameToName = {
		'/character': 'Characters',
		'/location': 'Locations',
		'/section': 'Outline',
		'/character-dynamic': 'Character Dynamics'
	};

	// const requestPersistence = async () => {
	// 	if (navigator.storage && !(await navigator.storage.persisted())) {
	// 		// TODO Show modal explainer:
	// 		// Your browser might ask if you want to allow Sidekick access to persistent storage on your device. This is optional, but it tells your browser that your work should be protected from automatic deletion in the case of low storage.
	// 		const granted = await navigator.storage.persist();
	// 	}
	// };
	// requestPersistence();
</script>

<!-- <SaveLoadModal /> -->

{@render Topbar()}

<div class="wrapper flex h-screen flex-col-reverse md:flex-row">
	{#await projectPromise then project}
		{@render Breadcrumbs(project)}
	{/await}
	<div class="navbar z-10 md:z-20">
		<Navbar />
	</div>
	<div class="grid grow items-start justify-items-center overflow-y-auto">
		{@render children()}
	</div>
</div>

{#snippet Topbar()}
	<div
		class="absolute z-10 flex h-20 items-center justify-between bg-donkey-50 p-4 dark:bg-donkey-950 md:pr-8 {skstate.touchscreen
			? 'w-[calc(100%-6px)]'
			: 'w-[calc(100%-12px)] '}"
	>
		<button
			class="rounded-xl bg-donkey-100 hover:bg-donkey-300 dark:bg-donkey-900 hover:dark:bg-donkey-800"
			onpointerup={() => {
				vibrate();
				goto('/welcome');
			}}
		>
			<img
				class="h-auto w-16 drop-shadow-md dark:drop-shadow-none"
				src="/logo-square-sm.png"
				alt="The word 'Sidekick' in yellow serif font over a red oval"
			/>
		</button>
		<div class="hidden md:block"></div>
		<div class="flex gap-4">
			<button
				class="rounded-full bg-donkey-100 p-2 hover:bg-donkey-200 dark:bg-donkey-900 dark:hover:bg-donkey-800 md:hidden"
				onpointerup={() => {
					skstate.updateSettings({ theme: skstate.darkMode ? 'light' : 'dark' });
				}}
			>
				{@render ThemeIcon(skstate.darkMode ? 'sun' : 'moon')}
			</button>
			<a
				class="rounded-full bg-donkey-100 p-2 hover:bg-donkey-200 dark:bg-donkey-900 dark:hover:bg-donkey-800 md:hidden md:bg-donkey-200"
				aria-label="Manage projects"
				href="/projects"
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
			</a>
		</div>
	</div>
	<div
		class="absolute z-20 hidden h-20 w-screen items-center justify-end bg-transparent p-4 md:flex md:pr-8"
	>
		<button
			class="rounded-full bg-donkey-100 p-2 hover:bg-donkey-200 dark:bg-donkey-900 dark:hover:bg-donkey-800"
			onpointerup={() => {
				skstate.updateSettings({ theme: skstate.darkMode ? 'light' : 'dark' });
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

{#snippet CalloutNoProj()}
	<div class="absolute z-10 h-screen w-screen bg-donkey-50 dark:bg-donkey-950 md:pl-24">
		<div class="flex flex-col items-center gap-4">
			<h1 class="mt-48 font-title text-3xl text-donkey-600 dark:text-donkey-300">
				No project selected
			</h1>
			<a
				class="flex items-center gap-2 rounded-xl border border-donkey-300 bg-donkey-200 px-4 py-2 text-donkey-100 hover:bg-donkey-300 dark:border-donkey-600 dark:bg-donkey-900 dark:hover:bg-donkey-800"
				onclick={() => {
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
				<p>Open or create a project</p>
			</a>
		</div>
	</div>
{/snippet}

{#snippet Breadcrumbs(project: Project | undefined)}
	{#if !page.url.pathname.split('/').includes('projects') && page.url.pathname !== '/welcome'}
		{#if project}
			<div class="fixed left-24 top-4 z-50 hidden md:flex">
				<a
					class="z-50 flex items-center gap-2 border bg-donkey-100 py-2 font-title text-xl hover:bg-donkey-200 dark:bg-donkey-900 hover:dark:bg-donkey-800 {onElemPage
						? 'rounded-l-xl border-r-0 border-y-donkey-300 border-l-donkey-300 pl-4 pr-2 dark:border-y-donkey-700 dark:border-l-donkey-700'
						: 'rounded-xl border-donkey-200 px-4 dark:border-donkey-700'}"
					href="/projects"
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
					{project.name || 'Untitled project'}
				</a>
				<div
					class="flex items-center border border-x-0 border-y-donkey-300 bg-donkey-100 px-1 dark:border-donkey-700 dark:bg-donkey-900 {!onElemPage &&
						'hidden'}"
				>
					•
				</div>
				<a
					class="z-50 items-center gap-2 rounded-r-xl border border-l-0 border-y-donkey-300 border-r-donkey-300 bg-donkey-100 py-2 pl-2 pr-4 font-semibold hover:bg-donkey-200 dark:border-y-donkey-700 dark:border-r-donkey-700 dark:bg-donkey-900 hover:dark:bg-donkey-800 {onElemPage
						? 'flex'
						: 'hidden'}"
					href={`/all${page.url.pathname}s`}
				>
					{pathnameToName[page.url.pathname as keyof typeof pathnameToName]}
				</a>
			</div>
		{:else}
			{@render CalloutNoProj()}
		{/if}
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
