<script lang="ts">
	import { db, Character, Moment, Location, Dynamic } from '$lib/db';
	import { liveQuery } from 'dexie';

	interface Props {
		table: 'characters' | 'moments' | 'locations';
		id: string;
		/**
		 * Bindable object containing linked element info
		 */
		other?: {
			dynamics: Dynamic[] | null;
			characters: Character[] | null;
			moments: Moment[] | null;
			locations: Location[] | null;
		};
	}

	let { table, id, other = $bindable() }: Props = $props();

	const elem = liveQuery(async () => await db[table].get(id));

	const otherBuf = $derived.by(async () => {
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

	const linkable: ('characters' | 'moments' | 'locations' | 'dynamics')[] = $derived.by(() => {
		switch (table) {
			case 'characters':
				return ['moments', 'dynamics', 'characters', 'locations'];
			case 'moments':
				return ['characters', 'locations'];
			case 'locations':
				return ['characters', 'moments'];
		}
	});

	const noLinks = $derived(
		other?.characters === null &&
			other?.dynamics === null &&
			other?.moments === null &&
			other?.locations === null
	);

	$effect(() => {
		otherBuf.then((val) => {
			other = val;
		});
	});
</script>

<!-- {#if other && !noLinks}
	<pre>{JSON.stringify(other, null, 2)}</pre>
{:else}
	<p>No links</p>
{/if} -->
