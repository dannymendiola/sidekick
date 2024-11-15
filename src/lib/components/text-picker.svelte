<script lang="ts">
	import { QLEditor } from '$lib';
	import { ulid } from 'ulidx';

	interface Props {
		options?: string[];
		initValue?: string;
		value?: string;
		placeholder?: string;
		selectTitle?: string;
		customOption?: string;
		customTitle?: string;
		twText?: string;
		twPlaceholder?: string;
		twBG?: string;
		twBorder?: string;
		onkeyup?: () => void;
		onfocusout?: () => void;
		onchange?: (to: string) => void;
		onlistbutton?: () => void;
	}

	let {
		options = [],
		initValue,
		value = $bindable(),
		placeholder = 'None',
		selectTitle = 'Selection',
		customOption = 'Custom...',
		customTitle = 'Custom',
		twText = 'text-donkey-800 dark:text-donkey-200',
		twPlaceholder = 'text-donkey-600 dark:text-donkey-400',
		twBG = 'bg-donkey-50 dark:bg-donkey-900',
		twBorder = 'border-none',
		onkeyup = () => {},
		onfocusout = () => {},
		onchange = (to: string) => {},
		onlistbutton = () => {}
	}: Props = $props();

	let selectedValue = $state(initValue);
	let customValue = $state('');

	let isCustom = $derived(selectedValue === '@@CUSTOM' || (value && !options.includes(value)));

	$effect(() => {
		if (isCustom) {
			value = customValue?.slice(0, -1);
		} else {
			value = selectedValue;
		}
	});
</script>

{#if !isCustom}
	<div class="flex w-full flex-col rounded-lg {twText} {twBG}" {onfocusout}>
		<div class="pl-3 pt-1 text-lg font-bold">{selectTitle}</div>
		<select
			class="w-full cursor-pointer rounded-lg px-4 pb-3 pt-1 outline-none {twText} {twBG} [&>option]:bg-donkey-200 [&>option]:dark:bg-donkey-800 {twBorder} {value ===
				'' && 'font-bold italic dark:text-donkey-300'}"
			onchange={(e) => {
				// @ts-ignore
				const val = e.target.value === '@@CUSTOM' ? '' : e.target.value;
				// @ts-ignore
				selectedValue = e.target.value;
				onchange(val);
			}}
		>
			{#if placeholder}
				<option selected={selectedValue === ''} value="" class="mt-4 {twPlaceholder}">
					{placeholder}
				</option>
			{/if}
			<option class="font-bold italic" selected={selectedValue === customOption} value="@@CUSTOM"
				>{customOption}</option
			>
			{#each options as op}
				<option class="not-italic" value={op} selected={op === selectedValue}>{op}</option>
			{/each}
		</select>
	</div>
{:else}
	<div class="flex gap-1">
		<div class="flex-grow">
			<QLEditor
				id={ulid()}
				title={customTitle}
				inputMode="info"
				initText={initValue === '@@CUSTOM' ? undefined : initValue}
				{onfocusout}
				onkeyup={() => {
					onkeyup();
					if (selectedValue === '@@CUSTOM') {
						selectedValue = '';
					}
				}}
				bind:text={customValue}
			/>
		</div>
		<button
			class="flex items-center justify-center rounded-lg bg-genie-500 p-4 drop-shadow-lg dark:bg-donkey-800 dark:drop-shadow-none dark:hover:bg-donkey-700"
			aria-label="Select"
			onpointerup={() => {
				customValue = '';
				selectedValue = '';
				onlistbutton();
			}}
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke-width="2"
				class="size-6 stroke-genie-100 dark:stroke-donkey-300"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0ZM3.75 12h.007v.008H3.75V12Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm-.375 5.25h.007v.008H3.75v-.008Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
				/>
			</svg>
		</button>
	</div>
{/if}

<style>
	select {
		-webkit-appearance: none;
		-moz-appearance: none;
		appearance: none;
	}

	select::-ms-expand {
		display: none;
	}
</style>
