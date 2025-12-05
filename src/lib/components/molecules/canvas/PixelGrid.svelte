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
  - Left-click draws with primary color, right-click draws with secondary color
  - Prevents context menu on right-click for seamless drawing
  - Automatic cleanup on component destroy
  - Drawing state managed with $state rune for click-and-drag functionality
  - Crosshair cursor for precise pixel placement
  - Checkerboard background for transparency visualization
  - Zoom: Mouse wheel, keyboard shortcuts (+/- to zoom, 0 to reset)
  - Pan: Middle mouse button drag, or Space + left mouse drag
  - Zoom centers on mouse cursor position for intuitive navigation
-->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { canvasStore } from '$lib/stores/canvasStore.svelte';
	import { colorStore } from '$lib/stores/colorStore.svelte';
	import { CanvasRenderer } from '$lib/utils/renderPipeline';

	let canvasElement: HTMLCanvasElement;
	let renderer: CanvasRenderer | null = null;
	let isDrawing = $state(false);
	let isPanning = $state(false);
	let lastMouseX = $state(0);
	let lastMouseY = $state(0);
	let isSpacePressed = $state(false);

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
			const { width, height, layers, zoom, panX, panY } = canvasStore;
			if (renderer) {
				renderer.requestRedraw();
				renderer.render(width, height, layers, zoom, panX, panY);
			}
		});

		// Add global keyboard listeners for zoom and pan
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
	});

	onDestroy(() => {
		// Clean up renderer resources
		renderer?.destroy();

		// Remove global keyboard listeners
		window.removeEventListener('keydown', handleKeyDown);
		window.removeEventListener('keyup', handleKeyUp);
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
			canvasStore.zoom,
			canvasStore.panX,
			canvasStore.panY
		);
	}

	/**
	 * Handles mouse down event to start drawing or panning
	 */
	function handleMouseDown(event: MouseEvent) {
		// Middle mouse button or space+left click for panning
		if (event.button === 1 || (event.button === 0 && isSpacePressed)) {
			isPanning = true;
			lastMouseX = event.clientX;
			lastMouseY = event.clientY;
			if (canvasElement) {
				canvasElement.style.cursor = 'grabbing';
			}
			return;
		}

		// Regular drawing
		isDrawing = true;
		drawPixel(event);
	}

	/**
	 * Handles mouse move event to continue drawing or panning when mouse is down
	 */
	function handleMouseMove(event: MouseEvent) {
		// Handle panning
		if (isPanning) {
			const deltaX = event.clientX - lastMouseX;
			const deltaY = event.clientY - lastMouseY;

			canvasStore.setPan(canvasStore.panX + deltaX, canvasStore.panY + deltaY);

			lastMouseX = event.clientX;
			lastMouseY = event.clientY;

			renderCanvas();
			return;
		}

		// Handle drawing
		if (!isDrawing) return;
		drawPixel(event);
	}

	/**
	 * Handles mouse up event to stop drawing or panning
	 */
	function handleMouseUp() {
		isDrawing = false;
		isPanning = false;
		if (canvasElement && isSpacePressed) {
			canvasElement.style.cursor = 'grab';
		} else if (canvasElement) {
			canvasElement.style.cursor = 'crosshair';
		}
	}

	/**
	 * Handles mouse leave event to stop drawing when cursor leaves canvas
	 */
	function handleMouseLeave() {
		isDrawing = false;
		isPanning = false;
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
			canvasStore.zoom,
			canvasStore.panX,
			canvasStore.panY
		);

		if (!coords) return;

		const { x, y } = coords;

		// Use primary color for left click, secondary for right click
		const colorIndex = event.button === 2 ? colorStore.secondaryColorIndex : colorStore.primaryColorIndex;

		canvasStore.setPixel(x, y, colorIndex);
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
		const newZoom = canvasStore.zoom * zoomFactor;

		// Get mouse position relative to canvas
		const rect = canvasElement.getBoundingClientRect();
		const mouseX = event.clientX - rect.left;
		const mouseY = event.clientY - rect.top;

		// Calculate world position before zoom
		const worldXBefore = (mouseX - canvasStore.panX) / canvasStore.zoom;
		const worldYBefore = (mouseY - canvasStore.panY) / canvasStore.zoom;

		// Apply zoom
		canvasStore.setZoom(newZoom);

		// Calculate world position after zoom
		const worldXAfter = (mouseX - canvasStore.panX) / canvasStore.zoom;
		const worldYAfter = (mouseY - canvasStore.panY) / canvasStore.zoom;

		// Adjust pan to keep mouse position stable
		const panXAdjust = (worldXAfter - worldXBefore) * canvasStore.zoom;
		const panYAdjust = (worldYAfter - worldYBefore) * canvasStore.zoom;

		canvasStore.setPan(canvasStore.panX - panXAdjust, canvasStore.panY - panYAdjust);

		renderCanvas();
	}

	/**
	 * Handles keyboard events for zoom shortcuts and pan mode
	 */
	function handleKeyDown(event: KeyboardEvent) {
		// Ignore if typing in an input field
		if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
			return;
		}

		switch (event.key) {
			case ' ':
				event.preventDefault();
				isSpacePressed = true;
				if (canvasElement) {
					canvasElement.style.cursor = 'grab';
				}
				break;
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
				canvasStore.setPan(0, 0);
				renderCanvas();
				break;
		}
	}

	/**
	 * Handles keyboard up events
	 */
	function handleKeyUp(event: KeyboardEvent) {
		if (event.key === ' ') {
			isSpacePressed = false;
			isPanning = false;
			if (canvasElement) {
				canvasElement.style.cursor = 'crosshair';
			}
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
