<script lang="ts">
	import { type CharacterAttr } from '$lib/types/db.d';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { db, type Character } from '$lib/db';

	const charId = $page.url.searchParams.get('id');

	let character: Character | undefined = $state();
	const charName = $derived(character?.name || 'Character');

	let exists = true;

	const loadCharacterId = async () => {
		if (!charId) {
			goto('/welcome');
		} else {
			character = await db.characters.get(charId);
			if (!character) {
				exists = false;
			}
		}
	};
	loadCharacterId();
</script>

<div class="sk-content md:my-16">
	<h1 class="-rotate-2 font-brand text-3xl uppercase">{charName}</h1>
	{#if character}
		{#each Object.entries((character as Character).attr || {}) as [key, value]}
			{#if key !== 'id' && key !== 'name'}
				<p>{key}: {value}</p>
			{/if}
		{/each}
	{/if}
</div>

<svelte:head>
	<title
		>{charId === 'new'
			? 'New Character'
			: character
				? `${(character as Character).name || 'Character'}`
				: 'Edit Character'}</title
	>
</svelte:head>
