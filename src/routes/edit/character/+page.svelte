<script lang="ts">
	import { type CharacterAttr } from '$lib/types/db.d';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { db, type Character } from '$lib/db';

	const charId = $page.url.searchParams.get('id');

	let character: Character | 'unsaved' | undefined = $state();

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
				const char = await db.characters.get(charId);
				if (char) {
				} else {
					goto('/welcome');
				}

				break;
		}
	};
	loadCharacterId();
</script>

<div class="sk-content">
	<div class="mb-6 -rotate-2 font-brand text-4xl uppercase">asdf</div>
</div>
