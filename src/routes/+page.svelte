<script lang="ts">
	import { goto } from '$app/navigation';
	import { skstate } from '$lib';

	const unsavedPaths = new Set(['edit']);

	$effect(() => {
		if (skstate.settings) {
			console.log(skstate.settings.currPath.split('/')[1]);
			const pathLevel1 = skstate.settings.currPath.split('/')[1];
			goto(unsavedPaths.has(pathLevel1) ? '/welcome' : skstate.settings.currPath);
		}
	});
</script>
