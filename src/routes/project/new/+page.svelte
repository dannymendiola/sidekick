<script lang="ts">
	import { page } from '$app/state';
	import { addCharacterAfter, addLocationAfter, addSectionAfter, db } from '$lib/db';
	import { QLEditor, skstate } from '$lib';
	import { goto } from '$app/navigation';

	type ElemType = 'section' | 'character' | 'location';

	let newProjName = $state('');
	let newProjNameCleaned = $derived(newProjName?.replace('\n', ''));

	// const goToNewElem = async () => {
	// 	switch (elemType) {
	// 		case 'character':
	// 			let c = await addCharacterAfter('tail', { name: newProjNameCleaned });
	// 			if (c) {
	// 				goto(`/character?id=${c.id}`, { replaceState: true });
	// 			} else {
	// 				goto('/all/characters', { replaceState: true });
	// 			}
	// 			break;
	// 		case 'section':
	// 			let m = await addSectionAfter('tail', { name: newProjNameCleaned });
	// 			if (m) {
	// 				goto(`/section?id=${m.id}`, { replaceState: true });
	// 			} else {
	// 				goto('/all/sections', { replaceState: true });
	// 			}
	// 			break;
	// 		case 'location':
	// 			let l = await addLocationAfter('tail', { name: newProjNameCleaned });
	// 			if (l) {
	// 				goto(`/location?id=${l.id}`, { replaceState: true });
	// 			} else {
	// 				goto('/all/locations', { replaceState: true });
	// 			}
	// 			break;
	// 	}
	// };

	const goToNewProj = async () => {
		let p = await db.projects.add({ name: newProjNameCleaned });
		skstate.updateSettings({ currProj: p });
		goto('/all/sections');
	};

	// const allowUntitled = elemType === 'section' || elemType === 'location';

	// const twAccept: { [K in ElemType]: { button: string; icon: string } } = {
	// 	character: {
	// 		button:
	// 			'bg-genie-500 hover:bg-genie-600 disabled:bg-donkey-200 disabled:text-donkey-100 dark:bg-genie-950 dark:hover:bg-genie-900 disabled:dark:bg-donkey-900',
	// 		icon: 'stroke-genie-100 dark:stroke-genie-300'
	// 	},
	// 	location: {
	// 		button:
	// 			'bg-wazowski-500 hover:bg-wazowski-600 disabled:bg-donkey-200 disabled:text-donkey-100 dark:bg-wazowski-950 dark:hover:bg-wazowski-900 disabled:dark:bg-donkey-900',
	// 		icon: 'stroke-wazowski-100 dark:stroke-wazowski-300'
	// 	},
	// 	section: {
	// 		button:
	// 			'bg-smithers-500 hover:bg-smithers-600 disabled:bg-donkey-200 disabled:text-donkey-100 dark:bg-smithers-950 dark:hover:bg-smithers-900 disabled:dark:bg-donkey-900',
	// 		icon: 'stroke-smithers-100 dark:stroke-smithers-300'
	// 	}
	// };
</script>

<div class="sk-content mt-[10vh] md:mt-[30vh]">
	<h1 class="mb-4 font-title text-3xl font-bold">New project</h1>
	<div class="h-min">
		<QLEditor
			id="new-elem-name"
			placeholder="Untitled project"
			inputMode="info"
			title="Name"
			bind:text={newProjName}
		/>
	</div>
	<div class="mt-4 flex w-full justify-end">
		<button
			class="rounded-xl border border-donkey-300 bg-donkey-200 p-2 drop-shadow-lg hover:bg-donkey-300 disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-donkey-200 dark:border-donkey-700 dark:bg-donkey-800 dark:hover:bg-donkey-500 disabled:hover:dark:bg-donkey-800"
			aria-label="Submit"
			onpointerup={goToNewProj}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				class="size-5 stroke-donkey-600 dark:stroke-donkey-200"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
			</svg>
		</button>
	</div>
</div>
