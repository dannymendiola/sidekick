<script lang="ts">
	import { page } from '$app/state';
	import type { Character, Dynamic, Location, Moment } from '$lib/db';
	import { db } from '$lib/db';
	import { skstate, vibrate } from '$lib';
	import { goto } from '$app/navigation';
	import { liveQuery, type Observable } from 'dexie';
	import ElemPreview from './elem-preview.svelte';

	const indexTitle = $derived(
		page.params.index
			.replace(/-/g, ' ')
			.replace(/\w\S*/g, (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase())
	);

	$effect(() => {
		if (
			!['Moments', 'Themes', 'Characters', 'Character Dynamics', 'Locations'].includes(indexTitle)
		) {
			goto('/welcome');
		}
	});

	const indexName = $derived(
		page.params.index as 'moments' | 'characters' | 'character-dynamics' | 'locations'
	);

	const selectionColor = $derived.by(() => {
		switch (indexName) {
			case 'moments':
				return 'yellow';
			case 'character-dynamics':
				return 'purple';
			case 'characters':
				return 'blue';
			case 'locations':
				return 'green';
		}
	});

	$effect(() => {
		indexName;
		touchReorderingId = undefined;
	});

	const tableName = $derived(indexName === 'character-dynamics' ? 'dynamics' : indexName);

	type StoryElem = Moment | Character | Dynamic | Location;

	let elements: Observable<StoryElem[]> | undefined = $state();
	$effect(() => {
		switch (indexName) {
			case 'moments':
				elements = liveQuery(() => db.moments.orderBy('order').toArray());
				break;
			case 'characters':
				elements = liveQuery(() => db.characters.orderBy('order').toArray());
				break;
			case 'character-dynamics':
				elements = liveQuery(() => db.dynamics.orderBy('order').toArray());
				break;
			case 'locations':
				elements = liveQuery(() => db.locations.orderBy('order').toArray());
				break;
		}
	});

	let touchReorderingId = $state<string | undefined>();

	type Index = 'moments' | 'characters' | 'character-dynamics' | 'locations';

	const twAddBtn: { [K in Index]: { bg: string; icon: string; text: string } } = {
		moments: {
			bg: 'border bg-smithers-300 border-smithers-600 dark:border-smithers-800 hover:bg-smithers-600 dark:bg-smithers-950 dark:hover:bg-smithers-900',
			icon: 'stroke-smithers-950 dark:stroke-smithers-300',
			text: 'text-smithers-950 dark:text-smithers-300'
		},
		characters: {
			bg: 'border bg-genie-400 border-genie-600 dark:border-genie-800 hover:bg-genie-500 dark:bg-genie-950 dark:hover:bg-genie-900',
			icon: 'stroke-genie-900 dark:stroke-genie-300',
			text: 'text-genie-900 dark:text-genie-300'
		},
		locations: {
			bg: 'border bg-wazowski-200 border-wazowski-600 dark:border-wazowski-800 hover:bg-wazowski-500 dark:bg-wazowski-950 dark:hover:bg-wazowski-900',
			icon: 'stroke-wazowski-900 dark:stroke-wazowski-300',
			text: 'text-wazowski-900 dark:text-wazowski-300'
		},
		'character-dynamics': {
			bg: '',
			icon: '',
			text: ''
		}
	};

	// const touchReorder = async (id: string, direction: 'up' | 'down') => {
	// 	const elem = await db[tableName].get(id);
	// 	if (elem) {
	// 		const after =
	// 			direction === 'up' ? await (await elem.getPrev())?.getPrev() : await elem.getNext();
	// 		// @ts-ignore
	// 		await elem.orderAfter(after ?? (direction === 'up' ? 'root' : 'tail'));
	// 	}
	// };

	// let elemCount = $derived($elements?.length);

	// let hoveredElem: StoryElem | undefined = $state();
	// let draggedElem: StoryElem | undefined = $state();

	// const handleDragStart = async (e: DragEvent, draggedId: string) => {
	// 	draggedElem = await db[tableName].get(draggedId);
	// 	const node = e.target as HTMLElement;
	// 	node.classList.add('opacity-10');
	// };

	// const handleDragEnd = (e: DragEvent) => {
	// 	const node = e.target as HTMLElement;
	// 	node.classList.remove('opacity-10');

	// 	if (skstate.touchscreen) {
	// 		const fullATag = node.parentElement as HTMLElement;
	// 		fullATag.classList.remove('opacity-10');
	// 	}
	// };

	// const handleDrop = async () => {
	// 	if (!draggedElem || !hoveredElem) return;

	// 	const dragDirection =
	// 		hoveredElem.order !== undefined && draggedElem.order !== undefined
	// 			? draggedElem.order < hoveredElem.order
	// 				? 'down'
	// 				: 'up'
	// 			: 'down';

	// 	const elemToOrderAfter = dragDirection === 'down' ? hoveredElem : await hoveredElem.getPrev();

	// 	if (elemToOrderAfter) {
	// 		// @ts-ignore
	// 		await draggedElem.orderAfter(elemToOrderAfter);
	// 	} else {
	// 		await draggedElem.orderAfter(dragDirection === 'down' ? 'tail' : 'root');
	// 	}

	// 	draggedElem = undefined;
	// };

	// const handleDragEnter = async (elemId: string) => {
	// 	hoveredElem = await db[tableName].get(elemId);
	// };

	// const handleDragLeave = () => {
	// 	hoveredElem = undefined;
	// };
</script>

{#if $elements}
	<div class="sk-content md:mt-28">
		<div class="flex w-full flex-col items-center justify-between gap-3 md:flex-row">
			<h1 class="w-full text-center font-serif text-3xl font-bold md:text-left md:text-4xl">
				{indexTitle === 'Moments' ? 'Outline' : indexTitle}
			</h1>
			{#if $elements.length > 0 && indexName !== 'character-dynamics'}
				<a
					href="/{page.params.index.slice(0, -1)}/new"
					class="flex items-center gap-2 rounded-xl p-2 {twAddBtn[indexName].bg}"
				>
					{@render Plus()}
					<div class="md:hidden {twAddBtn[indexName].text}">Add</div>
				</a>
			{/if}
		</div>
		{#if $elements.length > 0}
			<div class="mt-4 flex flex-col gap-6 md:mt-16">
				{#each $elements as element (element.id)}
					<ElemPreview
						id={element.id}
						table={tableName}
						collapsed={element.previewCollapsed}
						{selectionColor}
					/>
				{/each}
			</div>
		{:else}
			<div class="flex w-full flex-col items-center justify-center">
				<div
					class="mb-6 mt-[20vh] font-title text-xl font-bold italic dark:text-donkey-400 md:text-2xl"
				>
					No {page.params.index} yet
				</div>
				{#if indexTitle !== 'Character Dynamics'}
					<a
						class="flex w-min items-center gap-2 whitespace-nowrap rounded-lg px-4 py-2 {twAddBtn[
							indexName
						].bg}"
						href="/{indexTitle.toLowerCase().slice(0, -1)}/new"
						onpointerup={() => vibrate()}
					>
						{@render Plus()}
						<p class={twAddBtn[indexName].text}>
							Add a new {indexTitle.toLowerCase().slice(0, -1)}
						</p>
					</a>
				{:else}
					<div class="text-donkey-700 dark:text-donkey-400">
						Create one from within a
						<a href="/all/characters" class="text-genie-500 hover:underline"> character sheet </a>
					</div>
				{/if}
			</div>
		{/if}
		<div class="h-24"></div>
	</div>
{/if}

{#snippet Plus()}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="2"
		class="size-4 md:size-6 {twAddBtn[indexName].icon}"
	>
		<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
	</svg>
{/snippet}

<svelte:head>
	<title>{indexTitle}</title>
</svelte:head>
