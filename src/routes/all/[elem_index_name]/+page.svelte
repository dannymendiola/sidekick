<script lang="ts">
	import { page } from '$app/stores';
	import type { Character, Location, Moment } from '$lib/db';
	import { db } from '$lib/db';
	import { vibrate } from '$lib';

	// Capitalize the
	const name = $derived(
		$page.params.elem_index_name
			.replace(/-/g, ' ')
			.replace(/\w\S*/g, (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())
	);

	let elemCount = $state(-1);

	let elementsPromise = $derived.by(async () => {
		switch (name) {
			case 'Moments':
				elemCount = await db.moments.count();
				return await db.moments.orderBy('order').toArray();
			case 'Characters':
				elemCount = await db.characters.count();
				return await db.characters.orderBy('name').toArray();
			case 'Character Dynamics':
				elemCount = await db.dynamics.count();
				return await db.dynamics.toArray();
			case 'Locations':
				elemCount = await db.locations.count();
				return await db.locations.orderBy('name').toArray();
		}
	});
</script>

<div class="sk-content md:mt-28">
	<div class="flex w-full items-center justify-between">
		<h1 class="max-w-[90%] font-title text-3xl font-bold md:text-4xl">{name}</h1>
		{#if name !== 'Character Dynamics' && elemCount !== 0}
			<a
				class="rounded-full bg-genie-600 p-2 dark:bg-genie-950"
				aria-label="Add {name.toLowerCase().slice(0, -1)}"
				href={`/edit/${name.toLowerCase().slice(0, -1)}?id=new`}
				data-sveltekit-replacestate
			>
				{@render Plus()}
			</a>
		{/if}
	</div>
	{#await elementsPromise then elements}
		{#if elements && elements.length > 0}
			{#each elements as element}
				{#if name !== 'Character Dynamics'}
					<!-- TODO -->
					{(element as Character | Location | Moment).name}
				{:else}{/if}
			{/each}
		{:else}
			<div class="flex w-full flex-col items-center justify-center">
				<div class="mb-6 mt-[20vh] font-title text-lg font-bold italic dark:text-donkey-400">
					No {name.toLowerCase()} yet
				</div>
				{#if name !== 'Character Dynamics'}
					<a
						class="flex w-min items-center gap-2 whitespace-nowrap rounded-full bg-genie-500 px-4 py-2 text-genie-100 hover:bg-genie-600 dark:bg-genie-950 dark:hover:bg-genie-900"
						href="/edit/{name.toLowerCase().slice(0, -1)}?id=new"
						onpointerup={() => vibrate()}
					>
						{@render Plus()}
						<p class="text-genie-100 dark:text-genie-300">
							Create a new {name.toLowerCase().slice(0, -1)}
						</p>
					</a>
				{:else}
					<div class="text-donkey-700 dark:text-donkey-400">
						Create one from within a character sheet
					</div>
				{/if}
			</div>
		{/if}
	{/await}
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

<svelte:head>
	<title>{name}</title>
</svelte:head>
