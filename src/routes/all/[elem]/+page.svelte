<script lang="ts">
	import { page } from '$app/stores';
	import type { Character, Location, Moment, CharacterRelationship } from '$lib/db';
	import { db } from '$lib/db';

	const name = $derived(
		$page.params.elem.replace(
			/\w\S*/g,
			(text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
		)
	);

	let elementsPromise = $derived.by(async () => {
		switch (name) {
			case 'Moments':
				return await db.moments.orderBy('order').toArray();
			case 'Characters':
				return await db.characters.orderBy('name').toArray();
			case 'Relationships':
				return await db.character_relationships.toArray();
			case 'Locations':
				return await db.locations.orderBy('name').toArray();
		}
	});
</script>

<div class="sk-content-w">
	<h1 class="font-title text-4xl">{name}</h1>
	{#await elementsPromise then elements}
		{#if elements && elements.length > 0}
			{#each elements as element}
				{#if name !== 'Relationships'}
					<!-- <a href="/all/{name}/{element.id}" class="sk-link">{element.name}</a> -->
					{(element as Character | Location | Moment).name}
				{:else}{/if}
			{/each}
		{:else}
			<div>No {name} found</div>
		{/if}
	{:catch error}
		<!-- TODO -->
		something went wrong
	{/await}
</div>

<svelte:head>
	<title>🦸 Sidekick</title>
</svelte:head>
