<script lang="ts">
	import { QLEditor, skstate } from '$lib';
	import { type CharacterAttr } from '$lib/types/db.d';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { addCharacterAfter, db, type Character } from '$lib/db';
	import { Delta } from 'quill/core';
	import { slide } from 'svelte/transition';
	import { liveQuery } from 'dexie';

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

	let characterQuery = liveQuery(() => {
		return db.characters.get(charId!);
	});
	let character: Character | undefined = $derived($characterQuery);

	const attrCount = $derived({
		get identity() {
			return Object.keys(attrDisplayNames.identity).filter(
				(key) => character?.attr?.[key as keyof CharacterAttr] !== undefined
			).length;
		},

		get arc() {
			return Object.keys(attrDisplayNames.arc).filter(
				(key) => character?.attr?.[key as keyof CharacterAttr] !== undefined
			).length;
		},

		get personality() {
			return Object.keys(attrDisplayNames.personality).filter(
				(key) => character?.attr?.[key as keyof CharacterAttr] !== undefined
			).length;
		}
	});

	const attr = $derived(character?.attr);

	const charName = $derived(character?.name || 'Character');

	type Section = 'identity' | 'arc' | 'personality';

	const attrDisplayNames: {
		identity: {
			[K in keyof CharacterAttr]: { name: string; placeholder?: string };
		};
		arc: {
			[K in keyof CharacterAttr]: string;
		};
		personality: {
			[K in keyof CharacterAttr]: string;
		};
	} = {
		identity: {
			age: { name: 'Age' },
			birthday: { name: 'Birthday' },
			gender: { name: 'Gender' },
			hair_color: { name: 'Hair Color' },
			eye_color: { name: 'Eye Color' },
			sexuality: { name: 'Sexuality' },
			height: { name: 'Height' },
			body_type: { name: 'Body Type' },
			complexion: { name: 'Complexion' },
			disabilities: { name: 'Disabilities' },
			languages: { name: 'Languages' },
			fashion_style: { name: 'Fashion/Style' }
		},
		arc: {
			role: 'Role',
			goals: 'Goals',
			motivation: 'Motivation',
			moral_code: 'Moral Code',
			backstory: 'Backstory'
		},
		personality: {}
	};

	const attrKeys = (section: Section) => {
		return Object.keys(attrDisplayNames[section]) as Array<keyof CharacterAttr>;
	};

	const getAttribute = (key: keyof CharacterAttr) => {
		return character?.attr?.[key] || '';
	};

	// let currDelta: Delta | undefined = $state();

	// const currText = $derived.by(() => {
	// 	return currDelta?.ops
	// 		.map((op) => (op.insert ? (op.insert ? (op.insert as string).slice(0, -1) : '') : ''))
	// 		.join('');
	// });

	let liveAttr = $state({} as CharacterAttr);

	// const currText = $derived(character?.attr?.role || '');

	const dynamics = liveQuery(() => character?.getDynamics() || []);

	const numAttr = $derived(attrCount.arc + attrCount.identity + attrCount.personality);

	$effect(() => {
		console.log({ liveAttr });
	});
</script>

<div class="sk-content md:mt-16">
	<h1 class="font-title text-3xl font-bold">{charName}</h1>
	{#if character}
		{@render AttrSection('identity')}
		{@render AttrSection('arc')}
		{@render AttrSection('personality')}
		<h2 class="mt-6 font-title text-xl font-bold italic">Relationships</h2>
		{#if $dynamics?.length > 0}
			{#each $dynamics as dynamic}
				dynamic!
			{/each}
		{:else}
			no dynamics :(
		{/if}
		<h2 class="mt-6 font-title text-xl font-bold italic">Moments</h2>
		{#await character.getMoments() then moments}
			{#if moments.length > 0}
				hello
			{:else}
				no moments
			{/if}
		{/await}
	{/if}
	{#if numAttr < 10}
		<div class="h-[40vh]"></div>
	{:else}
		<div class="h-[20vh]"></div>
	{/if}
</div>

{#snippet AttrSection(section: keyof typeof editing)}
	{#if character}
		<section class="mb-8 mt-4 flex flex-col gap-2">
			<div class="mb-3 flex items-center gap-4">
				<h2 class="font-title text-xl font-bold italic">{sectionName[section]}</h2>
				<button
					class="rounded-full bg-genie-500 p-1 dark:bg-genie-950"
					onpointerup={() => {
						editing[section] = !editing[section];
					}}
					title="{editing[section] ? 'Hide' : 'Show'} unchanged"
				>
					{#if editing[section]}
						{@render Icon('eye-slash', {})}
					{:else}
						{@render Icon('pencil-square', {})}
					{/if}
				</button>
			</div>
			{#if section === 'identity'}
				{#each attrKeys('identity') as attrKey (`attr-${attrKey}`)}
					{#if editing.identity || (character?.attr && character.attr[attrKey] !== undefined)}
						<QLEditor
							id={attrKey}
							inputMode="info"
							title={attrDisplayNames.identity[attrKey]?.name}
							initText={getAttribute(attrKey)}
							placeholder={attrDisplayNames['identity'][attrKey]?.placeholder}
							onfocusout={async () => {
								await character?.updateAttr({ [attrKey]: liveAttr[attrKey] });
								await character?.cleanAttr();
							}}
							onkeyup={async () => {
								await character?.updateAttr({ [attrKey]: liveAttr[attrKey] });
							}}
							bind:text={liveAttr[attrKey]}
						/>
					{/if}
				{/each}
				{#if !editing.identity && attrCount.identity === 0}
					<div class="flex items-center gap-2">
						{@render Icon('document-plus', {
							twSize: 'size-4',
							twColor: 'stroke-donkey-400 dark:stroke-donkey-600',
							twOther: 'ml-4',
							strokeWidth: 2.5
						})}

						<p class="font-bold text-donkey-400 dark:text-donkey-600">Nothing yet</p>
					</div>
				{/if}
			{:else if section === 'arc'}
				{#each attrKeys('arc') as attrKey (`attr-${attrKey}`)}
					{#if editing.arc || (character?.attr && character.attr[attrKey] !== undefined)}
						{#if attrKey === 'role'}
							role picker
						{:else}
							<QLEditor
								id={attrKey}
								inputMode="info"
								title={attrDisplayNames['arc'][attrKey]}
								initText={getAttribute(attrKey)}
								onfocusout={async () => {
									await character?.updateAttr({ [attrKey]: liveAttr[attrKey] });
									await character?.cleanAttr();
								}}
								onkeyup={async () => {
									await character?.updateAttr({ [attrKey]: liveAttr[attrKey] });
								}}
								bind:text={liveAttr[attrKey]}
							/>
						{/if}
					{/if}
				{/each}
				{#if !editing.arc && attrCount.arc === 0}
					<div class="flex items-center gap-2">
						{@render Icon('document-plus', {
							twSize: 'size-4',
							twColor: 'stroke-donkey-400 dark:stroke-donkey-600',
							twOther: 'ml-4',
							strokeWidth: 2.5
						})}

						<p class="font-bold text-donkey-400 dark:text-donkey-600">Nothing yet</p>
					</div>
				{/if}
			{:else if section === 'personality'}
				<h3>personality</h3>
			{/if}
		</section>
	{/if}
{/snippet}

{#snippet Icon(
	name: 'document-plus' | 'pencil-square' | 'eye-slash',
	{
		twSize = 'size-5',
		twColor = 'stroke-genie-100 dark:stroke-genie-300',
		twOther = '',
		strokeWidth = 2
	}
)}
	<svg
		xmlns="http://www.w3.org/2000/svg"
		fill="none"
		viewBox="0 0 24 24"
		stroke-width={strokeWidth}
		class="{twSize} {twColor} {twOther}"
	>
		{#if name === 'document-plus'}
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m3.75 9v6m3-3H9m1.5-12H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
			/>
		{:else if name === 'pencil-square'}
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
			/>
		{:else if name === 'eye-slash'}
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
			/>
		{/if}
	</svg>
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
