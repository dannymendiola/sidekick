<script lang="ts">
	import Quill, { type QuillOptions } from 'quill';
	// import Bold from 'quill/formats/bold';
	// import Italic from 'quill/formats/italic';
	// import Underline from 'quill/formats/underline';
	// import Indent from 'quill/formats/indent';
	// import List from 'quill/formats/list';
	// import Align from 'quill/formats/align';
	import { Delta } from 'quill/core';
	import { type IconName, addKeybinds, skstate } from '$lib';
	import { onMount } from 'svelte';

	interface Props {
		id: number | string;
		placeholder?: string;
		title?: string;
		delta?: Delta; // for binding
		text?: string; // for binding
		initText?: string | Delta;
		toolbar?: boolean;
		inputMode?: 'full' | 'info';
		spellcheck?: boolean;
		twText?: string;
		twBG?: string;
		twClass?: string;
		onfocusin?: () => void;
		onfocusout?: () => void;
		onkeyup?: () => void;
		onkeypresscapture?: () => void;
		onfocusoutcapture?: () => void;
	}

	let {
		id,
		placeholder = ' ',
		initText = undefined,
		title = '',
		delta = $bindable(),
		text = $bindable(),
		inputMode = 'full',
		toolbar = inputMode === 'full',
		spellcheck = false,
		twText = undefined,
		twBG = undefined,
		twClass = '',
		onfocusin = () => {},
		onfocusout = () => {},
		onkeyup = () => {},
		onfocusoutcapture = () => {}
	}: Props = $props();

	if (!skstate.quillInit) {
		skstate.quillInit = true;
		// Quill.register({
		// 	'formats/bold': Bold,
		// 	'formats/italic': Italic,
		// 	'formats/underline': Underline,
		// 	'formats/indent': Indent,
		// 	'formats/list': List
		// 	// 'formats/align': Align
		// });
	}

	let focused = $state(false);

	const ALLOWED_FMTS =
		inputMode === 'full' ? ['bold', 'italic', 'underline', 'indent', 'list', 'align'] : [];

	const twActiveButton = 'bg-genie-800 text-genie-200';

	class CursorFormat {
		bold = $state(false);
		italic = $state(false);
		underline = $state(false);
	}

	let csrFmt = new CursorFormat();

	const updateCsrFmt = () => {
		if (!quill || inputMode === 'info') return;

		const range = quill.getSelection();
		const fmt = range ? quill.getFormat(range.index, range.length) : quill.getFormat();

		if (!fmt) return;

		csrFmt.bold = (fmt.bold as boolean) || false;
		csrFmt.italic = (fmt.italic as boolean) || false;
		csrFmt.underline = (fmt.underline as boolean) || false;
	};

	let quill: Quill | undefined = $state();
	const ID = `ql${id ? `-${id}` : ''}`;

	const KEYBINDS =
		inputMode === 'full'
			? [
					{
						key: ']',
						shortKey: true,
						handler: () => {
							quill?.format('indent', '+1');
						}
					}
				]
			: [
					// disable quill-default keybindings
					{
						key: 'i',
						shortKey: true,
						handler: () => {}
					},
					{
						key: 'u',
						shortKey: true,
						handler: () => {}
					},
					{
						key: 'b',
						shortKey: true,
						handler: () => {}
					},
					{
						key: 'Enter',
						handler: () => {}
					}
				];

	const QL_OPTS: QuillOptions = {
		placeholder: placeholder,
		formats: ALLOWED_FMTS,
		modules: {
			keyboard: {
				bindings: KEYBINDS
			}
		}
	};

	onMount(() => {
		quill = new Quill(`#${ID}`, QL_OPTS);
		quill!.on('text-change', () => {
			delta = quill!.getContents();
			text = quill!.getText();
		});
		const keybindCleanup = inputMode === 'full' ? addKeybinds(quill!) : () => {};

		if (initText) {
			delta = quill!.setContents(
				initText instanceof Delta ? initText : quill!.clipboard.convert({ text: initText })
			);
		}

		return () => {
			keybindCleanup();
		};
	});
</script>

<div class="flex h-full w-full flex-col">
	{#if toolbar}
		{@render Toolbar()}
	{:else if title}
		<div
			class="z-[1] cursor-text rounded-t-xl bg-donkey-50 px-3 pt-1 text-left text-lg font-bold {focused
				? 'dark:bg-donkey-800 '
				: 'dark:bg-donkey-900'}"
			onpointerup={() => {
				// if (skstate.touchscreen) return;
				quill!.focus();
				focused = true;
				onfocusin();
			}}
		>
			{title}
		</div>
	{/if}
	<div
		class="ql-editor-wrapper h-full cursor-text overflow-auto border-none text-[1rem] outline-none drop-shadow-md selection:bg-genie-500 selection:text-genie-50 dark:drop-shadow-none dark:selection:bg-genie-800 dark:selection:text-genie-100 [&>*]:outline-none [&>.ql-editor::before]:not-italic [&>.ql-editor::before]:text-donkey-400 [&>.ql-editor]:h-full [&>div]:max-h-full
        {toolbar || title ? 'rounded-b-lg' : 'rounded-lg'} 
		{inputMode === 'info'
			? title
				? '[&>.ql-editor]:pb-2 [&>.ql-editor]:pt-[0.3rem]'
				: '[&>.ql-editor]:py-3'
			: ''}
		{twText || 'text-donkey-950 dark:text-donkey-100'}
		{twBG || `bg-donkey-50 ${focused ? 'dark:bg-donkey-800' : 'dark:bg-donkey-900'}`}
		{twClass}"
		id={ID}
		{spellcheck}
		role="textbox"
		tabindex="0"
		onfocusin={() => {
			focused = true;
			delta = quill?.getContents();
			text = quill?.getText();
		}}
		onpointerup={() => {
			delta = quill!.getContents();
			text = quill!.getText();
			updateCsrFmt();
			onfocusin();
		}}
		onkeyup={() => {
			updateCsrFmt();
			onkeyup();
		}}
		onfocusout={() => {
			focused = false;
			onfocusout();
		}}
	></div>
</div>

{#snippet Toolbar()}
	<div
		class="flex min-h-14 flex-wrap content-start justify-end gap-2 rounded-t-lg bg-donkey-50 px-4 pb-6 pt-4 drop-shadow-md dark:drop-shadow-none [&>button]:select-none [&>button]:text-xl {focused
			? 'dark:bg-donkey-800'
			: 'dark:bg-donkey-900'}"
	>
		<button
			class="rounded px-2 font-mono font-bold {csrFmt.bold ? twActiveButton : 'text-donkey-200'}"
			onpointerup={() => {
				quill!.format('bold', !csrFmt.bold);
				updateCsrFmt();
			}}
		>
			B
		</button>

		<button class="rounded px-2 font-mono italic {csrFmt.italic ? twActiveButton : ''}"> I </button>
		<button class="rounded px-2 font-mono underline {csrFmt.underline ? twActiveButton : ''}">
			U
		</button>
		<button
			class="rounded px-2 font-mono"
			onpointerup={() => {
				quill!.format('indent', '-1');
			}}
		>
			{@render Icon('outdent')}
		</button>
		<button
			class="rounded px-2 font-mono"
			onpointerup={() => {
				quill!.format('indent', '+1');
			}}
		>
			{@render Icon('indent')}
		</button>
	</div>
{/snippet}

{#snippet Icon(name: IconName)}
	{#if name === 'indent'}
		<svg
			class="size-5 dark:stroke-zinc-200"
			viewBox="0 0 48 48"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M42 9H6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
			<path d="M29 19H6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
			<path d="M29 29H6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
			<path
				d="M37 19L42 24L37 29"
				stroke-width="4"
				stroke-linecap="round"
				stroke-linejoin="round"
			/>
			<path d="M42 39H6" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	{:else if name === 'outdent'}
		<svg
			class="size-5 dark:stroke-zinc-200"
			viewBox="0 0 48 48"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
		>
			<path d="M6 9H42" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
			<path d="M19 19H42" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
			<path d="M19 29H42" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
			<path d="M11 19L6 24L11 29" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
			<path d="M6 39H42" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
		</svg>
	{/if}
{/snippet}

<style>
	.ql-editor::before {
		font-family: 'Noto Sans', 'Arial', sans-serif !important;
	}
</style>
