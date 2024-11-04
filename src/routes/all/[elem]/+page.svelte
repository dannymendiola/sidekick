<script lang="ts">
	import { page } from '$app/stores';

	const elemName = ['characters', 'relationships', 'moments', 'locations'] as const;

	const elem = $derived(
		$page.params.elem.replace(
			/\w\S*/g,
			(text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
		)
	);
</script>

<div class="sk-content-w">
	<h1 class="font-title text-4xl italic">{elem}</h1>
</div>

<svelte:head>
	<title>🦸 Sidekick</title>
</svelte:head>
