<script lang="ts">
	import { goto } from '$app/navigation';
	import { QLEditor } from '$lib';
	import { addCharacterAfter } from '$lib/db';

	let newCharName = $state('');
	let newCharNameCleaned = $derived(newCharName?.replace('\n', ''));

	const gotoNewChar = async () => {
		let c = await addCharacterAfter('tail', { name: newCharNameCleaned });
		if (c) {
			// await invalidateAll();
			goto(`/character?id=${c.id}`, { replaceState: true });
		} else {
			goto('/all/characters');
		}
	};
</script>

<div class="sk-content mt-[30vh]">
	<h1 class="mb-4 font-title text-3xl font-bold">New Character</h1>
	<div class="h-min">
		<QLEditor id="new-char-name" inputMode="info" title="Give 'em a name" bind:text={newCharName} />
	</div>
	<div class="mt-4 flex w-full justify-end">
		<button
			class="rounded-xl bg-genie-500 p-2 drop-shadow-lg hover:bg-genie-600 disabled:cursor-not-allowed disabled:bg-donkey-200 disabled:text-donkey-100 disabled:drop-shadow-none dark:bg-genie-950 dark:drop-shadow-none dark:hover:bg-genie-900 disabled:dark:bg-donkey-900"
			aria-label="Submit"
			onpointerup={gotoNewChar}
			disabled={!newCharNameCleaned}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				class="size-5 {!newCharNameCleaned
					? 'stroke-donkey-600'
					: 'stroke-genie-100 dark:stroke-genie-300 '}"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
			</svg>
		</button>
	</div>
</div>
