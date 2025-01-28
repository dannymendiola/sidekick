<script lang="ts">
	import { db, Character, Moment, Location, Dynamic } from '$lib/db';
	import { liveQuery } from 'dexie';

	interface Props {
		table: 'characters' | 'moments' | 'locations';
		id: string;
		/**
		 * Bindable object containing linked element info
		 */
		linked?: {
			dynamics: Dynamic[] | null;
			characters: Character[] | null;
			moments: Moment[] | null;
			locations: Location[] | null;
		};
	}

	let { table, id, linked = $bindable() }: Props = $props();

	const elem = liveQuery(async () => await db[table].get(id));

	const linkedBuf = $derived.by(async () => {
		if (!$elem) {
			return {
				dynamics: null,
				characters: null,
				moments: null,
				locations: null
			};
		}

		let dynamics = null;
		let characters = null;
		let moments = null;
		let locations = null;
		if ($elem instanceof Character) {
			dynamics = await db.dynamics.where('aCharId').equals(id).or('bCharId').equals(id).toArray();
			characters = await db.characters
				.where('id')
				.anyOf(dynamics.map((d) => (d.aCharId === id ? d.bCharId : d.aCharId)))
				.toArray();
			moments = await db.moments.where('characters').equals(id).toArray();
			locations = await $elem.getLocations();
			if (moments.length === 0) moments = null;
			if (locations.length === 0) locations = null;
			if (characters.length === 0) characters = null;
			if (dynamics.length === 0) dynamics = null;
		} else if ($elem instanceof Moment) {
			characters = await $elem.getCharacters();
			locations = await $elem.getLocations();
			if (characters.length === 0) characters = null;
			if (locations.length === 0) locations = null;
		} else if ($elem instanceof Location) {
			moments = await db.moments.where('locations').equals(id).toArray();
			characters = await db.characters.where('locations').equals(id).toArray();
			if (moments.length === 0) moments = null;
			if (characters.length === 0) characters = null;
		}
		return {
			dynamics: dynamics,
			characters: characters,
			moments: moments,
			locations: locations
		};
	});

	const linkable: ('characters' | 'moments' | 'locations')[] = $derived.by(() => {
		switch (table) {
			case 'characters':
				return ['moments', 'characters', 'locations'];
			case 'moments':
				return ['characters', 'locations'];
			case 'locations':
				return ['characters', 'moments'];
		}
	});

	let expandedLink: 'characters' | 'moments' | 'locations' | undefined = $state(undefined);

	const noLinks = $derived(
		linked?.characters === null &&
			linked?.dynamics === null &&
			linked?.moments === null &&
			linked?.locations === null
	);

	$effect(() => {
		linkedBuf.then((val) => {
			linked = val;
		});
	});
</script>

{#if linked && !noLinks}
	<pre>{JSON.stringify(linked, null, 2)}</pre>
	<div class="flex items-center gap-1">
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 16 16"
			class="size-4 fill-donkey-400 dark:fill-donkey-500"
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

		{#each linkable as link}
			{#if linked[link] && linked[link].length > 0}
				{@render LinksExpander(
					link,
					link === expandedLink
						? 'fill-donkey-200 dark:fill-donkey-800'
						: 'fill-donkey-700 dark:fill-donkey-300'
				)}
			{/if}
		{/each}
	</div>
	<!-- {:else} -->
	<!-- <p>No links</p> -->
{/if}

{#snippet LinksExpander(target: 'characters' | 'moments' | 'locations', twSvg: string)}
	<button
		class="w-fit rounded-lg border px-2 py-1 {expandedLink === target
			? 'border-donkey-500 bg-donkey-800 dark:border-donkey-400 dark:bg-donkey-300 '
			: 'border-donkey-300 hover:bg-donkey-100 dark:border-donkey-700 hover:dark:bg-donkey-900 '}"
		aria-label="Links to {target}"
		onclick={() => {
			expandedLink = expandedLink === target ? undefined : target;
		}}
	>
		{#if target === 'characters'}
			<!-- <svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				class="size-4"
			>
				<path
					d="M10 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM3.465 14.493a1.23 1.23 0 0 0 .41 1.412A9.957 9.957 0 0 0 10 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 0 0-13.074.003Z"
				/>
			</svg> -->
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="size-4 {twSvg}">
				<path
					d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"
				/>
			</svg>
		{:else if target === 'moments'}
			<div></div>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 16 16"
				fill="currentColor"
				class="size-4 {twSvg}"
			>
				<path
					fill-rule="evenodd"
					d="M1 3.5A1.5 1.5 0 0 1 2.5 2h11A1.5 1.5 0 0 1 15 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5v-9Zm1.5.25a.25.25 0 0 1 .25-.25h1.5a.25.25 0 0 1 .25.25v1a.25.25 0 0 1-.25.25h-1.5a.25.25 0 0 1-.25-.25v-1Zm3.75-.25a.25.25 0 0 0-.25.25v3.5c0 .138.112.25.25.25h3.5a.25.25 0 0 0 .25-.25v-3.5a.25.25 0 0 0-.25-.25h-3.5ZM6 8.75a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.5a.25.25 0 0 1-.25.25h-3.5a.25.25 0 0 1-.25-.25v-3.5Zm5.75-5.25a.25.25 0 0 0-.25.25v1c0 .138.112.25.25.25h1.5a.25.25 0 0 0 .25-.25v-1a.25.25 0 0 0-.25-.25h-1.5ZM2.5 11.25a.25.25 0 0 1 .25-.25h1.5a.25.25 0 0 1 .25.25v1a.25.25 0 0 1-.25.25h-1.5a.25.25 0 0 1-.25-.25v-1Zm9.25-.25a.25.25 0 0 0-.25.25v1c0 .138.112.25.25.25h1.5a.25.25 0 0 0 .25-.25v-1a.25.25 0 0 0-.25-.25h-1.5ZM2.5 8.75a.25.25 0 0 1 .25-.25h1.5a.25.25 0 0 1 .25.25v1a.25.25 0 0 1-.25.25h-1.5a.25.25 0 0 1-.25-.25v-1Zm9.25-.25a.25.25 0 0 0-.25.25v1c0 .138.112.25.25.25h1.5a.25.25 0 0 0 .25-.25v-1a.25.25 0 0 0-.25-.25h-1.5ZM2.5 6.25A.25.25 0 0 1 2.75 6h1.5a.25.25 0 0 1 .25.25v1a.25.25 0 0 1-.25.25h-1.5a.25.25 0 0 1-.25-.25v-1ZM11.75 6a.25.25 0 0 0-.25.25v1c0 .138.112.25.25.25h1.5a.25.25 0 0 0 .25-.25v-1a.25.25 0 0 0-.25-.25h-1.5Z"
					clip-rule="evenodd"
				/>
			</svg>
		{:else if target === 'locations'}
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="size-4 {twSvg}">
				<path
					fill-rule="evenodd"
					d="m7.539 14.841.003.003.002.002a.755.755 0 0 0 .912 0l.002-.002.003-.003.012-.009a5.57 5.57 0 0 0 .19-.153 15.588 15.588 0 0 0 2.046-2.082c1.101-1.362 2.291-3.342 2.291-5.597A5 5 0 0 0 3 7c0 2.255 1.19 4.235 2.292 5.597a15.591 15.591 0 0 0 2.046 2.082 8.916 8.916 0 0 0 .189.153l.012.01ZM8 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
					clip-rule="evenodd"
				/>
			</svg>
		{/if}
	</button>
{/snippet}
