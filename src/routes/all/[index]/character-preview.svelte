<script lang="ts">
	import { Delta } from 'quill/core';
	import { QLEditor } from '$lib';
	import { db } from '$lib/db';

	interface Props {
		title?: string;
		body?: Delta;
		id: string;
	}

	const { title, body, id }: Props = $props();

	let bodyFocused = $state(false);
	let titleFocused = $state(false);

	const focused = $derived(bodyFocused || titleFocused);

	let currName = $state(title);
	let currBody = $state(body);

	const placeholders = [
		'Capable, but impulsive',
		'Loose cannon',
		'Has trouble opening up',
		'Severe main character syndrome',
		'The chosen one',
		'Causes a lot of problems'
	];
</script>

<div
	class="rounded-xl border-l px-2 py-1 {focused
		? 'border-genie-600 dark:border-genie-400'
		: 'border-donkey-200 dark:border-donkey-800'}"
>
	<div class="flex items-center justify-between">
		<div class="max-w-[80%]">
			<QLEditor
				initText={title}
				id={`t-${id}`}
				twBG="bg-donkey-50 dark:bg-donkey-950"
				twClass="[&>.ql-editor>*]:font-serif [&>.ql-editor>*]:text-2xl [&>.ql-editor>*]:font-bold [&>.ql-editor::before]:font-serif [&>.ql-editor::before]:text-2xl [&>.ql-editor::before]:font-bold"
				toolbar={false}
				placeholder="Unnamed character"
				inputMode="info"
				onkeyup={async () => {
					await db.characters.update(id, { name: currName });
				}}
				onfocusout={async () => {
					await db.characters.update(id, { name: currName });
				}}
				bind:focused={titleFocused}
				bind:text={currName}
			/>
		</div>
		<a href="/character?id={id}" aria-label="Open character">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				class="size-5 stroke-2"
			>
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
				/>
			</svg>
		</a>
	</div>

	<QLEditor
		initText={body}
		{id}
		twBG="bg-donkey-50 dark:bg-donkey-950"
		toolbar={false}
		placeholder={placeholders[Math.floor(Math.random() * placeholders.length)]}
		onkeyup={async () => {
			await db.characters.update(id, { body: currBody });
		}}
		onfocusout={async () => {
			await db.characters.update(id, { body: currBody });
		}}
		bind:focused={bodyFocused}
		bind:delta={currBody}
	/>
</div>
