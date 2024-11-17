// export const draggable = (node: HTMLElement) => {
// 	node.draggable = true;

// 	node.addEventListener('dragstart', (event) => {
// 		const rect = node.getBoundingClientRect();
// 		const dragPreview = node.cloneNode(true) as HTMLElement;

// 		const w = rect.width;
// 		console.log({ w });

// 		dragPreview.style.top = `${-rect.height}px`;
// 		dragPreview.style.width = `${rect.width}px`;
// 		dragPreview.style.opacity = '1';
// 		dragPreview.style.position = 'absolute';

// 		document.body.appendChild(dragPreview);

// 		const offsetX = event.clientX - rect.left;
// 		const offsetY = event.clientY - rect.top;

// 		event.dataTransfer?.setDragImage(dragPreview, offsetX, offsetY);

// 		node.addEventListener(
// 			'dragend',
// 			() => {
// 				dragPreview.remove();
// 			},
// 			{ once: true }
// 		);

// 		node.addEventListener('dragenter', (e) => {
// 			e.preventDefault();
// 		});
// 	});
// };

import { skstate } from '$lib';
import { db, Character, Dynamic, Location, Moment, Theme } from '$lib/db';

// import {db}

export const skElemDraggable = (node: HTMLElement, sendData: { id: string; type: string }) => {
	if (skstate.touchscreen) return;

	node.draggable = true;

	const handleDragStart = (e: DragEvent) => {
		e.dataTransfer?.setData('text/plain', JSON.stringify(sendData));
	};

	node.addEventListener('dragstart', handleDragStart);

	return {
		destroy() {
			node.removeEventListener('dragstart', handleDragStart);
		}
	};
};

export const skElemDragTarget = (
	node: HTMLElement,
	zoneData: {
		hoveredElem: Moment | Character | Theme | Dynamic | Location;
	}
) => {
	const handleDragOver = (e: DragEvent) => {
		e.preventDefault();
	};

	const handleDrop = async (e: DragEvent) => {
		const json = e.dataTransfer?.getData('text/plain');
		const draggedData = JSON.parse(json || '{}');

		const hoveredPrev = await zoneData.hoveredElem.getPrev();
		let dragged: typeof zoneData.hoveredElem | undefined;

		switch (draggedData.type) {
			case 'moment':
				dragged = await db.moments.get(draggedData.id);
				if (dragged) {
					if (hoveredPrev) {
						await dragged.orderAfter(hoveredPrev as Moment);
					} else {
						await dragged.orderAfter('root');
					}
				}
				break;
			case 'character':
				dragged = await db.characters.get(draggedData.id);
				if (dragged) {
					if (hoveredPrev) {
						await dragged.orderAfter(hoveredPrev as Character);
					} else {
						await dragged.orderAfter('root');
					}
				}
				break;
			case 'theme':
				dragged = await db.themes.get(draggedData.id);
				if (dragged) {
					if (hoveredPrev) {
						await dragged.orderAfter(hoveredPrev as Theme);
					} else {
						await dragged.orderAfter('root');
					}
				}
				break;
			case 'character-dynmaic':
				dragged = await db.dynamics.get(draggedData.id);
				if (dragged) {
					if (hoveredPrev) {
						await dragged.orderAfter(hoveredPrev as Dynamic);
					} else {
						await dragged.orderAfter('root');
					}
				}
				break;
			case 'location':
				dragged = await db.locations.get(draggedData.id);
				if (dragged) {
					if (hoveredPrev) {
						await dragged.orderAfter(hoveredPrev as Location);
					} else {
						await dragged.orderAfter('root');
					}
				}
				break;
		}
	};

	node.addEventListener('dragover', handleDragOver);
	node.addEventListener('drop', handleDrop);

	return {
		destroy() {
			node.removeEventListener('dragover', handleDragOver);
			node.removeEventListener('drop', handleDrop);
		}
	};
};
