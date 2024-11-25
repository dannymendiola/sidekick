<script lang="ts">
	import { page } from '$app/stores';
	import type { Character, Dynamic, Location, Moment, Theme } from '$lib/db';
	import { db } from '$lib/db';
	import { skstate, vibrate } from '$lib';
	import { goto } from '$app/navigation';
	import { liveQuery, type Observable } from 'dexie';
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';
	import { polyfill } from 'mobile-drag-drop';

	polyfill();

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

	let elemCount = $derived($elements?.length);

	let hoveredElem: StoryElem | undefined = $state();
	let draggedElem: StoryElem | undefined = $state();

	const handleDragStart = async (e: DragEvent, draggedId: string) => {
		draggedElem = await db[tableName].get(draggedId);
		const node = e.target as HTMLElement;

		if (!skstate.touchscreen) {
			node.classList.add('opacity-10');
		} else {
			// vibrate(1);
			const fullATag = node.parentElement as HTMLElement;
			fullATag.classList.add('opacity-10');

			const clone = fullATag.cloneNode(true) as HTMLElement;
			const rect = fullATag.getBoundingClientRect();
			clone.style.position = 'absolute';
			clone.style.top = `${-rect.width}px`;

			document.body.appendChild(clone);

			// const rect = node.getBoundingClientRect();
			// const offsetX = e.clientX - parentRect.left;
			// const offsetY = e.clientY - parentRect.top;

			e.dataTransfer?.setDragImage(clone, 0, 0);

			console.log('hello');
		}
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
			<!-- {#each $elements as element (element.id)}
				<a
					class="rounded-lg bg-donkey-200 p-6 font-title text-xl font-bold italic hover:bg-donkey-300 dark:bg-donkey-900 dark:text-donkey-400 hover:dark:bg-donkey-800 md:text-2xl"
					href="/{elemPathSeg}?id={element.id}"
					draggable={!skstate.touchscreen}
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
				</a>
			{/each} -->
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
				</a>
			{/each}
		{:else}
			<!-- mobile list -->
			{#each $elements as element (element.id)}
				<div class="flex w-full">
					<a
						class="relative grow rounded-bl-lg rounded-tl-lg bg-donkey-200 p-6 font-title text-xl font-bold italic after:content-[''] hover:bg-donkey-300 dark:bg-donkey-900 dark:text-donkey-400 hover:dark:bg-donkey-800 md:text-2xl"
						href="/{elemPathSeg}?id={element.id}"
						draggable={!skstate.touchscreen}
						ondragstart={(e) => handleDragStart(e, element.id)}
						ondragend={(e) => handleDragEnd(e)}
						ondragover={(e) => e.preventDefault()}
						ondragenter={async () => handleDragEnter(element.id)}
						ondragleave={handleDragLeave}
						ondrop={() => handleDrop()}
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
					</a>
					<button
						class="rounded-br-lg rounded-tr-lg bg-donkey-200 p-6 font-title text-xl font-bold italic hover:bg-donkey-300 dark:bg-donkey-900 dark:text-donkey-400 hover:dark:bg-donkey-800 md:text-2xl"
						draggable={true}
						ondragstart={(e) => handleDragStart(e, element.id)}
						ondragend={(e) => handleDragEnd(e)}
						ondragover={(e) => e.preventDefault()}
						ondragenter={async () => handleDragEnter(element.id)}
						ondragleave={handleDragLeave}
						ondrop={() => handleDrop()}
						onpointerdown={() => vibrate([1, 1, 1])}
					>
						{@render OrderButton()}
					</button>
				</div>
			{/each}
		{/if}
	{/if}
{/snippet}

{#snippet OrderButton()}
	<!-- <button class="z-[1]"> -->
	<button
		class="relative z-[1] h-full rounded-lg bg-donkey-300 p-1 dark:bg-donkey-800"
		aria-label="Reorder"
		onpointerdown={() => vibrate([1, 1, 1])}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			class="size-6 stroke-donkey-800 dark:stroke-donkey-200"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
			/>
		</svg>
	</button>
	<!-- </button> -->
	<!-- <button
		class="z-[1] rounded-lg bg-donkey-300 p-1 dark:bg-donkey-800"
		aria-label="Reorder"
		onpointerup={() => vibrate()}
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			class="size-6 stroke-donkey-800 dark:stroke-donkey-200"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9"
			/>
		</svg>
	</button> -->
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
