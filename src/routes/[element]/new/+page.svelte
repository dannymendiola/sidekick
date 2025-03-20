<script lang="ts">
	import { page } from '$app/state';
	import { addCharacterAfter, addLocationAfter, addMomentAfter } from '$lib/db';
	import { goto } from '$app/navigation';

	type ElemType = 'moment' | 'character' | 'location';
	const elemType = page.params.element as ElemType;

	let newElemName = $state('');
	let newElemNameCleaned = $derived(newElemName?.replace('\n', ''));

	const gotoNewElem = async () => {
		switch (elemType) {
			case 'character':
				let c = await addCharacterAfter('tail', { name: newElemNameCleaned });
				if (c) {
					goto(`/character?id=${c.id}`, { replaceState: true });
				} else {
					goto('/all/characters');
				}
				break;
			case 'moment':
				let m = await addMomentAfter('tail', { name: newElemNameCleaned });
				if (m) {
					goto(`/moment?id=${m.id}`, { replaceState: true });
				} else {
					goto('/all/moments');
				}
				break;
			case 'location':
				let l = await addLocationAfter('tail', { name: newElemNameCleaned });
				if (l) {
					goto(`/location?id=${l.id}`, { replaceState: true });
				} else {
					goto('/all/locations');
				}
				break;
		}
	};
</script>
