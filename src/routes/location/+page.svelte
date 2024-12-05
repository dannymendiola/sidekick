<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { QLEditor, vibrate } from '$lib';
	import { db, type Location } from '$lib/db';
	import { type LocationAttr } from '$lib/types/db.d';
	import { liveQuery } from 'dexie';
	import Delta from 'quill-delta';

	const locId = $derived($page.url.searchParams.get('id'));

	$effect(() => {
		if (locId) {
			db.locations.get(locId).then((m) => {
				if (!m) {
					goto('/all/locations');
				}
			});
		}
	});

	let editing = $state({
		body: true,
		attr: false
	});

	let locQuery = liveQuery(() => {
		return db.locations.get(locId!);
	});

	let loc = $derived($locQuery);

	let locName = $state('');
	let locNameCleaned = $derived(locName?.replaceAll('\n', ''));

	let locTagline = $state('');

	const attrDisplayNames: {
		[K in keyof LocationAttr]: {
			name: string;
			placeholder: string;
		};
	} = {
		description: {
			name: 'Description',
			placeholder: 'As you step out into this place, you can see, smell, hear...'
		},
		history: {
			name: 'History',
			placeholder: 'This location came to be...'
		},
		significance: {
			name: 'Significance',
			placeholder: 'How this location ties into the story...'
		},
		notes: {
			name: 'Notes',
			placeholder: ''
		}
	};

	const getAttr = (key: keyof LocationAttr) => {
		return loc?.attr?.[key] || '';
	};

	const attrKeys = $derived(Object.keys(attrDisplayNames) as Array<keyof LocationAttr>);

	let attrBuf = $state<LocationAttr>({});

	let showDeleteModal = $state(false);

	let initClean = false;
	$effect(() => {
		if (loc && !initClean) {
			loc.cleanAttr();
			initClean = true;
		}
	});
</script>

{#if showDeleteModal}
	{@render DeleteModal()}
{/if}

<div class="sk-content mb-32 md:mt-16">
	<h1 class="invisible absolute">{locName}</h1>

	{#await db.locations.get(locId!) then t}
		<div
			class="top-0 z-[9] flex w-full items-center justify-between bg-donkey-50 py-3 dark:bg-donkey-950 md:sticky"
		>
			<div class="flex grow items-center gap-3">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke-width="2"
					class="hidden size-7 stroke-donkey-500 dark:stroke-donkey-400 md:block"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
					/>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
					/>
				</svg>

				<div class=" w-full font-title font-bold">
					<QLEditor
						id="location-name"
						initText={t?.name || ''}
						placeholder="Untitled location"
						inputMode="info"
						twBG="bg-donkey-50 dark:bg-donkey-950"
						twText="text-donkey-900 dark:text-donkey-50"
						twClass="[&>.ql-editor]:pl-0 drop-shadow-none max-w-[80%] [&>.ql-editor>*]:font-title [&>.ql-editor>*]:text-3xl cursor-pointer [&>.ql-editor::before]:font-title [&>.ql-editor::before]:text-3xl [&>.ql-editor::before]:!italic [&>.ql-editor::before]:dark:text-donkey-700 [&>.ql-editor::before]:text-donkey-300 "
						onkeyup={async () => {
							if (locId) {
								await db.locations.update(locId, { name: locName });
							}
						}}
						onfocusout={async () => {
							if (locId) {
								await db.locations.update(locId, { name: locName });
							}
						}}
						bind:text={locName}
					/>
				</div>
			</div>
			<button
				class="rounded-md bg-robin-300 p-2 hover:bg-robin-600 dark:bg-robin-950 hover:dark:bg-robin-900 [&>svg]:hover:stroke-robin-200"
				aria-label="Delete Location"
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
					class="size-5 stroke-robin-900 dark:stroke-robin-400"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
					/>
				</svg>
			</button>
		</div>
		<div class="w-full font-bold">
			<QLEditor
				id="location-tagline"
				initText={t?.tagline}
				placeholder="No tagline..."
				inputMode="info"
				twBG="bg-donkey-50 dark:bg-donkey-950"
				twText="text-donkey-900 dark:text-donkey-50"
				twClass="ml-4 [&>.ql-editor]:pl-0 [&>.ql-editor]:pb-2 [&>.ql-editor]:pt-0 drop-shadow-none max-w-[80%] [&>.ql-editor>*]:text-donkey-500  [&>.ql-editor>*]:dark:text-donkey-400 [&>.ql-editor::before]:dark:text-donkey-600 cursor-pointer"
				maxLen={50}
				onkeyup={async () => {
					if (locId) {
						await db.locations.update(locId, {
							tagline: locTagline === '\n' ? undefined : locTagline
						});
					}
				}}
				onfocusout={async () => {
					if (locId) {
						await db.characters.update(locId, {
							tagline: locTagline === '\n' ? undefined : locTagline
						});
					}
				}}
				bind:text={locTagline}
			/>
		</div>
	{/await}
	{#if loc}
		<section class="mb-8 mt-4 flex flex-col gap-2">
			{#each attrKeys as attrKey (`attr-${attrKey}`)}
				{#if ['thesis', 'conclusion'].includes(attrKey)}
					<QLEditor
						id={attrKey}
						inputMode="info"
						title={attrDisplayNames[attrKey]?.name}
						placeholder={attrDisplayNames[attrKey]?.placeholder}
						initText={getAttr(attrKey)}
						onfocusout={async () => {
							await loc?.updateAttr({ [attrKey]: attrBuf[attrKey] });
							await loc?.cleanAttr();
						}}
						onkeyup={async () => {
							await loc?.updateAttr({ [attrKey]: attrBuf[attrKey] });
						}}
						bind:text={attrBuf[attrKey]}
					/>
				{:else}
					<QLEditor
						id={attrKey}
						inputMode="full"
						title={attrDisplayNames[attrKey]?.name}
						placeholder={attrDisplayNames[attrKey]?.placeholder}
						initText={getAttr(attrKey)}
						twHeight="min-h-32"
						onfocusout={async () => {
							await loc?.updateAttr({ [attrKey]: attrBuf[attrKey] });
							await loc?.cleanAttr();
						}}
						onkeyup={async () => {
							await loc?.updateAttr({ [attrKey]: attrBuf[attrKey] });
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
				Delete {locNameCleaned || 'location'}?
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
						if (!loc) showDeleteModal = false;
						await loc!.delete();
						goto('/all/locations', { replaceState: true });
					}}
				>
					Delete
				</button>
			</div>
		</div>
	</div>
{/snippet}

{#snippet Icon(
	name: 'pencil-square' | 'eye-slash',
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
		{/if}
	</svg>
{/snippet}

<svelte:head>
	<title>
		{locNameCleaned ? `📍 ${locNameCleaned}` : 'Untitled location'}
	</title>
</svelte:head>
