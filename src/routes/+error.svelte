<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	console.log(`ERROR ${page.url.pathname}: `, page.error?.message);
	goto('/welcome');
</script>
