<script lang="ts">
	import Quill, { type QuillOptions } from 'quill';
	import { Delta } from 'quill/core';
	import { uuid, QLEditor, addKeybinds } from '$lib';
	import { onMount } from 'svelte';

	interface Props {
		placeholder?: string;
		text?: Delta;
		initText?: Delta;
		toolbar: boolean;
		inputMode: 'full' | 'info';
		spellcheck: boolean;
	}

	let {
		placeholder = 'Enter text...',
		initText = undefined,
		text = $bindable(),
		inputMode = 'info',
		toolbar = false,
		spellcheck = true
	}: Props = $props();

	const TOOLBAR_OPTIONS = [
		['bold', 'italic', 'underline'],
		[{ indent: '-1' }, { indent: '+1' }],
		[{ list: 'ordered' }, { list: 'bullet' }],
		[{ align: [] }]
	];

	const ALLOWED_FMTS =
		inputMode === 'full' ? ['bold', 'italic', 'underline', 'indent', 'list', 'align'] : [];

	let quill: Quill | undefined = $state();
	const id = `ql-${uuid()}`;

	const qlOpts: QuillOptions = {
		placeholder: placeholder,
		formats: ALLOWED_FMTS
	};

	onMount(() => {
		quill = new Quill(`#${id}`, qlOpts);
		quill!.on('text-change', () => {
			text = quill!.getContents();
		});
		addKeybinds(quill);

		if (initText) {
			quill!.setContents(initText);
		}
	});
</script>

<div class="flex h-full w-full flex-col">
	{#if toolbar}{/if}
</div>
