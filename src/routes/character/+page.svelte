<script lang="ts">
	import { QLEditor, skstate } from '$lib';
	import { type CharacterAttr } from '$lib/types/db.d';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { addCharacterAfter, db, type Character } from '$lib/db';
	import { Delta } from 'quill/core';
	import { slide } from 'svelte/transition';

	const charId = $page.url.searchParams.get('id');

	const newChar = async () => {
		let character = await addCharacterAfter('tail', {});
		if (character) {
			goto(`/character?id=${character.id}}`);
		} else {
			goto('/all/characters');
		}
	};
	if (charId === 'new') {
		newChar();
	}

	let editing = $state({
		identity: false,
		arc: false,
		personality: false
	});

	const sectionName = {
		identity: 'Appearance & Identity',
		arc: 'Character Arc',
		personality: 'Personality'
	};

	let character: Character | undefined = $state();
	const charName = $derived(character?.name || 'Character');

	const loadCharacterId = async () => {
		if (!charId) {
			goto('/all/characters');
		} else {
			character = await db.characters.get(charId);
			if (!character) {
				goto('/all/characters');
			}
		}
	};
	loadCharacterId();

	type Section = 'identity' | 'arc' | 'personality';

	const attrDisplayNames: {
		identity: {
			[K in keyof CharacterAttr]: string;
		};
		arc: {
			[K in keyof CharacterAttr]: string;
		};
		personality: {
			[K in keyof CharacterAttr]: string;
		};
	} = {
		identity: {
			age: 'Age',
			birthday: 'Birthday',
			gender: 'Gender'
		},
		arc: {},
		personality: {}
	};

	const attrKeys = (section: Section) => {
		return Object.keys(attrDisplayNames[section]) as Array<keyof CharacterAttr>;
	};

	const getAttribute = (key: keyof CharacterAttr) => {
		return character?.attr?.[key] || '';
	};

	$effect(() => {
		console.log({ editing });
	});

	let blurTimeout: NodeJS.Timeout | undefined = $state();

	let currDelta: Delta | undefined = $state();
	const currText = $derived.by(() => {
		if (!currDelta) return '';

		const text = currDelta.ops
			.map((op) => (op.insert ? (op.insert ? (op.insert as string).slice(0, -1) : '') : ''))
			.join('');
		return text;
	});
	const sectionCount = $derived.by(() => {});
</script>

<div class="sk-content md:my-16">
	<h1 class="font-title text-3xl font-bold">{charName}</h1>
	{#if character}
		{@render AttrSection('identity')}
		{@render AttrSection('arc')}
		{@render AttrSection('personality')}
		<h2 class="mt-6 font-title text-xl font-bold italic">Relationships</h2>
		{#await character.getDynamics() then dynamics}
			{#if dynamics.length > 0}
				hello
			{:else}
				hello hello
			{/if}
		{/await}
		<h2 class="mt-6 font-title text-xl font-bold italic">Moments</h2>
		{#await character.getMoments() then moments}
			{#if moments.length > 0}
				hello
			{:else}
				hello hello
			{/if}
		{/await}
	{/if}
</div>

{#snippet AttrSection(section: keyof typeof editing)}
	{#if character}
		<section class="mb-8 mt-4 flex flex-col gap-2">
			<div class="mb-3 flex items-center gap-4">
				<h2 class="font-title text-xl font-bold italic">{sectionName[section]}</h2>
				<button
					class="rounded-full bg-genie-500 p-2 dark:bg-genie-950"
					onpointerup={() => {
						editing[section] = !editing[section];
					}}
				>
					{#if editing[section]}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							class="size-5 stroke-genie-100 dark:stroke-genie-300"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25"
							/>
						</svg>
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
							stroke-width="1.5"
							stroke="currentColor"
							class="size-5"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								d="M3.75 5.25h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5m-16.5 4.5h16.5"
							/>
						</svg>
					{/if}
				</button>
			</div>
			{#if section === 'identity'}
				{#each attrKeys('identity') as attrKey}
					{#if editing.identity || (character.attr && character.attr[attrKey])}
						<span transition:slide={{ duration: 300 }}>
							<QLEditor
								id={attrKey}
								inputMode="info"
								title={attrDisplayNames['identity'][attrKey]}
								initText={getAttribute(attrKey)}
								onfocusin={() => {
									console.log('focusin');
								}}
								onfocusout={() => {
									// TODO save
									// character?.updateAttr({ [attrKey]: currText });
									character?.updateAttr({ [attrKey]: currText });
								}}
								bind:text={currDelta}
							/>
						</span>
					{/if}
				{/each}
			{:else if section === 'arc'}
				<h3>arc</h3>
			{:else if section === 'personality'}
				<h3>personality</h3>
			{/if}
		</section>
	{/if}
{/snippet}

<svelte:head>
	<title
		>{charId === 'new'
			? 'New Character'
			: character
				? `${(character as Character).name || 'Character'}`
				: 'Edit Character'}</title
	>
</svelte:head>
