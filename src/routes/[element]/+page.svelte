<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Character, db, Dynamic, Moment, Location } from '$lib/db';
	import { vibrate } from '$lib';
	import { liveQuery, type Observable } from 'dexie';
	import EditorMoment from './EditorMoment.svelte';
	import ElemHeader from './ElemHeader.svelte';

	type ElemType = 'moment' | 'character' | 'character-dynamic' | 'location';
	const elemType = page.params.element as ElemType;

	const table = $derived.by(() => {
		switch (elemType) {
			case 'moment':
				return db.moments;
			case 'character':
				return db.characters;
			case 'character-dynamic':
				return db.dynamics;
			case 'location':
				return db.locations;
		}
	});

	const elemID = $derived(page.url.searchParams.get('id'));

	$effect(() => {
		if (elemID) {
			table.get(elemID).then((e) => {
				if (!e) {
					goto(`/all/${elemType}s`);
				}
			});
		}
	});

	// type Elem = Location | Character | Dynamic | Moment;
	type ElemQuery = Observable<Location | Character | Dynamic | Moment | undefined>;
	let query: ElemQuery | undefined = $state();

	switch (elemType) {
		case 'moment':
			query = liveQuery(() => db.moments.get(elemID || ''));
			break;
		case 'character':
			query = liveQuery(() => db.characters.get(elemID || ''));
			break;
		case 'character-dynamic':
			query = liveQuery(() => db.dynamics.get(elemID || ''));
			break;
		case 'location':
			query = liveQuery(() => db.locations.get(elemID || ''));
			break;
	}

	const element = $derived($query);

	let elemName = $state('');
	let elemNameClean = $derived(elemName?.replaceAll('\n', ''));

	let elemEmoji = $derived.by(() => {
		switch (elemType) {
			case 'moment':
				return '🎞️';
			case 'character':
				return '🪪';
			case 'character-dynamic':
				return '👥';
			case 'location':
				return '📍';
		}
	});

	let showDeleteModal = $state(false);
</script>

{#if showDeleteModal}
	{@render DeleteModal()}
{/if}

<div class="sk-content mb-32 md:mt-16">
	{#if element}
		<!-- <h1 class="invisible absolute">
			{elemNameClean}
		</h1> -->

		<!-- <div class="top-0 z-[9] flex flex-col bg-donkey-50 dark:bg-donkey-950 md:sticky">
			{#if elemType === 'moment'}
				<EditorMoment moment={element as Moment} />
			{/if}
		</div> -->
		<ElemHeader {elemType} {element} />
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
				Delete {elemNameClean || elemType.replaceAll('-', ' ')}?
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
						if (!element) showDeleteModal = false;
						await element!.delete();
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
	<title>{`${elemEmoji} ${elemNameClean || 'Untitled'}`}</title>
</svelte:head>
