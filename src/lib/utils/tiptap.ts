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

// export const Indent = Extension.create({
// 	name: 'indent',

// 	// Add an "indent" attribute to the specified node types
// 	addGlobalAttributes() {
// 		return [
// 			{
// 				types: ['paragraph', 'heading', 'listItem'],
// 				attributes: {
// 					indent: {
// 						default: 0,
// 						renderHTML: (attributes) => {
// 							console.log({ attributes });
// 							return { style: `margin-left: ${attributes.indent.indent}px;` };
// 						},
// 						parseHTML: (element) => ({
// 							indent: parseInt(element.style.marginLeft) || 0
// 						})
// 					}
// 				}
// 			}
// 		];
// 	},

// 	// Commands to update the "indent" attribute
// 	addCommands() {
// 		return {
// 			indent:
// 				() =>
// 				({ chain, editor }) => {
// 					// Increase indent by 20px (adjust as needed)
// 					const { indent: currentIndent } = editor.getAttributes('paragraph');
// 					return chain()
// 						.updateAttributes('paragraph', { indent: currentIndent + 20 })
// 						.run();
// 				},
// 			outdent:
// 				() =>
// 				({ chain, editor }) => {
// 					// Decrease indent but do not go below 0
// 					const { indent: currentIndent } = editor.getAttributes('paragraph');
// 					const newIndent = Math.max(currentIndent - 20, 0);
// 					return chain().updateAttributes('paragraph', { indent: newIndent }).run();
// 				}
// 		};
// 	},

// 	// Bind the commands to common keyboard shortcuts
// 	addKeyboardShortcuts() {
// 		return {
// 			Tab: () => this.editor.commands.indent(),
// 			'Shift-Tab': () => this.editor.commands.outdent()
// 		};
// 	}
// });
