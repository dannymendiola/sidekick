<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { QLEditor, vibrate } from '$lib';
	import { db } from '$lib/db';
	import { type MomentAttr } from '$lib/types/db.d';
	import { liveQuery } from 'dexie';
	import { Delta } from 'quill/core';

	const momentId = $derived($page.url.searchParams.get('id'));

	$effect(() => {
		if (momentId) {
			db.moments.get(momentId).then((m) => {
				if (!m) {
					goto('/all/moments');
				}
			});
		}
	});

	let editing = $state(false);

	let momentQuery = liveQuery(() => {
		return db.moments.get(momentId!);
	});

	let moment = $derived($momentQuery);

	let momentName = $state('');
	let momentNameClean = $derived(momentName?.replaceAll('\n', ''));

	const attrDisplayNames: {
		[K in keyof MomentAttr]: string;
	} = {
		conflict: 'Conflict',
		significance: 'Significance',
		driving_force: 'Driving force',
		start_point: 'It starts:',
		end_point: 'How it ends...',
		outcome_reason: '...because:',
		notes: 'Notes'
	};

	const attrKeys = () => {
		return Object.keys(attrDisplayNames) as Array<keyof MomentAttr>;
	};

	let liveAttr = $state<MomentAttr>({});

	$effect(() => {
		if (moment) {
		}
	});
	let bodyDelta = $state<Delta>();
	let bodyText = $state('');
	// let b
	// let bodyDelta = $derived(moment?.body);

	// let moment = $state<Delta>(new Delta());

	const characters = liveQuery(() => moment?.getCharacters() || []);
	const locations = liveQuery(() => moment?.getLocations() || []);
	const themes = liveQuery(() => moment?.getThemes() || []);

	let showDeleteModal = $state(false);

	let initClean = false;
	$effect(() => {
		if (moment && !initClean) {
			moment.cleanAttr();
			initClean = true;
		}
	});
</script>

{#if showDeleteModal}
	{@render DeleteModal()}
{/if}

<div class="sk-content md:mt-16">
	<h1 class="invisible absolute">{momentName}</h1>

	{#await db.moments.get(momentId!) then m}
		<div class="flex w-full items-center justify-between">
			<div class=" w-full font-title font-bold">
				<QLEditor
					id="moment-name"
					initText={m?.name || ''}
					placeholder="Untitled moment"
					inputMode="info"
					twBG="bg-donkey-100 dark:bg-donkey-950"
					twText="text-donkey-900 dark:text-donkey-50"
					twClass="[&>.ql-editor]:pl-0 drop-shadow-none max-w-[80%] [&>.ql-editor>*]:font-title [&>.ql-editor>*]:text-3xl cursor-pointer [&>.ql-editor::before]:font-title [&>.ql-editor::before]:text-3xl [&>.ql-editor::before]:!italic [&>.ql-editor::before]:dark:text-donkey-700 [&>.ql-editor::before]:text-donkey-300 "
					onkeyup={async () => {
						if (momentId) {
							await db.moments.update(momentId, { name: momentName });
						}
					}}
					onfocusout={async () => {
						if (momentId) {
							await db.moments.update(momentId, { name: momentName });
						}
					}}
					bind:text={momentName}
				/>
			</div>
			<button
				class="rounded-md bg-robin-600 p-2 hover:bg-robin-500 dark:bg-robin-950 hover:dark:bg-robin-900"
				aria-label="Delete Character"
				onpointerup={() => {
					vibrate();
					showDeleteModal = true;
				}}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="1.5"
					class="size-5 stroke-robin-300 dark:stroke-robin-400"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
					/>
				</svg>
			</button>
		</div>
	{/await}
	{#if moment}
		<!-- TODO fix rich editor -->
		<section class="mb-8 mt-4 flex flex-col">
			<div class="mb-3 flex items-center gap-4">
				<div class="h-32 w-full">
					<QLEditor
						id="moment-body"
						inputMode="info"
						initText={moment.body || ''}
						onkeyup={async () => {
							if (momentId) {
								await db.moments.update(momentId, { body: bodyText });
							}
						}}
						onfocusout={async () => {
							if (momentId) {
								await db.moments.update(momentId, { body: bodyText });
							}
						}}
						bind:text={bodyText}
					/>
				</div>
			</div>
		</section>
	{/if}
</div>

{#snippet DeleteModal()}
	<div class="fixed -left-12 z-10 h-[200vh] w-[200vw] bg-black/60 dark:bg-black/80"></div>
	<div class="fixed z-10 flex h-full w-full flex-col items-center justify-center">
		<button
			class="fixed -left-12 h-[200vh] w-[200vw] bg-transparent"
			onpointerup={() => (showDeleteModal = false)}
			aria-label="Close area"
		></button>
		<div
			class="sk-content z-[11] mb-[20vh] flex max-w-[512px] flex-col gap-2 rounded-xl bg-donkey-200 px-6 py-4 italic dark:bg-donkey-800"
		>
			<h2 class="mb-6 font-title text-2xl font-bold">
				Delete {momentNameClean || 'moment'}?
			</h2>
			<div class="flex w-full justify-end gap-2">
				<button
					class="rounded-lg bg-donkey-300 p-2 font-bold text-donkey-700 hover:bg-donkey-400 dark:bg-donkey-700 dark:text-donkey-200 dark:hover:bg-donkey-600"
					onpointerup={() => {
						vibrate();
						showDeleteModal = false;
					}}
				>
					Cancel
				</button>
				<button
					class="rounded-lg bg-robin-600 p-2 font-bold text-robin-200 hover:bg-robin-500 dark:bg-robin-700 dark:hover:bg-robin-600"
					onpointerup={async () => {
						vibrate([20, 3, 3]);
						if (!moment) showDeleteModal = false;
						await moment!.delete();
						goto('/all/moments', { replaceState: true });
					}}
				>
					Delete
				</button>
			</div>
		</div>
	</div>
{/snippet}

<svelte:head>
	<title>
		{moment ? momentNameClean || 'Untitled moment' : 'Loading...'}
	</title>
</svelte:head>
