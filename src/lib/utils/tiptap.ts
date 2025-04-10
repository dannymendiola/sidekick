import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

export const DisableNewLine = Extension.create({
	name: 'disableNewLine',
	addProseMirrorPlugins() {
		return [
			new Plugin({
				key: new PluginKey('eventHandler'),
				props: {
					handleKeyDown: (view, event) => {
						if (event.key === 'Enter') {
							return true;
						}
					}
				}
			})
		];
	}
});
