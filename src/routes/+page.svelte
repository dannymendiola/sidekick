<script lang="ts">
	import { goto } from '$app/navigation';
	import { skstate } from '$lib';

	$effect(() => {
		if (skstate.settings) {
			goto(skstate.settings.currPath);
		}
	});
</script>
