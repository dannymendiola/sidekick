<script lang="ts">
	import Quill, { type QuillOptions } from 'quill';
	import { Delta } from 'quill/core';
	import { type IconName, addKeybinds } from '$lib';
	import { onMount } from 'svelte';

	interface Props {
		id: number | string;
		placeholder?: string;
		text?: Delta;
		initText?: Delta;
		toolbar?: boolean;
		inputMode?: 'full' | 'info';
		spellcheck?: boolean;
	}

	let {
		id,
		placeholder = ' ',
		initText = undefined,
		text = $bindable(),
		inputMode = 'full',
		toolbar = inputMode === 'full',
		spellcheck = false
	}: Props = $props();

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
		if (!quill) return;

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
			text = quill!.getContents();
		});
		const keybindCleanup = inputMode === 'full' ? addKeybinds(quill!) : () => {};

		if (initText) {
			quill!.setContents(initText);
		}

		return () => {
			keybindCleanup();
		};
	});
</script>

<div class="flex h-full w-full flex-col">
	{#if toolbar}
		{@render Toolbar()}
	{/if}
	<div
		class="ql-editor-wrapper h-full cursor-text overflow-auto border-none bg-donkey-50 px-2 text-[1rem] text-donkey-950 outline-none drop-shadow-md selection:bg-genie-800 selection:text-genie-300 dark:bg-donkey-300 dark:drop-shadow-none [&>*]:outline-none [&>.ql-editor::before]:not-italic [&>.ql-editor::before]:text-donkey-600 [&>.ql-editor]:h-full [&>div]:max-h-full
        {toolbar ? 'rounded-b-xl' : 'rounded-xl'}"
		id={ID}
		{spellcheck}
		role="textbox"
		tabindex="0"
		onpointerup={updateCsrFmt}
		onkeyupcapture={updateCsrFmt}
	></div>
</div>

{#snippet Toolbar()}
	<div
		class="flex min-h-14 flex-wrap content-start justify-end gap-2 rounded-t-xl bg-donkey-50 px-4 pb-6 pt-4 drop-shadow-md dark:bg-donkey-300 dark:drop-shadow-none [&>button]:select-none [&>button]:text-xl"
	>
		<button
			class="rounded px-2 font-mono font-bold {csrFmt.bold ? twActiveButton : 'text-donkey-700'}"
			onpointerup={() => {
				quill!.format('bold', !csrFmt.bold);
				updateCsrFmt();
			}}
		>
			B
		</button>

		<button
			class="rounded px-2 font-mono italic {csrFmt.italic ? twActiveButton : 'text-donkey-700'}"
		>
			I
		</button>
		<button
			class="rounded px-2 font-mono underline {csrFmt.underline
				? twActiveButton
				: 'text-donkey-700'}"
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
	</div>
{/snippet}

{#snippet Icon(name: IconName)}
	{#if name === 'indent'}
		<svg
			class="size-5 stroke-zinc-900"
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
			class="size-5 stroke-zinc-900"
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
