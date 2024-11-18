import { skstate } from '$lib';
import { db, Character, Dynamic, Location, Moment, Theme } from '$lib/db';

export const skElemDraggable = (
	node: HTMLElement,
	sendData: { id: string; type: string; order: number }
) => {
	if (skstate.touchscreen) return;

	node.draggable = true;

	let dragPreview: HTMLElement;

	const handleDragStart = (e: DragEvent) => {
		e.dataTransfer?.setData('text/plain', JSON.stringify(sendData));

		const rect = node.getBoundingClientRect();

		dragPreview = node.cloneNode(true) as HTMLElement;

		// Set width and height to match the original element
		// dragPreview.style.width = `${rect.width}px`;
		// dragPreview.style.height = `${rect.height}px`;
		dragPreview.style.top = `${-rect.height}px`;
		dragPreview.style.width = `${rect.width * 0.8}px`;
		dragPreview.style.opacity = '1'; // Keep solid appearance
		dragPreview.style.position = 'absolute';

		document.body.appendChild(dragPreview);

		// Calculate offsets to center the preview under the cursor
		const offsetX = e.clientX - rect.left;
		const offsetY = e.clientY - rect.top;

		e.dataTransfer?.setDragImage(dragPreview, offsetX, offsetY);

		// @ts-ignore
		e.target?.classList.add('opacity-10');
		// console.log(e.target);
		// @ts-ignore
		// e.target.classList.add('opacity-100');
	};

	const handleDragEnd = (e: DragEvent) => {
		// console.log('dragEnd:', e.target);
		dragPreview.remove();

		// @ts-ignore
		e.target.classList.remove('opacity-10');
	};

	node.addEventListener('dragstart', handleDragStart);

	node.addEventListener('dragend', handleDragEnd);

	return {
		destroy() {
			node.removeEventListener('dragstart', handleDragStart);
			node.removeEventListener('dragend', handleDragEnd);
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

		const hoveredOrder = zoneData.hoveredElem.order;
		const direction = hoveredOrder && draggedData.order < hoveredOrder ? 'down' : 'up';

		const elemToOrderAfter =
			direction === 'down' ? zoneData.hoveredElem : await zoneData.hoveredElem.getPrev();
		let dragged: typeof zoneData.hoveredElem | undefined;

		console.log('draggedData', draggedData);

		switch (draggedData.type) {
			case 'moment':
				dragged = await db.moments.get(draggedData.id);
				if (dragged) {
					if (elemToOrderAfter) {
						await dragged.orderAfter(elemToOrderAfter as Moment);
					} else {
						await dragged.orderAfter(direction === 'down' ? 'tail' : 'root');
					}
				}
				break;
			case 'character':
				dragged = await db.characters.get(draggedData.id);
				if (dragged) {
					if (elemToOrderAfter) {
						await dragged.orderAfter(elemToOrderAfter as Character);
					} else {
						await dragged.orderAfter(direction === 'down' ? 'tail' : 'root');
					}
				}
				break;
			case 'theme':
				dragged = await db.themes.get(draggedData.id);
				if (dragged) {
					if (elemToOrderAfter) {
						await dragged.orderAfter(elemToOrderAfter as Theme);
					} else {
						await dragged.orderAfter(direction === 'down' ? 'tail' : 'root');
					}
				}
				break;
			case 'character dynamic':
				dragged = await db.dynamics.get(draggedData.id);
				if (dragged) {
					if (elemToOrderAfter) {
						await dragged.orderAfter(elemToOrderAfter as Dynamic);
					} else {
						await dragged.orderAfter(direction === 'down' ? 'tail' : 'root');
					}
				}
				break;
			case 'location':
				dragged = await db.locations.get(draggedData.id);
				if (dragged) {
					if (elemToOrderAfter) {
						await dragged.orderAfter(elemToOrderAfter as Location);
					} else {
						await dragged.orderAfter(direction === 'down' ? 'tail' : 'root');
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
