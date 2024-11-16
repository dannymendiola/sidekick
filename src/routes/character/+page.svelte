<script lang="ts">
	import { QLEditor, TextPicker, vibrate } from '$lib';
	import { type CharacterAttr } from '$lib/types/db.d';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { db, type Character } from '$lib/db';
	import { liveQuery } from 'dexie';

	const charId = $derived($page.url.searchParams.get('id'));

	$effect(() => {
		if (charId) {
			db.characters.get(charId).then((c) => {
				if (!c) {
					goto('/all/characters');
				}
			});
		}
	});

	let editing = $state({
		identity: false,
		arc: false,
		personality: false
	});

	const sectionName = {
		identity: 'Appearance & Identity',
		arc: 'Character Arc',
		personality: 'Personality & Psyche'
	};

	let characterQuery = //$derived(
		liveQuery(() => {
			return db.characters.get(charId!);
		});
	//);
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

	let charName = $state('');
	let charNameCleaned = $derived(charName?.replaceAll('\n', ''));

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
			gender: 'Gender',
			hair_color: 'Hair Color',
			eye_color: 'Eye Color',
			sexuality: 'Sexuality',
			height: 'Height',
			body_type: 'Body Type',
			complexion: 'Complexion',
			disabilities: 'Disabilities',
			languages: 'Languages',
			fashion_style: 'Fashion/Style'
		},
		arc: {
			role: 'Role',
			goals: 'Goals',
			motivation: 'Motivation',
			moral_code: 'Moral Code',
			backstory: 'Backstory',
			arc_start: 'Starting point',
			arc_driver: 'What drives development',
			arc_end: 'End point'
		},
		personality: {
			strengths: 'Strengths',
			weaknesses: 'Weaknesses',
			flaws: 'Flaws',
			secrets: 'Secrets',
			fears: 'Fears',
			passions: 'Passions',
			communication_style: 'Communication Style',
			emotional_availability: 'Emotional Availability',
			conflict_resolution: 'Conflict Resolution Style',
			self_esteem: 'Self Esteem',
			insecurities: 'Insecurities',
			emotional_intelligence: 'Emotional Intelligence',
			social_skills: 'Social Skills',
			charisma: 'Charisma',
			coping_mechanisms: 'Coping Mechanisms',
			emotional_stability: 'Emotional Stability',
			ambition: 'Ambition/Drive',
			phobias: 'Phobias',
			habits: 'Habits',
			quirks: 'Quirks',
			hobbies: 'Hobbies',
			philosophy: 'Life Philosophy',
			religion: 'Religion',
			introvert_extrovert: 'Introvert or Extrovert',
			optimist_pessimist: 'Optimist or Pessimist'
		}
	};

	const attrKeys = (section: Section) => {
		return Object.keys(attrDisplayNames[section]) as Array<keyof CharacterAttr>;
	};

	const getAttribute = (key: keyof CharacterAttr) => {
		return character?.attr?.[key] || '';
	};

	let liveAttr = $state({} as CharacterAttr);

	const dynamics = liveQuery(() => character?.getDynamics() || []);

	const numAttr = $derived(attrCount.arc + attrCount.identity + attrCount.personality);

	let showDeleteModal = $state(false);

	let initClean = false;
	$effect(() => {
		if (character && !initClean) {
			character.cleanAttr();
			initClean = true;
		}
	});
</script>

{#if showDeleteModal}
	{@render DeleteModal()}
{/if}

<div class="sk-content md:mt-16">
	<h1 class="invisible absolute">{charName}</h1>
	{#await db.characters.get(charId!) then char}
		<div class="flex w-full items-center justify-between">
			<div class=" w-full font-title font-bold">
				<QLEditor
					id="char-name"
					initText={char?.name}
					inputMode="info"
					twBG="bg-donkey-100 dark:bg-donkey-950"
					twText="text-donkey-900 dark:text-donkey-50"
					twClass="[&>.ql-editor]:pl-0 drop-shadow-none max-w-[80%] [&>.ql-editor>*]:font-title [&>.ql-editor>*]:text-3xl cursor-pointer"
					onkeyup={async () => {
						if (charId) {
							await db.characters.update(charId, { name: charName });
						}
					}}
					onfocusout={async () => {
						if (charId) {
							await db.characters.update(charId, { name: charName });
						}
					}}
					bind:text={charName}
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
					class="size-5 stroke-robin-100 dark:stroke-robin-400"
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
	{#if character}
		{@render AttrSection('arc')}
		{@render AttrSection('personality')}
		{@render AttrSection('identity')}
		<h2 class="mt-6 font-title text-xl font-bold italic">Relationships</h2>
		{#if $dynamics?.length > 0}
			{#each $dynamics as dynamic}
				{#await dynamic.getOther(character.id) then other}
					{other?.name}
				{/await}
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
				<h2 class="cursor-pointer font-title text-xl font-bold italic">
					<button
						onpointerup={() => {
							vibrate();
							editing[section] = !editing[section];
						}}
					>
						{sectionName[section]}
					</button>
				</h2>
				<button
					class="rounded-full bg-genie-500 p-1 dark:bg-genie-950"
					onpointerup={() => {
						vibrate();
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
							title={attrDisplayNames.identity[attrKey]}
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
				{/each}
				{#if !editing.identity && attrCount.identity === 0}
					<button
						class="flex items-center gap-2 [&>*]:hover:text-genie-500 [&>svg]:hover:stroke-genie-500"
						onpointerup={() => {
							editing.identity = true;
						}}
					>
						{@render Icon('pencil-square', {
							twSize: 'size-4',
							twColor: 'stroke-donkey-400 dark:stroke-donkey-600',
							twOther: 'ml-4',
							strokeWidth: 2.5
						})}

						<p class="font-bold text-donkey-400 dark:text-donkey-600">Nothing yet</p>
					</button>
				{/if}
			{:else if section === 'arc'}
				{#each attrKeys('arc') as attrKey (`attr-${attrKey}`)}
					{#if editing.arc || (character?.attr && character.attr[attrKey] !== undefined)}
						{#if ['role'].includes(attrKey)}
							<TextPicker
								selectTitle="Role"
								customTitle="Role"
								options={[
									'Protagonist',
									'Companion',
									'Love interest',
									'Rival',
									'Antagonist',
									'Chorus',
									'Comic relief',
									'Mentor'
								]}
								initValue={attr?.role}
								onfocusout={async () => {
									await character?.updateAttr({ [attrKey]: liveAttr[attrKey] });
									await character?.cleanAttr();
								}}
								onkeyup={async () => {
									await character?.updateAttr({ [attrKey]: liveAttr[attrKey] });
								}}
								onchange={async (newVal: string) => {
									await character?.updateAttr({ [attrKey]: newVal });
									await character?.cleanAttr();
								}}
								onlistbutton={async () => {
									await character?.updateAttr({ [attrKey]: '' });
								}}
								bind:value={liveAttr[attrKey]}
							/>
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
					<button
						class="flex items-center gap-2 [&>*]:hover:text-genie-500 [&>svg]:hover:stroke-genie-500"
						onpointerup={() => {
							editing.arc = true;
						}}
					>
						{@render Icon('pencil-square', {
							twSize: 'size-4',
							twColor: 'stroke-donkey-400 dark:stroke-donkey-600',
							twOther: 'ml-4',
							strokeWidth: 2.5
						})}

						<p class="font-bold text-donkey-400 dark:text-donkey-600">Nothing yet</p>
					</button>
				{/if}
			{:else if section === 'personality'}
				{#each attrKeys('personality') as attrKey (`attr-${attrKey}`)}
					{#if editing.personality || (character?.attr && character.attr[attrKey] !== undefined)}
						{#if [''].includes(attrKey)}
							<TextPicker
								selectTitle="Role"
								options={[
									'Protagonist',
									'Companion',
									'Antagonist',
									'Love interest',
									'Comic relief',
									'Chorus',
									'Mentor'
								]}
								customTitle="Role"
								initValue={attr?.role}
								onfocusout={async () => {
									await character?.updateAttr({ [attrKey]: liveAttr[attrKey] });
									await character?.cleanAttr();
								}}
								onkeyup={async () => {
									await character?.updateAttr({ [attrKey]: liveAttr[attrKey] });
								}}
								onchange={async (newVal: string) => {
									await character?.updateAttr({ [attrKey]: newVal });
									await character?.cleanAttr();
								}}
								onlistbutton={async () => {
									await character?.updateAttr({ [attrKey]: '' });
								}}
								bind:value={liveAttr[attrKey]}
							/>
						{:else}
							<QLEditor
								id={attrKey}
								inputMode="info"
								title={attrDisplayNames['personality'][attrKey]}
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
				{#if !editing.personality && attrCount.personality === 0}
					<button
						class="flex items-center gap-2 [&>*]:hover:text-genie-500 [&>svg]:hover:stroke-genie-500"
						onpointerup={() => {
							editing.personality = true;
						}}
					>
						{@render Icon('pencil-square', {
							twSize: 'size-4',
							twColor: 'stroke-donkey-400 dark:stroke-donkey-600',
							twOther: 'ml-4',
							strokeWidth: 2.5
						})}

						<p class="font-bold text-donkey-400 dark:text-donkey-600">Nothing yet</p>
					</button>
				{/if}
			{/if}
		</section>
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
				Delete {character?.name?.replaceAll('\n', '')}?
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
						if (!character) showDeleteModal = false;
						await character!.delete();
						goto('/all/characters', { replaceState: true });
					}}
				>
					Delete
				</button>
			</div>
		</div>
	</div>
{/snippet}

{#snippet Icon(
	name: 'document-plus' | 'pencil-square' | 'eye-slash' | 'check',
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
		{:else if name === 'check'}
			<path stroke-linecap="round" stroke-linejoin="round" d="m4.5 12.75 6 6 9-13.5" />
		{/if}
	</svg>
{/snippet}

<svelte:head>
	<title>
		{character ? charNameCleaned || 'Character' : 'Loading...'}
	</title>
</svelte:head>
