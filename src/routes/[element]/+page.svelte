<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Character, db, Dynamic, Section, Location } from '$lib/db';
	import { liveQuery, type Observable } from 'dexie';
	import { vibrate, SKInput } from '$lib';

	type ElemType = 'section' | 'character' | 'character-dynamic' | 'location';
	const elemType = page.params.element as ElemType;

	const table = $derived.by(() => {
		switch (elemType) {
			case 'section':
				return db.sections;
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

	type ElemQuery = Observable<Location | Character | Dynamic | Section | undefined>;
	let query: ElemQuery | undefined = $state();

	switch (elemType) {
		case 'section':
			query = liveQuery(() => db.sections.get(elemID || ''));
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

	let elemName: string | undefined = $state();

	const initName = async () => {
		const e = await table.get(elemID || '');
		if (e) {
			elemName = elemType === 'character-dynamic' ? await e.toString() : e.name;
		}
	};

	initName();

	const updateElem = async (params: Object) => {
		switch (elemType) {
			case 'section':
				await db.sections.update(elemID || '', params);
				break;
			case 'character':
				await db.characters.update(elemID || '', params);
				break;
			case 'character-dynamic':
				await db.dynamics.update(elemID || '', params);
				break;
			case 'location':
				await db.locations.update(elemID || '', params);
				break;
		}
	};

	let elemEmoji = $derived.by(() => {
		switch (elemType) {
			case 'section':
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

	let elemBody = $state('');
</script>

{#if showDeleteModal}
	{@render DeleteModal()}
{/if}

<div class="sk-content mb-32 md:mt-0">
	{@render ElemHeader()}
	{#if element}
		<SKInput
			boundField={{
				entityID: elemID || '',
				entityTable: table,
				fieldName: 'body',
				bindAs: 'html'
			}}
			placeholder="Describe the {elemType.replaceAll('-', ' ')}..."
		/>
	{/if}
</div>

{#snippet ElemHeader()}
	{#if element}
		{#if elemType !== 'character-dynamic'}
			<h1 class="invisible absolute">
				{elemName}
			</h1>
		{/if}
		<div class="top-0 z-[9] flex flex-col bg-donkey-50 pt-24 dark:bg-donkey-950 md:sticky">
			<div class="w-full font-title font-bold">
				{#if elemType !== 'character-dynamic'}
					<SKInput
						boundField={{
							entityID: elemID || '',
							entityTable: table,
							fieldName: 'name',
							bindAs: 'text'
						}}
						placeholder="{elemType === 'section' ? 'Untitled' : 'Unnamed'} {elemType}"
						disableLineBreak
						twClass="mb-4 text-4xl"
						bind:text={elemName}
					/>
				{:else}
					{#await (element as Dynamic).toString() then name}
						<h1 class="text-3xl">
							{name}
						</h1>
					{/await}
				{/if}
			</div>
		</div>
	{/if}
{/snippet}

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
				Delete {elemName || elemType.replaceAll('-', ' ')}?
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
						goto('/all/sections', { replaceState: true });
					}}
				>
					Delete
				</button>
			</div>
		</div>
	</div>
{/snippet}

<svelte:head>
	<title
		>{`${elemEmoji} ${elemType === 'character-dynamic' ? 'Character dynamic' : elemName || 'Untitled'}`}</title
	>
</svelte:head>
