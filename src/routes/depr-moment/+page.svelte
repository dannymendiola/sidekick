<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { QLEditor, vibrate } from '$lib';
	import { db } from '$lib/db';
	import { type SectionAttr } from '$lib/types/db.d';
	import { liveQuery } from 'dexie';
	import Delta from 'quill-delta';

	const sectionID = $derived(page.url.searchParams.get('id'));

	$effect(() => {
		if (sectionID) {
			db.sections.get(sectionID).then((m) => {
				if (!m) {
					goto('/all/sections');
				}
			});
		}
	});

	let editing = $state({
		body: true,
		attr: false
	});

	let momentQuery = liveQuery(() => {
		return db.sections.get(sectionID!);
	});

	let moment = $derived($momentQuery);

	let momentName = $state('');
	let momentNameClean = $derived(momentName?.replaceAll('\n', ''));

	const attrDisplayNames: {
		[K in keyof SectionAttr]: {
			name: string;
			placeholder?: string;
		};
	} = {
		start_point: {
			name: 'Starting point'
		},
		end_point: { name: 'Outcome' },
		driving_force: {
			name: 'Driving Force',
			placeholder: 'The events of this moment happen because...'
		},
		outcome_reason: {
			name: 'Reason for outcome',
			placeholder: 'The moment ends this way because...'
		},
		conflict: {
			name: 'Conflict',
			placeholder: "This moment's conflict arises from..."
		},
		significance: {
			name: 'Significance',
			placeholder: 'This moment is matters to the story because...'
		},
		notes: { name: 'Notes' }
	};

	const getAttr = (key: keyof SectionAttr) => {
		return moment?.attr?.[key] || '';
	};

	const attrKeys = $derived(Object.keys(attrDisplayNames) as Array<keyof SectionAttr>);

	let attrBuf = $state<SectionAttr>({});

	let bodyDelta = $state<Delta>();

	const prevQuery = liveQuery(() => moment?.getPrev());
	const prev = $derived($prevQuery);
	const nextQuery = liveQuery(() => moment?.getNext());
	const next = $derived($nextQuery);
	// const next = liveQuery(() => moment?.getNext());

	// const prev = $derived.by(async () => await moment?.getPrev());
	// const next = $derived.by(async () => await moment?.getNext());

	const characters = liveQuery(() => moment?.getCharacters() || []);
	const locations = liveQuery(() => moment?.getLocations() || []);
	// const themes = liveQuery(() => moment?.getThemes() || []);

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

<div class="sk-content mb-32 md:mt-16">
	<h1 class="invisible absolute">{momentName}</h1>

	{#await db.sections.get(sectionID!) then m}
		<div class="top-0 z-[9] flex flex-col bg-donkey-50 dark:bg-donkey-950 md:sticky">
			<div
				class="top-0 z-[11] flex w-full items-center justify-between bg-donkey-50 py-3 dark:bg-donkey-950 md:sticky"
			>
				<div class="flex grow items-center gap-3">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						class="hidden size-7 stroke-donkey-500 dark:stroke-donkey-400 md:block"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0 1 18 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5m0-5.25v5.25m0-5.25C6 5.004 6.504 4.5 7.125 4.5h9.75c.621 0 1.125.504 1.125 1.125m1.125 2.625h1.5m-1.5 0A1.125 1.125 0 0 1 18 7.125v-1.5m1.125 2.625c-.621 0-1.125.504-1.125 1.125v1.5m2.625-2.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125M18 5.625v5.25M7.125 12h9.75m-9.75 0A1.125 1.125 0 0 1 6 10.875M7.125 12C6.504 12 6 12.504 6 13.125m0-2.25C6 11.496 5.496 12 4.875 12M18 10.875c0 .621-.504 1.125-1.125 1.125M18 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-5.25m0 5.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125m-12 0v-1.5c0-.621-.504-1.125-1.125-1.125M18 18.375v-5.25m0 5.25v-1.5c0-.621.504-1.125 1.125-1.125M18 13.125v1.5c0 .621.504 1.125 1.125 1.125M18 13.125c0-.621.504-1.125 1.125-1.125M6 13.125v1.5c0 .621-.504 1.125-1.125 1.125M6 13.125C6 12.504 5.496 12 4.875 12m-1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5"
						/>
					</svg>

					<div class=" w-full font-title font-bold">
						<QLEditor
							id="moment-name"
							initText={m?.name || ''}
							placeholder="Untitled moment"
							inputMode="info"
							twBG="bg-donkey-50 dark:bg-donkey-950"
							twText="text-donkey-900 dark:text-donkey-50"
							twClass="[&>.ql-editor]:pl-0 drop-shadow-none max-w-[80%] [&>.ql-editor>*]:font-title [&>.ql-editor>*]:text-3xl cursor-pointer [&>.ql-editor::before]:font-title [&>.ql-editor::before]:text-3xl [&>.ql-editor::before]:!italic [&>.ql-editor::before]:dark:text-donkey-700 [&>.ql-editor::before]:text-donkey-300"
							onkeyup={async () => {
								if (sectionID) {
									await db.sections.update(sectionID, { name: momentName });
								}
							}}
							onfocusout={async () => {
								if (sectionID) {
									await db.sections.update(sectionID, { name: momentName });
								}
							}}
							bind:text={momentName}
						/>
					</div>
				</div>
				<button
					class="rounded-md bg-robin-600 p-2 hover:bg-robin-500 dark:bg-robin-950 hover:dark:bg-robin-900"
					aria-label="Delete Moment"
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
			<div class="flex w-full justify-between pb-4">
				{#await m?.getPrev() then prev}
					{#if prev}
						<a
							class="flex max-w-[45%] items-center gap-1 rounded-full bg-genie-500 px-2 py-1 text-sm font-bold text-genie-100 dark:bg-genie-950 dark:text-genie-300"
							href="/moment?id={prev.id}"
							data-sveltekit-reload
						>
							{@render Icon('backward', {})}
							{prev.name || 'Untitled moment'}
						</a>
					{:else}
						<div></div>
					{/if}
				{/await}
				{#await m?.getNext() then next}
					{#if next}
						<a
							class="flex max-w-[45%] items-center gap-1 rounded-full bg-genie-500 px-2 py-1 text-sm font-bold text-genie-100 dark:bg-genie-950 dark:text-genie-300"
							href="/moment?id={next.id}"
							data-sveltekit-reload
						>
							{next.name || 'Untitled moment'}
							{@render Icon('forward', {})}
						</a>
					{:else}
						<div></div>
					{/if}
				{/await}
			</div>
		</div>
	{/await}
	{#if moment}
		<section class="mb-8 mt-4 flex flex-col gap-2">
			{@render Connections()}
		</section>
		<section class="mb-8 mt-4 flex flex-col overflow-y-auto">
			<div class="mb-3 flex items-center gap-4">
				<h2 class="cursor-pointer font-title text-xl font-bold md:text-2xl" aria-label="Body">
					<button
						onpointerup={() => {
							vibrate();
							editing.body = !editing.body;
						}}
					>
						Outline
					</button>
				</h2>
				<button
					class="rounded-full bg-genie-500 p-1 dark:bg-genie-950"
					onpointerup={() => {
						vibrate();
						editing.body = !editing.body;
					}}
					title="{editing.body ? 'Hide' : 'Show'} the moment body"
				>
					{#if editing.body}
						{@render Icon('eye-slash', {})}
					{:else}
						{@render Icon('pencil-square', {})}
					{/if}
				</button>
			</div>
			{#if editing.body}
				<QLEditor
					id="moment-body"
					inputMode="full"
					twHeight="min-h-64"
					initText={moment.body || ''}
					onkeyup={async () => {
						if (sectionID) {
							await db.sections.update(sectionID, { body: bodyDelta });
						}
					}}
					onfocusout={async () => {
						if (sectionID) {
							await db.sections.update(sectionID, { body: bodyDelta });
						}
					}}
					bind:delta={bodyDelta}
				/>
			{:else}
				<button
					class="flex items-center gap-2 [&>*]:hover:text-genie-500 [&>svg]:hover:stroke-genie-500"
					onpointerup={() => {
						editing.body = true;
					}}
				>
					{@render Icon('pencil-square', {
						twSize: 'size-4',
						twColor: 'stroke-donkey-400 dark:stroke-donkey-600',
						twOther: 'ml-4',
						strokeWidth: 2.5
					})}

					<p class="font-bold text-donkey-400 dark:text-donkey-600">View</p>
				</button>
			{/if}
		</section>
		<section class="mb-8 mt-4 flex flex-col gap-2">
			<div class="mb-3 flex items-center gap-4">
				<h2 class="text:xl cursor-default font-title font-bold md:text-2xl">Foundation</h2>
			</div>
			{#each attrKeys as attrKey (`attr-${attrKey}`)}
				{#if attrKey !== 'notes'}
					<QLEditor
						id={attrKey}
						inputMode="info"
						title={attrDisplayNames[attrKey]?.name}
						placeholder={attrDisplayNames[attrKey]?.placeholder}
						initText={getAttr(attrKey)}
						onfocusout={async () => {
							await moment?.updateAttr({ [attrKey]: attrBuf[attrKey] });
							await moment?.cleanAttr();
						}}
						onkeyup={async () => {
							await moment?.updateAttr({ [attrKey]: attrBuf[attrKey] });
						}}
						bind:text={attrBuf[attrKey]}
					/>
				{:else}
					<QLEditor
						id={attrKey}
						inputMode="full"
						title="Notes"
						initText={getAttr(attrKey)}
						twHeight="min-h-32"
						onfocusout={async () => {
							await moment?.updateAttr({ [attrKey]: attrBuf[attrKey] });
							await moment?.cleanAttr();
						}}
						onkeyup={async () => {
							await moment?.updateAttr({ [attrKey]: attrBuf[attrKey] });
						}}
						bind:delta={attrBuf[attrKey]}
					/>
				{/if}
			{/each}
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

{#snippet Connections()}
	<!-- {#if moment}
		<div class="flex w-full justify-between">
			{#if prev}
				<a
					class="flex max-w-[45%] items-center gap-1 rounded-full bg-genie-500 px-2 py-1 text-sm font-bold text-genie-100 dark:bg-genie-950 dark:text-genie-300"
					href="/moment?id={prev.id}"
					data-sveltekit-reload
				>
					{@render Icon('backward', {})}
					{prev.name || 'Untitled moment'}
				</a>
			{:else}
				<div></div>
			{/if}
			{#if next}
				<a
					class="flex max-w-[45%] items-center gap-1 rounded-full bg-genie-500 px-2 py-1 text-sm font-bold text-genie-100 dark:bg-genie-950 dark:text-genie-300"
					href="/moment?id={next.id}"
					data-sveltekit-reload
				>
					{next.name || 'Untitled moment'}
					{@render Icon('forward', {})}
				</a>
			{:else}
				<div></div>
			{/if}
		</div>
	{/if} -->
{/snippet}

{#snippet Icon(
	name: 'pencil-square' | 'eye-slash' | 'backward' | 'forward',
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
		{#if name === 'pencil-square'}
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
		{:else if name === 'backward'}
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M21 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061A1.125 1.125 0 0 1 21 8.689v8.122ZM11.25 16.811c0 .864-.933 1.406-1.683.977l-7.108-4.061a1.125 1.125 0 0 1 0-1.954l7.108-4.061a1.125 1.125 0 0 1 1.683.977v8.122Z"
			/>
		{:else if name === 'forward'}
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M3 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061A1.125 1.125 0 0 1 3 16.811V8.69ZM12.75 8.689c0-.864.933-1.406 1.683-.977l7.108 4.061a1.125 1.125 0 0 1 0 1.954l-7.108 4.061a1.125 1.125 0 0 1-1.683-.977V8.69Z"
			/>
		{/if}
	</svg>
{/snippet}

<svelte:head>
	<title>
		{momentNameClean ? `🎞️ ${momentNameClean}` : 'Untitled moment'}
	</title>
</svelte:head>
