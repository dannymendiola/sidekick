<script lang="ts">
	import { goto } from '$app/navigation';
	import { skstate } from '$lib';

	const unsavedPaths = new Set<string>();

	$effect(() => {
		if (skstate.settings) {
			const pathLevel1 = skstate.settings.currPath.split('/')[1];
			goto(unsavedPaths.has(pathLevel1) ? '/welcome' : skstate.settings.currPath, {
				replaceState: true
			});
		}
	});
</script>
