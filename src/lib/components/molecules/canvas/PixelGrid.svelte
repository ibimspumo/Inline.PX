<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { canvasStore } from '$lib/stores/canvasStore.svelte';
	import { colorStore } from '$lib/stores/colorStore.svelte';
	import { CanvasRenderer } from '$lib/utils/renderPipeline';

	let canvasElement: HTMLCanvasElement;
	let renderer: CanvasRenderer | null = null;
	let isDrawing = $state(false);

	onMount(() => {
		// Initialize renderer
		renderer = new CanvasRenderer(canvasElement, {
			pixelSize: 32,
			showGrid: true,
			showPixelBorders: true
		});

		// Initial render
		renderCanvas();

		// Set up reactive rendering
		$effect(() => {
			// This effect runs whenever canvas state changes
			const { width, height, layers } = canvasStore;
			if (renderer) {
				renderer.requestRedraw();
				renderer.render(width, height, layers);
			}
		});
	});

	onDestroy(() => {
		renderer?.destroy();
	});

	function renderCanvas() {
		if (!renderer) return;
		renderer.render(canvasStore.width, canvasStore.height, canvasStore.layers);
	}

	function handleMouseDown(event: MouseEvent) {
		isDrawing = true;
		drawPixel(event);
	}

	function handleMouseMove(event: MouseEvent) {
		if (!isDrawing) return;
		drawPixel(event);
	}

	function handleMouseUp() {
		isDrawing = false;
	}

	function handleMouseLeave() {
		isDrawing = false;
	}

	function drawPixel(event: MouseEvent) {
		if (!renderer || !canvasElement) return;

		const rect = canvasElement.getBoundingClientRect();
		const coords = renderer.getPixelCoordinates(event.clientX, event.clientY, rect);

		if (!coords) return;

		const { x, y } = coords;

		// Use primary color for left click, secondary for right click
		const colorIndex = event.button === 2 ? colorStore.secondaryColorIndex : colorStore.primaryColorIndex;

		canvasStore.setPixel(x, y, colorIndex);
		renderCanvas();
	}

	function handleContextMenu(event: MouseEvent) {
		event.preventDefault();
		return false;
	}
</script>

<canvas
	bind:this={canvasElement}
	class="pixel-canvas"
	onmousedown={handleMouseDown}
	onmousemove={handleMouseMove}
	onmouseup={handleMouseUp}
	onmouseleave={handleMouseLeave}
	oncontextmenu={handleContextMenu}
></canvas>

<style>
	.pixel-canvas {
		display: block;
		image-rendering: pixelated;
		image-rendering: crisp-edges;
		cursor: crosshair;
		box-shadow: var(--shadow-lg);
		border: 2px solid var(--color-border);
		background: repeating-conic-gradient(#2a2a2a 0% 25%, #1a1a1a 0% 50%) 50% / 16px 16px;
	}

	.pixel-canvas:active {
		cursor: crosshair;
	}
</style>
