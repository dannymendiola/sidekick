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
	<!-- onpointerup={() => {
            updateFmtAtCursor();
        }}
        onkeyupcapture={() => {
            updateFmtAtCursor();
        }} -->
	<div
		class="selection:bg-meadow-500 h-full overflow-auto border-none bg-slate-100 text-[1rem] text-slate-950 dark:bg-slate-300 [&>*>*>a]:cursor-pointer [&>*>*>a]:font-bold [&>*>*>a]:text-sky-700 [&>*>*>a]:underline [&>*]:outline-none [&>div]:max-h-full
        {toolbar ? 'rounded-b-[0.4rem]' : 'rounded-[0.4rem] p-0'}"
		{id}
		{spellcheck}
		role="textbox"
		tabindex="0"
	></div>
</div>

{#snippet Toolbar()}
	<div
		class="flex min-h-14 flex-wrap content-start rounded-t-[0.4rem] bg-slate-200 px-4 pb-6 pt-4 dark:bg-slate-200 [&>*]:text-slate-800 [&>button]:text-xl"
	>
		<!-- onpointerup={() => onFmtButton('bold', cFmtBold)} -->
		<button class="rounded px-2 font-mono font-bold {csrFmt.bold ? twActiveButton : ''}">B</button>
		<button class="rounded px-2 font-mono italic {csrFmt.italic ? twActiveButton : ''}">I</button>
		<button class="rounded px-2 font-mono underline {csrFmt.underline ? twActiveButton : ''}">
			U
		</button>
	</div>
{/snippet}
