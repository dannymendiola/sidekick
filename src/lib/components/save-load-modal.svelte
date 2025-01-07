<script lang="ts">
	import { skstate, saveProject } from '$lib';

	let drawing = $state(false);

	$effect(() => {
		if (skstate.showSaveLoad) {
			drawing = true;
			setTimeout(() => {
				drawing = false;
			}, 300);
		}
	});
</script>

<div class="z-50 h-full w-full overflow-hidden {skstate.showSaveLoad ? 'absolute' : 'hidden'}">
	<div class="fixed flex h-full w-full justify-center" aria-label="Save/Load Modal">
		<button
			class="fixed -z-10 h-full w-full cursor-default overflow-hidden bg-donkey-500/80 dark:bg-donkey-950/80"
			onclick={() => {
				if (!drawing) skstate.showSaveLoad = false;
			}}
			aria-label="Close area"
		></button>
		<div
			class="mt-24 h-96 w-[90%] max-w-[512px] rounded-lg bg-donkey-50 p-4 dark:bg-donkey-900 md:mt-32"
		>
			<div class="-z-20 flex items-center justify-between">
				<h2 class="z-10 text-xl font-bold">Project</h2>
				<button
					class="rounded-xl p-1 hover:bg-donkey-100 dark:hover:bg-donkey-800"
					onclick={() => {
						skstate.showSaveLoad = false;
					}}
					aria-label="Close"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="size-6"
					>
						<path
							fill-rule="evenodd"
							d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
			</div>
			<div class="mt-4 flex flex-col gap-4 px-2 md:px-4">
				<button
					class="flex justify-center gap-2 rounded-lg bg-genie-100 px-2 py-4 font-bold hover:bg-genie-200 dark:bg-genie-950 dark:hover:bg-genie-900"
					aria-label="Export project"
					onclick={() => {
						const filename = prompt('File name:', 'SidekickProject');
						if (filename !== null) {
							saveProject(filename);
							skstate.showSaveLoad = false;
						}
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m0-3-3-3m0 0-3 3m3-3v11.25m6-2.25h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75"
						/>
					</svg>
					Export project
				</button>
				<button
					class="flex justify-center gap-2 rounded-lg bg-green-100 px-2 py-4 font-bold hover:bg-green-200 dark:bg-green-950 dark:hover:bg-green-900"
					aria-label="Import project"
					onclick={() => {
						// TODO
						alert('This feature is not yet implemented');
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-6"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M7.5 7.5h-.75A2.25 2.25 0 0 0 4.5 9.75v7.5a2.25 2.25 0 0 0 2.25 2.25h7.5a2.25 2.25 0 0 0 2.25-2.25v-7.5a2.25 2.25 0 0 0-2.25-2.25h-.75m-6 3.75 3 3m0 0 3-3m-3 3V1.5m6 9h.75a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25h-7.5a2.25 2.25 0 0 1-2.25-2.25v-.75"
						/>
					</svg>

					Load project
				</button>
			</div>
		</div>
	</div>
</div>
