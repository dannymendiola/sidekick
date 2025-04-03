<script lang="ts">
	import { Delta } from 'quill/core';
	import { QLEditor, skstate } from '$lib';
	import { db, Character, Dynamic, Moment, Location } from '$lib/db';
	import { liveQuery } from 'dexie';
	import { slide } from 'svelte/transition';
	import { quintInOut } from 'svelte/easing';
	import ElemLinks from '$lib/components/elem-links.svelte';

	interface Props {
		table: 'characters' | 'moments' | 'locations' | 'dynamics';
		id: string;
		collapsed?: boolean;
		selectionColor?: 'blue' | 'green' | 'yellow' | 'purple';
	}

	const { table, id, collapsed, selectionColor }: Props = $props();

	let bodyFocused = $state(false);
	let titleFocused = $state(false);

	const focused = $derived(bodyFocused || titleFocused);

	let currName = $state('');
	let currBody = $state<Delta>();

	const element = liveQuery(async () => await db[table].get(id));

	const expandHref = $derived(table === 'dynamics' ? 'character-dynamic' : table.slice(0, -1));

	const twFocusedBorder = $derived.by(() => {
		switch (table) {
			case 'characters':
				return 'border-genie-600 dark:border-genie-400';
			case 'locations':
				return 'border-wazowski-600 dark:border-wazowski-400';
			case 'moments':
				return 'border-smithers-600 dark:border-smithers-400';
			case 'dynamics':
				return 'border-donnie-600 dark:border-donnie-400';
		}
	});

	const titlePlaceholder = $derived.by(() => {
		switch (table) {
			case 'characters':
				return 'Unnamed character';
			case 'locations':
				return 'Unnamed location';
			case 'moments':
				return 'Untitled moment';
			case 'dynamics':
				return '';
		}
	});

	const placeholders = $derived.by(() => {
		switch (table) {
			case 'characters':
				return [
					'Capable, but impulsive',
					'Loose cannon',
					'Has trouble opening up',
					'Severe main character syndrome',
					'The chosen one',
					'Causes a lot of problems'
				];
			case 'locations':
				return [
					'The place where the magic happens',
					'Has seen better days',
					'Feels oddly familiar',
					"They've got a cherry pie there that'll kill you",
					'The place they swore never to return to',
					''
				];
			case 'moments':
				return [
					'And then everything worked out',
					'Insert fight sequence',
					'The protagonist is given a choice',
					'Events occur',
					'That thing that was hinted at earlier comes back to bite everyone',
					"The antagonist's master plan is revealed",
					'The protagonist suffers unforeseen consequences'
				];
			case 'dynamics':
				return [
					'Source of all the drama',
					"Can't stand each other, forced to work together",
					"Enable each other's worst qualities",
					'Thick, thick tension',
					'Would kill for each other',
					'Friendly rivalry',
					'Bonded over shared trauma'
				];
		}
	});

	let linked = $state<{
		locations: Location[] | null;
		characters: Character[] | null;
		moments: Moment[] | null;
		dynamics: Dynamic[] | null;
	}>();

	let showLinks = $state(false);

	let noLinks = $state(false);
</script>

{#if $element}
	<div
		class="rounded-xl border-l px-2 py-1 {focused
			? twFocusedBorder
			: 'border-donkey-200 dark:border-donkey-800'}"
	>
		<div class="flex items-center justify-between">
			<div class="flex max-w-[80%] gap-1">
				{#if table === 'dynamics'}
					{#await $element.toString() then name}
						<div class="my-3 font-serif text-2xl font-bold">{name}</div>
					{/await}
				{:else}
					<QLEditor
						initText={$element.name}
						id={`t-${id}`}
						twBG="bg-donkey-50 dark:bg-donkey-950"
						twClass="[&>.ql-editor>*]:font-serif [&>.ql-editor>*]:text-2xl [&>.ql-editor>*]:font-bold [&>.ql-editor::before]:font-serif [&>.ql-editor::before]:text-2xl [&>.ql-editor::before]:font-bold [&>.ql-editor]:pl-0"
						toolbar={false}
						placeholder={titlePlaceholder}
						inputMode="info"
						onkeyup={async () => {
							// @ts-ignore
							await db[table].update(id, { name: currName });
						}}
						onfocusout={async () => {
							// @ts-ignore
							await db[table].update(id, { name: currName });
						}}
						{selectionColor}
						bind:focused={titleFocused}
						bind:text={currName}
					/>
				{/if}
			</div>
			<div class="flex items-center gap-2">
				<button
					class="rounded-lg border border-donkey-400 bg-donkey-100 p-1 dark:border-donkey-600 dark:bg-donkey-900 {collapsed &&
						'rotate-180'}"
					aria-label={collapsed ? 'Expand' : 'Collapse'}
					onclick={async () => {
						// @ts-ignore
						await db[table].update(id, { previewCollapsed: !collapsed });
					}}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="size-4"
					>
						<path
							fill-rule="evenodd"
							d="M9.47 6.47a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 8.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06l4.25-4.25Z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
				<!-- <button
					class="rounded-lg border p-1 {showLinks
						? 'border-donkey-300 bg-donkey-500 dark:border-donkey-500 dark:bg-donkey-400'
						: noLinks
							? 'border-donkey-300 bg-donkey-200 dark:border-donkey-700 dark:bg-donkey-800'
							: 'border-donkey-400 bg-donkey-100 dark:border-donkey-600 dark:bg-donkey-900'}"
					aria-label={collapsed ? 'Expand' : 'Collapse'}
					onclick={() => {
						showLinks = !showLinks;
					}}
					disabled={noLinks}
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 16 16"
						class="size-4 {showLinks
							? 'fill-donkey-200 dark:fill-donkey-900'
							: noLinks
								? 'fill-donkey-300 dark:fill-donkey-600'
								: 'fill-donkey-500 dark:fill-donkey-300'}"
					>
						<path
							fill-rule="evenodd"
							d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-5.396-4.402.75.75 0 0 1 1.251.827 2 2 0 0 0 3.085 2.514l2-2a2 2 0 0 0 0-2.828.75.75 0 0 1 0-1.06Z"
							clip-rule="evenodd"
						/>
						<path
							fill-rule="evenodd"
							d="M7.086 9.975a.75.75 0 0 1-1.06 0 3.5 3.5 0 0 1 0-4.95l2-2a3.5 3.5 0 0 1 5.396 4.402.75.75 0 0 1-1.251-.827 2 2 0 0 0-3.085-2.514l-2 2a2 2 0 0 0 0 2.828.75.75 0 0 1 0 1.06Z"
							clip-rule="evenodd"
						/>
					</svg>
				</button> -->
				<a
					class="rounded-lg border border-donkey-400 bg-donkey-100 p-1 dark:border-donkey-600 dark:bg-donkey-900"
					href="/{expandHref}?id={id}"
					aria-label="Open character"
				>
					<!-- <svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke-width="1.5"
						stroke="currentColor"
						class="size-3 stroke-[1.4]"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
						/>
					</svg> -->
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 24 24"
						fill="currentColor"
						class="size-4"
					>
						<path
							d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z"
						/>
					</svg>

					<!-- <svg
						xmlns="http://www.w3.org/2000/svg"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor"
						class="size-4 stroke-[1.3]"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
						/>
					</svg> -->
				</a>
			</div>
		</div>

		<!-- <div class={!showLinks ? 'pointer-events-none absolute opacity-0' : ''}>
			<ElemLinks {table} {id} bind:linked bind:noLinks />
		</div> -->

		{#if !collapsed}
			<div
				transition:slide={{ duration: skstate.prefersReducedMotion ? 0 : 200, easing: quintInOut }}
			>
				<QLEditor
					initText={$element.body}
					{id}
					twBG="bg-donkey-50 dark:bg-donkey-950"
					twClass="[&>.ql-editor]:pl-2 [&>.ql-editor]:pt-1"
					toolbar={false}
					placeholder={placeholders[Math.floor(Math.random() * placeholders.length)]}
					onkeyup={async () => {
						// @ts-ignore
						await db[table].update(id, { body: currBody });
					}}
					onfocusout={async () => {
						// @ts-ignore
						await db[table].update(id, { body: currBody });
					}}
					{selectionColor}
					bind:focused={bodyFocused}
					bind:delta={currBody}
				/>
			</div>
		{/if}
	</div>
{/if}
