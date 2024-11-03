<script lang="ts">
	import { skstate, DEFAULT_SETTINGS, Navbar } from '$lib';
	import { onMount } from 'svelte';
	import '../app.css';

	let { children } = $props();

	const storedSettings = localStorage.getItem('sk-settings');
	skstate.settings = storedSettings ? JSON.parse(storedSettings) : DEFAULT_SETTINGS;

	let pageColor: TWColor = $derived(skstate.darkMode ? 'bg-donkey-950' : 'bg-donkey-100');

	$effect(() => {
		if (document.body && !document.body.classList.contains(pageColor)) {
			document.body.className = `${skstate.darkMode ? 'dark ' : ''}${pageColor}`;
		}
	});
</script>

<Navbar />
{@render children()}
