<script lang="ts">
	import Quill, { type QuillOptions } from 'quill';
	import Keyboard from 'quill/modules/keyboard';
	import { Delta } from 'quill/core';
	import { type IconName, addKeybinds, skstate } from '$lib';
	import { onMount } from 'svelte';

	interface Props {
		id: number | string;
		placeholder?: string;
		title?: string;
		delta?: Delta; // for binding
		text?: string; // for binding
		focused?: boolean;
		initText?: string | Delta;
		toolbar?: boolean;
		inputMode?: 'full' | 'info';
		spellcheck?: boolean;
		twText?: string;
		twBG?: string;
		twHeight?: string;
		twClass?: string;
		maxLen?: number;
		onfocusin?: () => void;
		onfocusout?: () => void;
		onkeyup?: () => void;
		onkeypresscapture?: () => void;
	}

	let {
		id,
		placeholder = ' ',
		initText = undefined,
		title = '',
		delta = $bindable(),
		text = $bindable(),
		focused = $bindable(false),
		inputMode = 'full',
		toolbar = inputMode === 'full',
		spellcheck = false,
		maxLen = undefined,
		twText = undefined,
		twBG = undefined,
		twHeight = undefined,
		twClass = '',
		onfocusin = () => {},
		onfocusout = () => {},
		onkeyup = () => {}
	}: Props = $props();

	placeholder = placeholder || ' ';

	if (!skstate.quillInit) {
		skstate.quillInit = true;
	}

	// let focused = $state(false);

	const ALLOWED_FMTS =
		inputMode === 'full' ? ['bold', 'italic', 'underline', 'indent', 'list', 'align'] : [];

	const twActiveButton = $derived(
		skstate.darkMode ? 'bg-genie-800 text-genie-100' : 'bg-genie-500 text-genie-100'
	);

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
				bindings: {
					...Keyboard.DEFAULTS.bindings,
					...KEYBINDS
				}
			}
		}
	};

	onMount(() => {
		quill = new Quill(`#${ID}`, QL_OPTS);
		quill!.on('text-change', (d) => {
			delta = quill!.getContents();
			text = quill!.getText();

			if (maxLen && text.length > maxLen) {
				quill!.deleteText(maxLen, text.length);
			}
		});
		const keybindCleanup = inputMode === 'full' ? addKeybinds(quill!) : () => {};

		if (initText) {
			let isDelta = false;
			if ((initText as Delta).ops) {
				isDelta = true;
			}
			delta = quill!.setContents(
				isDelta ? (initText as Delta) : quill!.clipboard.convert({ text: initText as string })
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
			class="z-[1] cursor-text rounded-t-xl px-3 pt-1 text-left text-lg font-bold {focused
				? 'bg-donkey-200 dark:bg-donkey-800'
				: 'bg-donkey-100 dark:bg-donkey-900'}"
			onpointerup={() => {
				quill!.focus();
				focused = true;
				onfocusin();
			}}
		>
			{title}
		</div>
	{/if}
	<div
		class="ql-editor-wrapper cursor-text overflow-auto border-none text-[1rem] outline-none selection:bg-genie-500 selection:text-genie-50 dark:drop-shadow-none dark:selection:bg-genie-800 dark:selection:text-genie-100 [&>*]:outline-none [&>.ql-editor::before]:text-donkey-300 [&>.ql-editor::before]:dark:text-donkey-600 [&>.ql-editor]:h-full [&>div]:max-h-full
        {toolbar || title ? 'rounded-b-lg' : 'rounded-lg'} 
		{inputMode === 'info'
			? title
				? '[&>.ql-editor]:pb-2 [&>.ql-editor]:pt-[0.3rem]'
				: '[&>.ql-editor]:py-3'
			: ''}
		{twText || 'text-donkey-950 dark:text-donkey-100'}
		{twBG || `${focused ? 'bg-donkey-200 dark:bg-donkey-800' : 'bg-donkey-100 dark:bg-donkey-900'}`}
		{twHeight || 'h-full'}
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
		class="z-[1] flex min-h-14 flex-wrap content-start rounded-t-lg px-4 pt-4 {title
			? 'justify-between'
			: 'justify-end gap-2 [&>button]:select-none [&>button]:text-xl'} {focused
			? 'bg-donkey-200 dark:bg-donkey-800'
			: 'bg-donkey-100 dark:bg-donkey-900'}"
	>
		{#if title}
			<h2 class="text-lg font-bold">{title}</h2>
			<div class=" flex gap-2 [&>button]:select-none [&>button]:text-xl">
				{@render ToolbarButtons()}
			</div>
		{:else}
			{@render ToolbarButtons()}
		{/if}
	</div>
{/snippet}

{#snippet Icon(name: IconName)}
	{#if name === 'indent'}
		<svg
			class="size-5 stroke-donkey-800 dark:stroke-donkey-200"
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
			class="size-5 stroke-donkey-800 dark:stroke-donkey-200"
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

{#snippet ToolbarButtons()}
	<button
		class="rounded px-2 font-mono font-bold {csrFmt.bold ? twActiveButton : ''}"
		onpointerup={() => {
			quill!.format('bold', !csrFmt.bold);
			updateCsrFmt();
		}}
		tabindex="-1"
	>
		B
	</button>

	<button
		class="rounded px-2 font-mono italic {csrFmt.italic ? twActiveButton : ''}"
		onpointerup={() => {
			quill!.format('italic', !csrFmt.italic);
			updateCsrFmt();
		}}
	>
		I
	</button>
	<button
		class="rounded px-2 font-mono underline {csrFmt.underline ? twActiveButton : ''}"
		onpointerup={() => {
			quill!.format('underline', !csrFmt.underline);
			updateCsrFmt();
		}}
	>
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
{/snippet}

<style>
	.ql-editor::before {
		font-family: 'Noto Sans', 'Arial', sans-serif !important;
	}
</style>
