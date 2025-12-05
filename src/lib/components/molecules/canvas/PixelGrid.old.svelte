<!--
  @component PixelGrid

  The core interactive canvas component for pixel art drawing. Manages the HTML canvas element,
  initializes the CanvasRenderer, and handles all mouse interactions for drawing pixels.
  Integrates with canvasStore and colorStore for state management.

  @example
  ```svelte
  <PixelGrid />
  ```

  @remarks
  - Initializes CanvasRenderer with 32px pixel size and grid display
  - Uses Svelte 5's $effect rune for reactive rendering when canvas state changes
  - Tool-aware drawing: Pencil uses selected colors, Eraser sets pixels to transparent, Bucket fills areas
  - Pencil: Left-click draws with primary color, right-click draws with secondary color
  - Eraser: Both left and right click erase to transparent (color index 0)
  - Bucket: Flood fills contiguous area with primary (left-click) or secondary (right-click) color
  - Prevents context menu on right-click for seamless drawing
  - Automatic cleanup on component destroy
  - Drawing state managed with $state rune for click-and-drag functionality (except bucket tool)
  - Crosshair cursor for precise pixel placement
  - Checkerboard background for transparency visualization
  - Zoom: Mouse wheel, keyboard shortcuts (+/- to zoom, 0 to reset)
  - Canvas scales with zoom level - the canvas element itself grows/shrinks
-->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { canvasStore } from '$lib/stores/canvasStore.svelte';
	import { colorStore } from '$lib/stores/colorStore.svelte';
	import { CanvasRenderer } from '$lib/utils/renderPipeline';

	let canvasElement: HTMLCanvasElement;
	let renderer: CanvasRenderer | null = null;
	let isDrawing = $state(false);

	onMount(() => {
		// Initialize renderer with configuration
		renderer = new CanvasRenderer(canvasElement, {
			pixelSize: 32,
			showGrid: true,
			showPixelBorders: true
		});

		// Perform initial render
		renderCanvas();

		// Set up reactive rendering using $effect rune
		$effect(() => {
			// This effect runs whenever canvas state changes
			const { width, height, layers, zoom } = canvasStore;
			if (renderer) {
				renderer.requestRedraw();
				renderer.render(width, height, layers, zoom);
			}
		});

		// Add global keyboard listeners for zoom
		window.addEventListener('keydown', handleKeyDown);
	});

	onDestroy(() => {
		// Clean up renderer resources
		renderer?.destroy();

		// Remove global keyboard listener
		window.removeEventListener('keydown', handleKeyDown);
	});

	/**
	 * Renders the current canvas state to the HTML canvas element
	 */
	function renderCanvas() {
		if (!renderer) return;
		renderer.render(
			canvasStore.width,
			canvasStore.height,
			canvasStore.layers,
			canvasStore.zoom
		);
	}

	/**
	 * Handles mouse down event to start drawing
	 */
	function handleMouseDown(event: MouseEvent) {
		// Fill tool only works on click, not drag
		if (canvasStore.activeTool === 'bucket') {
			handleFill(event);
			return;
		}

		isDrawing = true;
		drawPixel(event);
	}

	/**
	 * Handles mouse move event to continue drawing when mouse is down
	 */
	function handleMouseMove(event: MouseEvent) {
		if (!isDrawing) return;
		drawPixel(event);
	}

	/**
	 * Handles mouse up event to stop drawing
	 */
	function handleMouseUp() {
		isDrawing = false;
	}

	/**
	 * Handles mouse leave event to stop drawing when cursor leaves canvas
	 */
	function handleMouseLeave() {
		isDrawing = false;
	}

	/**
	 * Draws a pixel at the mouse position with the appropriate color
	 * @param event - Mouse event containing cursor position
	 */
	function drawPixel(event: MouseEvent) {
		if (!renderer || !canvasElement) return;

		const rect = canvasElement.getBoundingClientRect();
		const coords = renderer.getPixelCoordinates(
			event.clientX,
			event.clientY,
			rect,
			canvasStore.zoom
		);

		if (!coords) return;

		const { x, y } = coords;

		// Determine color index based on active tool
		let colorIndex: number;

		if (canvasStore.activeTool === 'eraser') {
			// Eraser always sets to transparent (index 0)
			colorIndex = 0;
		} else {
			// Pencil: Use primary color for left click, secondary for right click
			colorIndex = event.button === 2 ? colorStore.secondaryColorIndex : colorStore.primaryColorIndex;
		}

		canvasStore.setPixel(x, y, colorIndex);
		renderCanvas();
	}

	/**
	 * Handles fill/bucket tool click to flood fill an area
	 * @param event - Mouse event containing cursor position
	 */
	function handleFill(event: MouseEvent) {
		if (!renderer || !canvasElement) return;

		const rect = canvasElement.getBoundingClientRect();
		const coords = renderer.getPixelCoordinates(
			event.clientX,
			event.clientY,
			rect,
			canvasStore.zoom
		);

		if (!coords) return;

		const { x, y } = coords;

		// Use primary color for left click, secondary for right click
		const colorIndex = event.button === 2 ? colorStore.secondaryColorIndex : colorStore.primaryColorIndex;

		canvasStore.fillArea(x, y, colorIndex);
		renderCanvas();
	}

	/**
	 * Prevents default context menu on right-click for seamless drawing
	 */
	function handleContextMenu(event: MouseEvent) {
		event.preventDefault();
		return false;
	}

	/**
	 * Handles mouse wheel for zooming
	 */
	function handleWheel(event: WheelEvent) {
		event.preventDefault();

		// Determine zoom direction and factor
		const zoomFactor = event.deltaY < 0 ? 1.1 : 0.9;
		canvasStore.setZoom(canvasStore.zoom * zoomFactor);
		renderCanvas();
	}

	/**
	 * Handles keyboard events for zoom shortcuts
	 */
	function handleKeyDown(event: KeyboardEvent) {
		// Ignore if typing in an input field
		if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
			return;
		}

		switch (event.key) {
			case '+':
			case '=':
				event.preventDefault();
				canvasStore.setZoom(canvasStore.zoom * 1.2);
				renderCanvas();
				break;
			case '-':
			case '_':
				event.preventDefault();
				canvasStore.setZoom(canvasStore.zoom / 1.2);
				renderCanvas();
				break;
			case '0':
				event.preventDefault();
				canvasStore.setZoom(1.0);
				renderCanvas();
				break;
		}
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
	onwheel={handleWheel}
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
