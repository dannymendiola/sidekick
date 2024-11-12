export const draggable = (node: HTMLElement) => {
	node.draggable = true;

	node.addEventListener('dragstart', (event) => {
		const rect = node.getBoundingClientRect();
		const dragPreview = node.cloneNode(true) as HTMLElement;

		const w = rect.width;
		console.log({ w });

		dragPreview.style.top = `${-rect.height}px`;
		dragPreview.style.width = `${rect.width}px`;
		dragPreview.style.opacity = '1';
		dragPreview.style.position = 'absolute';

		document.body.appendChild(dragPreview);

		const offsetX = event.clientX - rect.left;
		const offsetY = event.clientY - rect.top;

		event.dataTransfer?.setDragImage(dragPreview, offsetX, offsetY);

		node.addEventListener(
			'dragend',
			() => {
				dragPreview.remove();
			},
			{ once: true }
		);
	});
};
