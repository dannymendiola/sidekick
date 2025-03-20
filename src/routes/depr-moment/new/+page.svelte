<script lang="ts">
	import { goto } from '$app/navigation';
	import { QLEditor } from '$lib';
	import { addMomentAfter } from '$lib/db';

	let momentName = $state('');
	let momentNameClean = $derived(momentName?.replace('\n', ''));

	const gotoNewMoment = async () => {
		let m = await addMomentAfter('tail', momentNameClean ? { name: momentNameClean } : {});
		if (m) {
			goto(`/moment?id=${m.id}`, { replaceState: true });
		} else {
			goto('/all/moments');
		}
	};
</script>

<div class="sk-content mt-[10vh] md:mt-[30vh]">
	<h1 class="mb-4 font-title text-3xl font-bold">New Moment</h1>
	<div class="h-min">
		<QLEditor
			id="new-moment-name"
			inputMode="info"
			title="Title (optional)"
			bind:text={momentName}
		/>
	</div>
	<div class="mt-4 flex w-full justify-end">
		<button
			class="rounded-xl bg-genie-500 p-2 drop-shadow-lg hover:bg-genie-600 disabled:cursor-not-allowed disabled:bg-donkey-200 disabled:text-donkey-100 disabled:drop-shadow-none dark:bg-genie-950 dark:drop-shadow-none dark:hover:bg-genie-900 disabled:dark:bg-donkey-900"
			aria-label="Submit"
			onpointerup={gotoNewMoment}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				class="size-5 stroke-genie-100 dark:stroke-genie-300"
			>
				<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
			</svg>
		</button>
	</div>
</div>
