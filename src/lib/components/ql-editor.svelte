<script lang="ts">
	import Quill, { type QuillOptions } from 'quill';
	import { Delta } from 'quill/core';
	import { uuid, QLEditor, addKeybinds } from '$lib';
	import { onMount } from 'svelte';

	interface Props {
		placeholder?: string;
		text?: Delta;
		initText?: Delta;
		toolbar?: boolean;
		inputMode?: 'full' | 'info';
		spellcheck?: boolean;
	}

	let {
		placeholder = 'Enter text...',
		initText = undefined,
		text = $bindable(),
		inputMode = 'full',
		toolbar = inputMode === 'full',
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

	const twActiveButton = 'bg-genie-900 text-genie-200';

	class CursorFormat {
		bold = $state(false);
		italic = $state(false);
		underline = $state(false);
		indent = $state(0);
		align = $state<'left' | 'center' | 'right' | 'justify'>('left');
		list = $state<'bullet' | 'ordered' | undefined>();
	}

	let csrFmt = new CursorFormat();

	const updateCsrFmt = () => {
		if (!quill) return;

		const range = quill.getSelection();
		const fmt = range ? quill.getFormat(range.index, range.length) : quill.getFormat();

		if (!fmt) return;

		csrFmt.bold = (fmt.bold as boolean) || false;
		csrFmt.italic = (fmt.italic as boolean) || false;
		csrFmt.underline = (fmt.underline as boolean) || false;

		csrFmt.indent = (fmt.indent as number) || 0;
		csrFmt.align = (fmt.align as typeof csrFmt.align) || 'left';
		csrFmt.list = (fmt.list as 'bullet' | 'ordered') || undefined;
	};

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
	{#if toolbar}
		{@render Toolbar()}
	{/if}
	<div
		class="ql-editor-wrapper h-full cursor-text overflow-auto border-none bg-zinc-100 px-6 py-2 text-[1rem] text-slate-950 outline-none selection:bg-genie-400 selection:text-genie-950 dark:bg-zinc-300 [&>*]:outline-none [&>.ql-editor]:h-full [&>div]:max-h-full
        {toolbar ? 'rounded-b-[0.4rem]' : 'rounded-[0.4rem]'}"
		{id}
		{spellcheck}
		role="textbox"
		tabindex="0"
		onpointerup={updateCsrFmt}
		onkeyupcapture={updateCsrFmt}
	></div>
</div>

{#snippet Toolbar()}
	<div
		class="flex min-h-14 flex-wrap content-start gap-2 rounded-t-[0.4rem] bg-zinc-200 px-4 pb-6 pt-4 dark:bg-zinc-200 [&>button]:text-xl"
	>
		<button class="rounded px-2 font-mono font-bold {csrFmt.bold ? twActiveButton : ''}">B</button>
		<button class="rounded px-2 font-mono italic {csrFmt.italic ? twActiveButton : ''}">I</button>
		<button class="rounded px-2 font-mono underline {csrFmt.underline ? twActiveButton : ''}">
			U
		</button>
	</div>
{/snippet}
