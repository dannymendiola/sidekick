<script lang="ts">
	import { page } from '$app/stores';
	import type { Character, Dynamic, Location, Moment, Theme } from '$lib/db';
	import { db } from '$lib/db';
	import { skstate, vibrate } from '$lib';
	import { goto } from '$app/navigation';
	import { liveQuery, type Observable } from 'dexie';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';

	const indexTitle = $derived(
		$page.params.elem_index_name
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
		$page.params.elem_index_name as
			| 'moments'
			| 'themes'
			| 'characters'
			| 'character-dynamics'
			| 'locations'
	);

	const elemPathSeg = $derived(indexName.slice(0, -1));

	const tableName = $derived(indexName === 'character-dynamics' ? 'dynamics' : indexName);

	type StoryElem = Moment | Theme | Character | Dynamic | Location;

	let elements: Observable<StoryElem[]> | undefined = $state();
	$effect(() => {
		switch (indexName) {
			case 'moments':
				elements = liveQuery(() => db.moments.orderBy('order').toArray());
				break;
			case 'themes':
				elements = liveQuery(() => db.themes.orderBy('order').toArray());
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

	const touchReorder = async (id: string, direction: 'up' | 'down') => {
		const elem = await db[tableName].get(id);
		if (elem) {
			const after =
				direction === 'up' ? await (await elem.getPrev())?.getPrev() : await elem.getNext();
			// @ts-ignore
			await elem.orderAfter(after ?? (direction === 'up' ? 'root' : 'tail'));
		}
	};

	let elemCount = $derived($elements?.length);

	let hoveredElem: StoryElem | undefined = $state();
	let draggedElem: StoryElem | undefined = $state();

	const handleDragStart = async (e: DragEvent, draggedId: string) => {
		draggedElem = await db[tableName].get(draggedId);
		const node = e.target as HTMLElement;
		node.classList.add('opacity-10');
	};

	const handleDragEnd = (e: DragEvent) => {
		const node = e.target as HTMLElement;
		node.classList.remove('opacity-10');

		if (skstate.touchscreen) {
			const fullATag = node.parentElement as HTMLElement;
			fullATag.classList.remove('opacity-10');
		}
	};

	const handleDrop = async () => {
		if (!draggedElem || !hoveredElem) return;

		const dragDirection =
			hoveredElem.order !== undefined && draggedElem.order !== undefined
				? draggedElem.order < hoveredElem.order
					? 'down'
					: 'up'
				: 'down';

		const elemToOrderAfter = dragDirection === 'down' ? hoveredElem : await hoveredElem.getPrev();

		if (elemToOrderAfter) {
			// @ts-ignore
			await draggedElem.orderAfter(elemToOrderAfter);
		} else {
			await draggedElem.orderAfter(dragDirection === 'down' ? 'tail' : 'root');
		}

		draggedElem = undefined;
	};

	const handleDragEnter = async (elemId: string) => {
		hoveredElem = await db[tableName].get(elemId);
	};

	const handleDragLeave = () => {
		hoveredElem = undefined;
	};
</script>

<div class="sk-content md:mt-28">
	<div class="flex w-full flex-col items-center justify-between gap-3 md:flex-row">
		<h1 class="w-full -rotate-2 text-center font-brand text-3xl uppercase md:text-left md:text-4xl">
			{indexTitle}
		</h1>
		{#if indexTitle !== 'Character Dynamics' && elemCount !== 0}
			<a
				class="flex items-center gap-2 rounded-full bg-genie-500 px-3 py-2 dark:bg-genie-950 md:p-2"
				aria-label="Add {indexTitle.toLowerCase().slice(0, -1)}"
				href={`/${indexTitle.toLowerCase().slice(0, -1)}/new`}
			>
				{@render Plus()}
				<span class="text-sm text-genie-200 dark:text-genie-300 md:hidden">New</span>
			</a>
		{/if}
	</div>
	{#if $elements && $elements.length > 0}
		<div class="mt-4 flex flex-col gap-6 md:mt-16">
			{@render Elements(skstate.touchscreen)}
		</div>
	{:else}
		<div class="flex w-full flex-col items-center justify-center">
			<div
				class="mb-6 mt-[20vh] font-title text-xl font-bold italic dark:text-donkey-400 md:text-2xl"
			>
				No {indexTitle.toLowerCase()} yet
			</div>
			{#if indexTitle !== 'Character Dynamics'}
				<a
					class="flex w-min items-center gap-2 whitespace-nowrap rounded-full bg-genie-500 px-4 py-2 text-genie-100 hover:bg-genie-600 dark:bg-genie-950 dark:hover:bg-genie-900"
					href="/{indexTitle.toLowerCase().slice(0, -1)}/new"
					onpointerup={() => vibrate()}
				>
					{@render Plus()}
					<p class="text-genie-100 dark:text-genie-300">
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

{#snippet Elements(touchscreen: boolean)}
	{#if $elements && $elements.length > 0}
		{#if !touchscreen}
			<!-- desktop list -->
			{#each $elements as element (element.id)}
				<a
					class="rounded-lg bg-donkey-200 p-6 font-title text-xl font-bold italic hover:bg-donkey-300 dark:bg-donkey-900 dark:text-donkey-400 hover:dark:bg-donkey-800 md:text-2xl"
					href="/{elemPathSeg}?id={element.id}"
					draggable={true}
					ondragstart={(e) => handleDragStart(e, element.id)}
					ondragend={(e) => handleDragEnd(e)}
					ondragover={(e) => e.preventDefault()}
					ondragenter={async () => handleDragEnter(element.id)}
					ondragleave={handleDragLeave}
					ondrop={() => handleDrop()}
					animate:flip={{ duration: 200, easing: quintOut }}
				>
					<div class="flex w-full justify-between">
						<h4 class="text-left">
							{indexTitle === 'Moments'
								? (element as Moment).name?.replaceAll('\n', '') || 'Untitled Moment'
								: indexTitle === 'Character Dynamics'
									? ''
									: (element as Character | Theme | Location).name}
							{#if indexTitle === 'Character Dynamics'}
								{#await element.toString() then name}
									{name}
								{/await}
							{/if}
						</h4>
					</div>
					{#if 'tagline' in element}
						<h5 class="mt-2 font-sans text-sm not-italic text-donkey-500 dark:text-donkey-600">
							{element.tagline}
						</h5>
					{/if}
				</a>
			{/each}
		{:else}
			<!-- mobile list -->
			{#each $elements as element (element.id)}
				<div class="flex w-full" animate:flip={{ duration: 200, easing: quintOut }}>
					<a
						class="grow rounded-bl-lg rounded-tl-lg bg-donkey-200 p-6 font-title text-xl font-bold italic dark:bg-donkey-900 dark:text-donkey-400 md:text-2xl"
						href="/{elemPathSeg}?id={element.id}"
					>
						<div class="flex w-full justify-between">
							<h4 class="text-left">
								{indexTitle === 'Moments'
									? (element as Moment).name?.replaceAll('\n', '') || 'Untitled Moment'
									: indexTitle === 'Character Dynamics'
										? ''
										: (element as Character | Theme | Location).name}
								{#if indexTitle === 'Character Dynamics'}
									{#await element.toString() then name}
										{name}
									{/await}
								{/if}
							</h4>
						</div>
						{#if 'tagline' in element}
							<h5 class="mt-2 font-sans text-sm not-italic text-donkey-500 dark:text-donkey-600">
								{element.tagline}
							</h5>
						{/if}
					</a>
					<div
						class="rounded-br-lg rounded-tr-lg bg-donkey-200 font-title text-xl font-bold italic dark:bg-donkey-900 dark:text-donkey-400 md:text-2xl {touchReorderingId ===
						element.id
							? 'px-6'
							: 'p-6'}"
					>
						{#if touchReorderingId !== element.id}
							<button
								class="relative z-[1] h-full max-h-12 rounded-lg bg-donkey-100 p-1 dark:bg-donkey-800"
								aria-label="Reorder"
								onpointerdown={() => {
									vibrate([1, 1, 1]);
									touchReorderingId = element.id;
								}}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									stroke-width="1.5"
									class="size-6 stroke-donkey-700 dark:stroke-donkey-200"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
									/>
								</svg>
							</button>
						{:else}
							<div
								class="flex h-full flex-col justify-evenly gap-[0.1rem] py-2 [&>button>svg]:fill-genie-100"
							>
								<button
									class="z-[1] rounded-lg bg-genie-500 p-2 dark:bg-genie-950"
									aria-label="Reorder"
									onpointerdown={() => {
										vibrate([1, 1, 1]);
										touchReorder(element.id, 'up');
									}}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 16 16"
										class="size-4 stroke-genie-100 dark:stroke-genie-300"
									>
										<path
											fill-rule="evenodd"
											d="M8 14a.75.75 0 0 0 .75-.75V4.56l1.22 1.22a.75.75 0 1 0 1.06-1.06l-2.5-2.5a.75.75 0 0 0-1.06 0l-2.5 2.5a.75.75 0 0 0 1.06 1.06l1.22-1.22v8.69c0 .414.336.75.75.75Z"
											clip-rule="evenodd"
										/>
									</svg>
								</button>
								<button
									class="z-[1] rounded-lg bg-genie-500 p-2 dark:bg-genie-950"
									aria-label="Reorder"
									onpointerdown={() => {
										vibrate([1, 1, 1]);
										touchReorder(element.id, 'down');
									}}
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										viewBox="0 0 16 16"
										class="size-4 stroke-genie-100 dark:stroke-genie-300"
									>
										<path
											d="M8 2a.75.75 0 0 1 .75.75v8.69l1.22-1.22a.75.75 0 1 1 1.06 1.06l-2.5 2.5a.75.75 0 0 1-1.06 0l-2.5-2.5a.75.75 0 1 1 1.06-1.06l1.22 1.22V2.75A.75.75 0 0 1 8 2Z"
										/>
									</svg>
								</button>
							</div>
						{/if}
					</div>
				</div>
			{/each}
		{/if}
	{/if}
{/snippet}

{#snippet Plus()}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke-width="2"
		class="size-4 stroke-genie-200 dark:stroke-genie-300 md:size-6"
	>
		<path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
	</svg>
{/snippet}

<svelte:head>
	<title>{indexTitle}</title>
</svelte:head>
