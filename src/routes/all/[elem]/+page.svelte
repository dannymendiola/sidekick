<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	const elemName = ['characters', 'relationships', 'moments', 'locations'] as const;

	let elem: (typeof elemName)[number] | undefined = $state();

	// @ts-ignore
	if (elemName.includes($page.params.elem)) {
		elem = $page.params.elem as (typeof elemName)[number];
	} else {
		goto('/');
	}

	switch (elem) {
		case 'characters':
			break;
		case 'relationships':
			break;
		case 'moments':
			break;
		case 'locations':
			break;
	}
</script>

<svelte:head>
	<title>🦸 Sidekick</title>
</svelte:head>
