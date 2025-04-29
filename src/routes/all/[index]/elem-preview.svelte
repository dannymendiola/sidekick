<script lang="ts">
	import { SKInput, skstate } from '$lib';
	import { db, Character, Dynamic, Section, Location } from '$lib/db';
	import { liveQuery } from 'dexie';
	import { slide } from 'svelte/transition';
	import { quintInOut } from 'svelte/easing';
	// import ElemLinks from '$lib/components/elem-links.svelte';

	interface Props {
		table: 'characters' | 'sections' | 'locations' | 'dynamics';
		id: string;
		collapsed?: boolean;
		selectionColor?: 'blue' | 'green' | 'yellow' | 'purple';
	}

	const { table, id, collapsed, selectionColor }: Props = $props();

	let bodyFocused = $state(false);
	let titleFocused = $state(false);

	const focused = $derived(bodyFocused || titleFocused);

	const element = liveQuery(async () => await db[table].get(id));

	const expandHref = $derived(table === 'dynamics' ? 'character-dynamic' : table.slice(0, -1));

	const twFocusedBorder = $derived.by(() => {
		switch (table) {
			case 'characters':
				return 'border-genie-600 dark:border-genie-400/50';
			case 'locations':
				return 'border-wazowski-600 dark:border-wazowski-400/60';
			case 'sections':
				return 'border-smithers-600 dark:border-smithers-400/50';
			case 'dynamics':
				return 'border-donnie-600 dark:border-donnie-400/40';
		}
	});
</script>

{#if $element}
	<div
		class="rounded-xl border px-2 py-2 lg:px-4 {focused
			? twFocusedBorder
			: 'border-donkey-200 dark:border-donkey-800'}"
	>
		<div class="flex items-center justify-between">
			<div class="flex max-w-[75%] gap-1">
				{#if table === 'dynamics'}
					{#await $element.toString() then name}
						<div class="my-3 font-serif text-2xl font-bold">{name}</div>
					{/await}
				{:else}
					<SKInput
						boundField={{
							entityID: id,
							entityTable: db[table],
							fieldName: 'name',
							bindAs: 'text'
						}}
						placeholder="{table === 'sections' ? 'Untitled' : 'Unnamed'} {table.slice(0, -1)}"
						disableLineBreak
						disableSpellCheck
						twClass="mb-2 text-xl md:text-2xl font-semibold font-title"
						bind:focused={titleFocused}
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
				<a
					class="rounded-lg border border-donkey-400 bg-donkey-100 p-1 dark:border-donkey-600 dark:bg-donkey-900"
					href="/{expandHref}?id={id}"
					aria-label="Open"
				>
					<svg
						xmlns="http://www.w3.org/2000/svg"
						viewBox="0 0 20 20"
						fill="currentColor"
						class="size-4"
					>
						<path
							fill-rule="evenodd"
							d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z"
							clip-rule="evenodd"
						/>
						<path
							fill-rule="evenodd"
							d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z"
							clip-rule="evenodd"
						/>
					</svg>
				</a>
			</div>
		</div>

		{#if !collapsed}
			<div
				in:slide={{
					duration: skstate.prefersReducedMotion ? 0 : 200,
					easing: quintInOut,
					delay: 200
				}}
				out:slide={{
					duration: skstate.prefersReducedMotion ? 0 : 200,
					easing: quintInOut
				}}
			>
				<SKInput
					boundField={{
						entityID: id,
						entityTable: db[table],
						fieldName: 'body',
						bindAs: 'html'
					}}
					placeholder="Describe the {table.replaceAll('-', ' ').slice(0, -1)}..."
					bind:focused={bodyFocused}
				/>
			</div>
		{/if}
	</div>
{/if}
