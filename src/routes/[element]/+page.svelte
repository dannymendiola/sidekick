<script lang="ts">
	import { page } from '$app/state';

	type ElemType = 'moment' | 'character' | 'character-dynamic' | 'location';

	const elemType: ElemType = page.params.element as ElemType;
</script>

hewwo {elemType}
