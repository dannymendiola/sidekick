<script lang="ts">
	import { skstate, DEFAULT_SETTINGS } from '$lib';
	import { onMount } from 'svelte';
	import '../app.css';

	let { children } = $props();

	$effect(() => {
		const pageColor: TWColor = skstate.darkMode ? 'bg-zinc-950' : 'bg-zinc-100';

		if (document.body && !document.body.classList.contains(pageColor)) {
			document.body.className = `${skstate.darkMode ? 'dark ' : ''}${pageColor}`;
		}
	});

	onMount(() => {
		const storedSettings = localStorage.getItem('sk-settings');
		skstate.settings = storedSettings ? JSON.parse(storedSettings) : DEFAULT_SETTINGS;
	});
</script>

{@render children()}
