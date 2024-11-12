<script lang="ts">
	import { type CharacterAttr } from '$lib/types/db.d';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { db, type Character } from '$lib/db';

	const charId = $page.url.searchParams.get('id');

	let character: Character | 'unsaved' | undefined = $state();

	let exists = true;

	const loadCharacterId = async () => {
		switch (charId) {
			case 'new':
				character = 'unsaved';
				break;
			case null:
			case undefined:
				goto('/welcome');
				break;
			default:
				let char = await db.characters.get(charId);
				if (char) {
					let next = await char.getNext();
					character = char;
				} else {
					// goto('/welcome');
					exists = false;
				}

				break;
		}
	};
	loadCharacterId();
</script>

<div class="sk-content md:mt-16">
	<!-- <div class="mb-6 -rotate-2 font-brand text-4xl uppercase">
		{charId === 'new' ? 'New Character' : 'Edit Character'}
	</div> -->
</div>

<svelte:head>
	<title
		>{charId === 'new'
			? 'New Character'
			: character
				? `👤 ${(character as Character).name || 'Character'}`
				: 'Edit Character'}</title
	>
</svelte:head>
