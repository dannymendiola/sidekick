<script lang="ts">
	import { Character, Project, Location, Section, Dynamic } from '$lib';
	import { Editor, type JSONContent } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Placeholder from '@tiptap/extension-placeholder';
	import { onDestroy, onMount } from 'svelte';
	import { DisableNewLine } from '$lib/utils/tiptap';
	import { type InsertType, type Table } from 'dexie';

	let element: HTMLElement | undefined = $state();
	let editor: Editor | undefined = $state();

	type Entity = Character | Section | Location | Dynamic | Project;

	interface Props {
		placeholder?: string;
		disableLineBreak?: boolean;
		disableSpellCheck?: boolean;
		boundField?: {
			entityID: string;
			entityTable:
				| Table<Entity, string, InsertType<Entity, 'id'>>
				| Table<Project, string, InsertType<Project, 'id'>>;
			fieldName: 'name' | 'body' | 'attr';
			attrName?: string;
			bindAs: 'text' | 'html' | 'json';
		};
		text?: string;
		html?: string;
		json?: JSONContent;
		initContent?: JSONContent | string;
		twClass?: string;
		focused?: boolean;
	}

	let {
		text = $bindable(),
		html = $bindable(),
		json = $bindable(),
		focused = $bindable(false),
		placeholder = undefined,
		twClass = '',
		disableLineBreak: disableNewLine = false,
		disableSpellCheck = false,
		boundField = undefined,
		initContent = undefined
	}: Props = $props();

	let extensions = [StarterKit, Placeholder.configure({ placeholder })];

	if (disableNewLine) {
		extensions.push(DisableNewLine);
	}

	const updateBoundField = async () => {
		if (!boundField) return;
		const val =
			boundField.bindAs === 'json'
				? editor?.getJSON()
				: boundField.bindAs === 'html'
					? editor?.getHTML()
					: editor?.getText();

		if (boundField.fieldName === 'attr') {
			const entity = await boundField.entityTable.get(boundField.entityID);
			const currAttr = entity?.attr || {};
			// @ts-ignore
			const newAttr = { ...currAttr, [boundField.attrName]: val };
			await boundField.entityTable.update(boundField.entityID, { attr: newAttr });
		} else {
			await boundField.entityTable.update(boundField.entityID, { [boundField.fieldName]: val });
		}
	};

	onMount(async () => {
		const entity = boundField ? await boundField.entityTable.get(boundField.entityID) : undefined;

		editor = new Editor({
			element: element,
			extensions: extensions,
			content:
				initContent ||
				(entity
					? // @ts-ignore
						entity[boundField.fieldName] || entity.attr?.[boundField.attrName] || ''
					: undefined),

			onCreate: ({ editor }) => {
				editor.view.dom.setAttribute('spellcheck', disableSpellCheck ? 'false' : 'true');
			},

			onUpdate({ editor }) {
				text = editor.getText();
				html = editor.getHTML();
				json = editor.getJSON();

				updateBoundField();
			},
			onFocus() {
				focused = true;
			},
			onBlur() {
				focused = false;
			}
		});
	});

	onDestroy(() => {
		editor?.destroy();
	});
</script>

<div bind:this={element} role="textbox" tabindex="0" class={twClass}></div>
