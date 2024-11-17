<script lang="ts">
	import { page } from '$app/stores';
	import type { Character, Dynamic, Location, Moment, Theme } from '$lib/db';
	import { addCharacterAfter, db } from '$lib/db';
	import { skstate, vibrate } from '$lib';
	import { draggable } from '$lib';
	import { goto } from '$app/navigation';

	// Capitalize
	const name = $derived(
		$page.params.elem_index_name
			.replace(/-/g, ' ')
			.replace(/\w\S*/g, (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())
	);

	$effect(() => {
		if (!['Moments', 'Themes', 'Characters', 'Character Dynamics', 'Locations'].includes(name)) {
			goto('/welcome');
		}
	});

	let elemCount = $state(-1);

	let elementsPromise = $derived.by(async () => {
		switch (name) {
			case 'Moments':
				elemCount = await db.moments.count();
				return await db.moments.orderBy('order').toArray();
			case 'Themes':
				elemCount = await db.themes.count();
				return await db.themes.orderBy('order').toArray();
			case 'Characters':
				elemCount = await db.characters.count();
				return await db.characters.orderBy('order').toArray();
			case 'Character Dynamics':
				elemCount = await db.dynamics.count();
				return await db.dynamics.orderBy('order').toArray();
			case 'Locations':
				elemCount = await db.locations.count();
				return await db.locations.orderBy('order').toArray();
		}
	});
</script>

<div class="sk-content md:mt-28">
	<div class="flex w-full flex-col items-center justify-between gap-3 md:flex-row">
		<h1 class="w-full -rotate-2 text-center font-brand text-3xl uppercase md:text-left md:text-4xl">
			{name}
		</h1>
		{#if name !== 'Character Dynamics' && elemCount !== 0}
			<a
				class="flex items-center gap-2 rounded-full bg-genie-500 px-3 py-2 dark:bg-genie-950 md:p-2"
				aria-label="Add {name.toLowerCase().slice(0, -1)}"
				href={`/${name.toLowerCase().slice(0, -1)}/new`}
			>
				{@render Plus()}
				<span class="text-sm text-genie-200 dark:text-genie-300 md:hidden">New</span>
			</a>
		{/if}
	</div>
	{#await elementsPromise then elements}
		{#if elements && elements.length > 0}
			<div class="mt-4 flex flex-col gap-6 md:mt-16">
				{#each elements as element}
					{#if name !== 'Character Dynamics'}
						<a
							class="touch-none rounded-lg bg-donkey-200 p-6 font-title text-xl font-bold italic hover:bg-donkey-300 dark:bg-donkey-900 dark:text-donkey-400 hover:dark:bg-donkey-800 md:text-2xl"
							href="/{name.toLowerCase().slice(0, -1)}?id={element.id}"
							use:draggable
						>
							<div class="flex w-full justify-between">
								<h4 class="text-left">
									{name === 'Moments'
										? (element as Moment).name?.replaceAll('\n', '') || 'Untitled Moment'
										: (element as Character | Theme | Location).name}
								</h4>
								{#if skstate.touchscreen}
									{@render OrderButton()}
								{/if}
							</div>
						</a>
					{:else}
						<a
							class="touch-none rounded-lg bg-donkey-200 p-6 font-title text-xl font-bold italic hover:bg-donkey-300 dark:bg-donkey-900 dark:text-donkey-400 hover:dark:bg-donkey-800 md:text-2xl"
							href="/character-dynamic?id={element.id}"
						>
							<div class="flex w-full justify-between">
								<h4 class="text-left">
									{#await (element as Dynamic).toString() then name}
										{name}
									{/await}
								</h4>
								{#if skstate.touchscreen}
									{@render OrderButton()}
								{/if}
							</div>
						</a>
					{/if}
				{/each}
			</div>
		{:else}
			<div class="flex w-full flex-col items-center justify-center">
				<div
					class="mb-6 mt-[20vh] font-title text-xl font-bold italic dark:text-donkey-400 md:text-2xl"
				>
					No {name.toLowerCase()} yet
				</div>
				{#if name !== 'Character Dynamics'}
					<a
						class="flex w-min items-center gap-2 whitespace-nowrap rounded-full bg-genie-500 px-4 py-2 text-genie-100 hover:bg-genie-600 dark:bg-genie-950 dark:hover:bg-genie-900"
						href="/{name.toLowerCase().slice(0, -1)}/new"
						onpointerup={() => vibrate()}
					>
						{@render Plus()}
						<p class="text-genie-100 dark:text-genie-300">
							Add a new {name.toLowerCase().slice(0, -1)}
						</p>
					</a>
				{:else}
					<div class="text-donkey-700 dark:text-donkey-400">
						Create one from within a
						<a href="/all/characters" class="text-genie-500 hover:underline"> character sheet </a>
					</div>
				{/if}
			</div>
		{/if}
	{/await}
	<div class="h-24"></div>
</div>

{#snippet Plus()}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="2"
		class="size-4 stroke-genie-200 dark:stroke-genie-300 md:size-6"
	>
		<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
	</svg>
{/snippet}

{#snippet OrderButton()}
	<button
		class="z-[1] rounded-lg bg-donkey-300 p-1 dark:bg-donkey-800"
		aria-label="Reorder"
		onpointerup={() => vibrate()}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			class="size-6 stroke-donkey-800 dark:stroke-donkey-200"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
			/>
		</svg>
	</button>
{/snippet}

<svelte:head>
	<title>{name}</title>
</svelte:head>
