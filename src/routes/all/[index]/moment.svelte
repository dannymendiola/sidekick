<script lang="ts">
	import { Delta } from 'quill/core';
	import { QLEditor } from '$lib';

	interface Props {
		title?: string;
		body?: Delta;
		id: string;
	}

	const { title, body, id }: Props = $props();

	let bodyFocused = $state(false);
	let titleFocused = $state(false);

	const focused = $derived(bodyFocused || titleFocused);

	const placeholders = [
		'And then everything worked out',
		'Insert fight sequence',
		'The protagonist is given a choice',
		'Events occur',
		'That thing that was hinted at earlier comes back to bite everyone'
	];
</script>

<div
	class="rounded-xl border-l px-2 py-1 transition-colors duration-[50ms] {focused
		? 'border-genie-600 dark:border-genie-900'
		: 'border-donkey-200 dark:border-donkey-900'}"
>
	<!-- <div class="mb-2 font-serif text-2xl font-bold">{title}</div> -->
	<div class="flex items-center justify-between">
		<div class="max-w-[66%]">
			<QLEditor
				initText={title}
				id={`t-${id}`}
				twBG="bg-donkey-50 dark:bg-donkey-950"
				toolbar={false}
				twClass="[&>.ql-editor>*]:font-serif [&>.ql-editor>*]:text-2xl [&>.ql-editor>*]:font-bold [&>.ql-editor::before]:font-serif [&>.ql-editor::before]:text-2xl [&>.ql-editor::before]:font-bold"
				bind:focused={titleFocused}
				placeholder="Untitled moment"
			/>
		</div>
		<a href={`/moment?id=${id}`} aria-label="Expanded moment"
			><svg
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
				fill="currentColor"
				class="size-5"
			>
				<path
					fill-rule="evenodd"
					d="M5.625 1.5c-1.036 0-1.875.84-1.875 1.875v17.25c0 1.035.84 1.875 1.875 1.875h12.75c1.035 0 1.875-.84 1.875-1.875V12.75A3.75 3.75 0 0 0 16.5 9h-1.875a1.875 1.875 0 0 1-1.875-1.875V5.25A3.75 3.75 0 0 0 9 1.5H5.625ZM7.5 15a.75.75 0 0 1 .75-.75h7.5a.75.75 0 0 1 0 1.5h-7.5A.75.75 0 0 1 7.5 15Zm.75 2.25a.75.75 0 0 0 0 1.5H12a.75.75 0 0 0 0-1.5H8.25Z"
					clip-rule="evenodd"
				/>
				<path
					d="M12.971 1.816A5.23 5.23 0 0 1 14.25 5.25v1.875c0 .207.168.375.375.375H16.5a5.23 5.23 0 0 1 3.434 1.279 9.768 9.768 0 0 0-6.963-6.963Z"
				/>
			</svg>
		</a>
	</div>

	<QLEditor
		initText={body}
		{id}
		twBG="bg-donkey-50 dark:bg-donkey-950"
		toolbar={false}
		bind:focused={bodyFocused}
		placeholder={placeholders[Math.floor(Math.random() * placeholders.length)]}
	/>
</div>
