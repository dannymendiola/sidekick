<script lang="ts">
	import { type CharacterAttr } from '$lib/types/db';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { db, type Character } from '$lib/db';

	const charId = $page.url.searchParams.get('id');

	let character: Character | 'unsaved' | undefined = $state();

	const loadCharacterId = async () => {
		if (!charId) {
			goto('/welcome');
		} else if (charId === 'new') {
			character = 'unsaved';
		} else {
			const res = await db.characters.get(charId);
			if (res) {
				character = res;
			} else {
				goto('/welcome');
			}
		}
	};
	loadCharacterId();
</script>
