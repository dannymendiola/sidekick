<script lang="ts">
	import { Delta } from 'quill/core';
	import { QLEditor, skstate } from '$lib';
	import { db } from '$lib/db';
	import { liveQuery } from 'dexie';
	import { slide } from 'svelte/transition';
	import { quintInOut } from 'svelte/easing';

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
				return ['The place where the magic happens'];
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
				return [];
		}
	});
</script>

{#if $element}
	<div
		class="rounded-xl border-l px-2 py-1 {focused
			? twFocusedBorder
			: 'border-donkey-200 dark:border-donkey-800'}"
	>
		<div class="flex items-center justify-between">
			<div class="flex max-w-[80%] gap-1">
				<button
					class={`mt-[1.375rem] h-fit md:mt-5 ${collapsed && 'rotate-180 '}${skstate.prefersReducedMotion ? 'transition-none' : 'transition-transform duration-200 ease-out'}`}
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
						class="size-5"
					>
						<path
							fill-rule="evenodd"
							d="M9.47 6.47a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 1 1-1.06 1.06L10 8.06l-3.72 3.72a.75.75 0 0 1-1.06-1.06l4.25-4.25Z"
							clip-rule="evenodd"
						/>
					</svg>
				</button>
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
			<a href="/{expandHref}?id={id}" aria-label="Open character">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					class="size-4 stroke-2 md:size-5"
				>
					<path
						stroke-linecap="round"
						stroke-linejoin="round"
						d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
					/>
				</svg>
			</a>
		</div>

		{#if !collapsed}
			<div
				class="ml-3"
				transition:slide={{ duration: skstate.prefersReducedMotion ? 0 : 200, easing: quintInOut }}
			>
				<QLEditor
					initText={$element.body}
					{id}
					twBG="bg-donkey-50 dark:bg-donkey-950"
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
