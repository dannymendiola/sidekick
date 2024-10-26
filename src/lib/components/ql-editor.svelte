<script lang="ts">
	import Quill, { type QuillOptions } from 'quill';
	import { uuid } from '$lib';
	import { onMount } from 'svelte';

	const TOOLBAR_OPTIONS = [
		['bold', 'italic', 'underline'],
		[{ indent: '-1' }, { indent: '+1' }],
		[{ list: 'ordered' }, { list: 'bullet' }]
	];

	const ALLOWED_FMTS = ['bold', 'italic', 'underline', 'indent', 'list'];
</script>
