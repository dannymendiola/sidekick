<script lang="ts">
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import { onDestroy, onMount } from 'svelte';

	let element: HTMLElement | undefined = $state();
	let editor: Editor | undefined = $state();
	let focused = $state(false);

	interface Props {
		placeholder?: string;
	}

	onMount(() => {
		editor = new Editor({
			element: element,
			extensions: [StarterKit],
			content:
				'<h1>Hello World!</h1><h2>Hello World!</h2><h3>Hello World!</h3><h4>Hello World!</h4><h5>Hello World!</h5><h6>Hello World!</h6><p>Hello World!</p>',

			onUpdate({ editor }) {
				// console.log(editor.getHTML());
				// console.log(editor.getText());
				// console.log(editor.getJSON());
				// editor.commands.
			},
			onFocus() {
				focused = true;
			},
			onBlur() {
				focused = false;
			}
		});

		onDestroy(() => {
			editor?.destroy();
		});
	});
</script>

<div class="" bind:this={element}></div>
