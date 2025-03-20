<script lang="ts">
	import { Location, Character, Moment, Dynamic } from '$lib/db';

	interface Props {
		elemType: 'location' | 'character' | 'moment' | 'character-dynamic';
		element: Location | Character | Moment | Dynamic;
	}

	let { elemType, element }: Props = $props();
</script>

<div class="top-0 z-[9] flex flex-col bg-donkey-50 dark:bg-donkey-950 md:sticky">
	{#if elemType === 'character-dynamic'}
		{#await (element as Dynamic).toString() then dynamicName}
			<h1 class="invisible absolute">{dynamicName}</h1>
		{/await}
	{:else}
		NYI
	{/if}
</div>
