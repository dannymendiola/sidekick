<script lang="ts">
	import { CharacterAttr } from '$lib/types/db.d';

	let charState: CharacterAttr & {
		name: string;
	} = $state(new CharacterAttr() as typeof charState);
</script>

<div class="sk-content"></div>
