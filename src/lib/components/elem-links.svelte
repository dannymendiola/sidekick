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
		/**
		 * Bindable
		 */
		noLinks?: boolean;
	}

	let { table, id, linked = $bindable(), noLinks = $bindable() }: Props = $props();

	const elem = liveQuery(async () => await db[table].get(id));

	const linkedBuf = $derived.by(async () => {
		const elemSnap = $elem;
		if (!elemSnap) {
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
		if (elemSnap instanceof Character) {
			dynamics = await db.dynamics.where('aCharId').equals(id).or('bCharId').equals(id).toArray();
			characters = await db.characters
				.where('id')
				.anyOf(dynamics.map((d) => (d.aCharId === id ? d.bCharId : d.aCharId)))
				.toArray();
			moments = await db.moments.where('characters').equals(id).toArray();
			locations = await elemSnap.getLocations();
			if (moments.length === 0) moments = null;
			if (locations.length === 0) locations = null;
			if (characters.length === 0) characters = null;
			if (dynamics.length === 0) dynamics = null;
		} else if (elemSnap instanceof Moment) {
			characters = await elemSnap.getCharacters();
			locations = await elemSnap.getLocations();
			if (characters.length === 0) characters = null;
			if (locations.length === 0) locations = null;
		} else if (elemSnap instanceof Location) {
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

	// const noLinks = $derived(
	// 	linked?.characters === null &&
	// 		linked?.dynamics === null &&
	// 		linked?.moments === null &&
	// 		linked?.locations === null
	// );

	$effect(() => {
		noLinks =
			linked?.characters === null &&
			linked?.dynamics === null &&
			linked?.moments === null &&
			linked?.locations === null;
	});

	const twLinkCategory = {
		characters: {
			bg: 'bg-genie-200 dark:bg-genie-950 border-genie-500 dark:border-genie-800',
			icon: 'fill-genie-900 dark:fill-genie-300'
		},
		locations: {
			bg: 'bg-wazowski-200 dark:bg-wazowski-950 border-wazowski-500 dark:border-wazowski-800',
			icon: 'fill-wazowski-900 dark:fill-wazowski-300'
		},
		moments: {
			bg: 'bg-smithers-400 dark:bg-smithers-950 border-smithers-700 dark:border-smithers-900',
			icon: 'fill-smithers-950 dark:fill-smithers-300'
		}
	};

	$effect(() => {
		linkedBuf.then((val) => {
			linked = val;
		});
	});

	// const deleteme = async () => {
	// 	console.log('hello');
	// };
	// $effect(() => {
	// 	if ($elem?.name === 'Tony\n') {
	// 		deleteme();
	// 	}
	// });
</script>

{#if linked && !noLinks}
	<!-- <pre>{JSON.stringify(linked, null, 2)}</pre> -->
	<!-- <div class="mb-2 flex items-center gap-1"> -->
	<!-- <svg
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
		</svg> -->
	<section class="flex flex-col gap-2">
		{#each linkable as link}
			{#if linked[link] && linked[link].length > 0}
				<div class="flex items-center gap-1">
					{#if link === 'characters'}
						<div
							class="rounded border border-genie-600 bg-genie-300 p-1 dark:border-genie-700 dark:bg-genie-950"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 16 16"
								class="size-4 {twLinkCategory['characters']['icon']}"
							>
								<path
									d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47Z"
								/>
							</svg>
						</div>
					{:else if link === 'locations'}
						<div
							class="rounded border border-wazowski-600 bg-wazowski-200 p-1 dark:border-wazowski-700 dark:bg-wazowski-950"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 16 16"
								class="size-4 {twLinkCategory['locations']['icon']}"
							>
								<path
									fill-rule="evenodd"
									d="m7.539 14.841.003.003.002.002a.755.755 0 0 0 .912 0l.002-.002.003-.003.012-.009a5.57 5.57 0 0 0 .19-.153 15.588 15.588 0 0 0 2.046-2.082c1.101-1.362 2.291-3.342 2.291-5.597A5 5 0 0 0 3 7c0 2.255 1.19 4.235 2.292 5.597a15.591 15.591 0 0 0 2.046 2.082 8.916 8.916 0 0 0 .189.153l.012.01ZM8 8.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
					{:else if link === 'moments'}
						<div
							class="rounded border border-smithers-600 bg-smithers-300 p-1 dark:border-smithers-700 dark:bg-smithers-950"
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 16 16"
								class="size-4 {twLinkCategory['moments']['icon']}"
							>
								<path
									fill-rule="evenodd"
									d="M1 3.5A1.5 1.5 0 0 1 2.5 2h11A1.5 1.5 0 0 1 15 3.5v9a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 1 12.5v-9Zm1.5.25a.25.25 0 0 1 .25-.25h1.5a.25.25 0 0 1 .25.25v1a.25.25 0 0 1-.25.25h-1.5a.25.25 0 0 1-.25-.25v-1Zm3.75-.25a.25.25 0 0 0-.25.25v3.5c0 .138.112.25.25.25h3.5a.25.25 0 0 0 .25-.25v-3.5a.25.25 0 0 0-.25-.25h-3.5ZM6 8.75a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.5a.25.25 0 0 1-.25.25h-3.5a.25.25 0 0 1-.25-.25v-3.5Zm5.75-5.25a.25.25 0 0 0-.25.25v1c0 .138.112.25.25.25h1.5a.25.25 0 0 0 .25-.25v-1a.25.25 0 0 0-.25-.25h-1.5ZM2.5 11.25a.25.25 0 0 1 .25-.25h1.5a.25.25 0 0 1 .25.25v1a.25.25 0 0 1-.25.25h-1.5a.25.25 0 0 1-.25-.25v-1Zm9.25-.25a.25.25 0 0 0-.25.25v1c0 .138.112.25.25.25h1.5a.25.25 0 0 0 .25-.25v-1a.25.25 0 0 0-.25-.25h-1.5ZM2.5 8.75a.25.25 0 0 1 .25-.25h1.5a.25.25 0 0 1 .25.25v1a.25.25 0 0 1-.25.25h-1.5a.25.25 0 0 1-.25-.25v-1Zm9.25-.25a.25.25 0 0 0-.25.25v1c0 .138.112.25.25.25h1.5a.25.25 0 0 0 .25-.25v-1a.25.25 0 0 0-.25-.25h-1.5ZM2.5 6.25A.25.25 0 0 1 2.75 6h1.5a.25.25 0 0 1 .25.25v1a.25.25 0 0 1-.25.25h-1.5a.25.25 0 0 1-.25-.25v-1ZM11.75 6a.25.25 0 0 0-.25.25v1c0 .138.112.25.25.25h1.5a.25.25 0 0 0 .25-.25v-1a.25.25 0 0 0-.25-.25h-1.5Z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
					{/if}
					<div class="flex gap-1">
						{#each linked[link] as linkedElem}
							<div class="flex flex-nowrap">
								<a
									class="border-donkey-300 bg-donkey-100 px-2 py-1 text-sm hover:bg-donkey-200 dark:border-donkey-700 dark:bg-donkey-900 dark:hover:bg-donkey-800 {link ===
										'characters' && table === 'characters'
										? 'rounded-l-lg border-y border-l'
										: 'rounded-lg border'}"
									href="/{link.slice(0, -1)}?id={linkedElem.id}"
								>
									{linkedElem.name}
								</a>
								{#if link === 'characters' && table === 'characters'}
									{#await (linkedElem as Character).getDynamicWith(id) then dynamic}
										<!-- <pre>
												 {JSON.stringify(linkedElem, null, 2)}
											</pre>
											{JSON.stringify(dynamic, null, 2)} -->
										<a
											class="flex h-full items-center rounded-r-lg border border-donnie-600 bg-donnie-100 px-2 py-1 text-sm hover:bg-donnie-200 dark:border-donnie-700 dark:bg-donnie-950 dark:hover:bg-donnie-900"
											href="/character-dynamic?id={dynamic?.id}"
										>
											<!-- <span class="text-donnie-700 dark:text-donnie-200"> rel </span> -->
											<svg
												xmlns="http://www.w3.org/2000/svg"
												viewBox="0 0 16 16"
												class="size-4 fill-donnie-700 dark:fill-donnie-200"
											>
												<path
													d="M8.5 4.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10.9 12.006c.11.542-.348.994-.9.994H2c-.553 0-1.01-.452-.902-.994a5.002 5.002 0 0 1 9.803 0ZM14.002 12h-1.59a2.556 2.556 0 0 0-.04-.29 6.476 6.476 0 0 0-1.167-2.603 3.002 3.002 0 0 1 3.633 1.911c.18.522-.283.982-.836.982ZM12 8a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
												/>
											</svg>
										</a>
									{/await}
								{/if}
							</div>
						{/each}
					</div>
				</div>
			{/if}
		{/each}
	</section>
	<!-- </div> -->

	<!-- {:else} -->
	<!-- <p>No links</p> -->
{/if}

<!-- {#snippet LinksExpander(target: 'characters' | 'moments' | 'locations', twSvg: string)}
	<button
		class="w-fit rounded-lg border px-2 py-1 {expandedLink === target
			? `${twExpander[target]['bg']}`
			: 'border-donkey-300 hover:bg-donkey-100 dark:border-donkey-700 hover:dark:bg-donkey-900 '}"
		aria-label="Links to {target}"
		onclick={() => {
			expandedLink = expandedLink === target ? undefined : target;
		}}
	>
		{#if target === 'characters'}
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
{/snippet} -->
