<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { Character, db, Dynamic, Moment, Location } from '$lib/db';
	import { liveQuery, type Observable } from 'dexie';
	import { vibrate, QLEditor } from '$lib';

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
	$inspect($query);

	let elemName = $state('');
	let elemNameClean = $derived(elemName?.replaceAll('\n', ''));

	const updateElem = async (params: Object) => {
		switch (elemType) {
			case 'moment':
				await db.moments.update(elemID || '', params);
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

	let elemBody = $state('');
</script>

{#if showDeleteModal}
	{@render DeleteModal()}
{/if}

<div class="sk-content mb-32 md:mt-16">
	{@render ElemHeader()}
	{#if element}
		<QLEditor
			id="body"
			inputMode="full"
			toolbar={false}
			twBG="bg-donkey-50 dark:bg-donkey-950"
			twClass="border border-donkey-200 dark:border-donkey-300"
			initText={element.body || ''}
			placeholder="Describe the {elemType.replaceAll('-', ' ')}..."
			onkeyup={async () => {
				await updateElem({ body: elemBody });
			}}
			onfocusout={async () => {
				await updateElem({ body: elemBody });
			}}
			bind:text={elemBody}
		/>
	{/if}
</div>

{#snippet ElemHeader()}
	{#if element}
		{#if elemType !== 'character-dynamic'}
			<h1 class="invisible absolute">
				{elemNameClean}
			</h1>
		{/if}
		<div class="top-0 z-[9] flex flex-col bg-donkey-50 dark:bg-donkey-950 md:sticky">
			<div class="w-full font-title font-bold">
				{#if elemType !== 'character-dynamic'}
					<QLEditor
						id="elemName"
						initText={element.name || ''}
						placeholder="Untitled {elemType}"
						inputMode="info"
						twBG="bg-donkey-50 dark:bg-donkey-950"
						twText="text-donkey-900 dark:text-donkey-50"
						twClass="[&>.ql-editor]:pl-0 drop-shadow-none max-w-[80%] [&>.ql-editor>*]:font-title [&>.ql-editor>*]:text-3xl cursor-pointer [&>.ql-editor::before]:font-title [&>.ql-editor::before]:text-3xl [&>.ql-editor::before]:!italic [&>.ql-editor::before]:dark:text-donkey-700 [&>.ql-editor::before]:text-donkey-300"
						onkeyup={async () => {
							await updateElem({ name: elemName });
						}}
						onfocusout={async () => {
							await updateElem({ name: elemName });
						}}
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
	<title
		>{`${elemEmoji} ${elemType === 'character-dynamic' ? 'Character dynamic' : elemNameClean || 'Untitled'}`}</title
	>
</svelte:head>
