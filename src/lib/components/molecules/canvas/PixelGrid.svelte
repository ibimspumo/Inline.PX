<!--
  @component PixelGrid

  The core interactive canvas component for pixel art drawing. Manages the HTML canvas element,
  initializes the CanvasRenderer, and handles all mouse interactions using the plugin-based tool system.
  Integrates with canvasStore, colorStore, and toolRegistry for state management.

  @example
  ```svelte
  <PixelGrid />
  ```

  @remarks
  - Initializes CanvasRenderer with 32px pixel size and grid display
  - Uses Svelte 5's $effect rune for reactive rendering when canvas state changes
  - Plugin-based tool system: All tools are self-contained and auto-registered
  - Tools handle their own mouse events (click, drag, etc.)
  - Prevents context menu on right-click for seamless drawing
  - Automatic cleanup on component destroy
  - Dynamic cursor based on active tool configuration
  - Checkerboard background for transparency visualization
  - Zoom: Mouse wheel, keyboard shortcuts (+/- to zoom, 0 to reset)
  - Canvas scales with zoom level - the canvas element itself grows/shrinks
-->
<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { canvasStore } from '$lib/stores/canvasStore.svelte';
	import { colorStore } from '$lib/stores/colorStore.svelte';
	import { CanvasRenderer } from '$lib/utils/renderPipeline';
	import { toolRegistry, loadAllTools } from '$lib/tools';
	import type { ToolContext, MouseEventContext } from '$lib/tools';

	let canvasElement: HTMLCanvasElement;
	let renderer: CanvasRenderer | null = null;
	let isDrawing = $state(false);
	let toolsLoaded = $state(false);

	// Set up reactive rendering using $effect rune (must be at top level)
	$effect(() => {
		// This effect runs whenever canvas state changes
		const { width, height, layers, zoom } = canvasStore;
		if (renderer && toolsLoaded) {
			renderer.requestRedraw();
			renderer.render(width, height, layers, zoom);
		}
	});

	// React to tool changes
	$effect(() => {
		if (!toolsLoaded) return;

		const activeTool = toolRegistry.getTool(canvasStore.activeTool);
		if (activeTool && activeTool.onActivate) {
			activeTool.onActivate(createToolContext());
		}

		return () => {
			// Cleanup when tool changes
			if (activeTool && activeTool.onDeactivate) {
				activeTool.onDeactivate(createToolContext());
			}
		};
	});

	onMount(async () => {
		// Load all tools first
		await loadAllTools();
		toolsLoaded = true;

		// Initialize renderer with configuration
		renderer = new CanvasRenderer(canvasElement, {
			pixelSize: 32,
			showGrid: true,
			showPixelBorders: true
		});

		// Perform initial render
		renderCanvas();

		// Add global keyboard listeners
		window.addEventListener('keydown', handleKeyDown);
	});

	onDestroy(() => {
		// Notify active tool of deactivation
		const activeTool = toolRegistry.getTool(canvasStore.activeTool);
		if (activeTool && activeTool.onDeactivate) {
			activeTool.onDeactivate(createToolContext());
		}

		// Clean up renderer resources
		renderer?.destroy();

		// Remove global keyboard listener
		window.removeEventListener('keydown', handleKeyDown);
	});

	/**
	 * Create tool context for current state
	 */
	function createToolContext(): ToolContext {
		return {
			canvas: {
				width: canvasStore.width,
				height: canvasStore.height,
				layers: canvasStore.layers,
				activeLayerId: canvasStore.activeLayerId,
				zoom: canvasStore.zoom
			},
			colors: {
				primaryColorIndex: colorStore.primaryColorIndex,
				secondaryColorIndex: colorStore.secondaryColorIndex
			},
			renderer,
			setPixel: (x, y, colorIndex) => canvasStore.setPixel(x, y, colorIndex),
			getPixel: (x, y, layerId) => canvasStore.getPixel(x, y, layerId),
			requestRedraw: () => renderCanvas()
		};
	}

	/**
	 * Create mouse event context from MouseEvent
	 */
	function createMouseContext(event: MouseEvent): MouseEventContext | null {
		if (!renderer || !canvasElement) return null;

		const rect = canvasElement.getBoundingClientRect();
		const coords = renderer.getPixelCoordinates(
			event.clientX,
			event.clientY,
			rect,
			canvasStore.zoom
		);

		if (!coords) return null;

		return {
			x: coords.x,
			y: coords.y,
			button: event.button,
			originalEvent: event
		};
	}

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
	 * Handles mouse down event
	 */
	function handleMouseDown(event: MouseEvent) {
		if (!toolsLoaded) return;

		const tool = toolRegistry.getTool(canvasStore.activeTool);
		if (!tool) return;

		const mouseContext = createMouseContext(event);
		if (!mouseContext) return;

		const toolContext = createToolContext();

		// Check if tool can be used
		if (tool.canUse) {
			const { valid, reason } = tool.canUse(toolContext);
			if (!valid) {
				console.warn(`Tool ${tool.config.name} cannot be used: ${reason}`);
				return;
			}
		}

		// Handle click for non-drag tools
		if (!tool.config.supportsDrag && tool.onClick) {
			tool.onClick(mouseContext, toolContext);
			return;
		}

		// Handle mouse down for drag tools
		if (tool.config.supportsDrag) {
			isDrawing = true;
			if (tool.onMouseDown) {
				tool.onMouseDown(mouseContext, toolContext);
			}
		}
	}

	/**
	 * Handles mouse move event
	 */
	function handleMouseMove(event: MouseEvent) {
		if (!isDrawing || !toolsLoaded) return;

		const tool = toolRegistry.getTool(canvasStore.activeTool);
		if (!tool || !tool.config.supportsDrag || !tool.onMouseMove) return;

		const mouseContext = createMouseContext(event);
		if (!mouseContext) return;

		const toolContext = createToolContext();
		tool.onMouseMove(mouseContext, toolContext);
	}

	/**
	 * Handles mouse up event
	 */
	function handleMouseUp(event: MouseEvent) {
		if (!toolsLoaded) return;

		const tool = toolRegistry.getTool(canvasStore.activeTool);

		if (tool && tool.onMouseUp) {
			const mouseContext = createMouseContext(event);
			if (mouseContext) {
				const toolContext = createToolContext();
				tool.onMouseUp(mouseContext, toolContext);
			}
		}

		isDrawing = false;
	}

	/**
	 * Handles mouse leave event
	 */
	function handleMouseLeave() {
		isDrawing = false;
	}

	/**
	 * Prevents default context menu on right-click
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
	 * Handles keyboard events for zoom shortcuts and tool shortcuts
	 */
	function handleKeyDown(event: KeyboardEvent) {
		// Ignore if typing in an input field
		if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
			return;
		}

		// Check for tool shortcuts first
		if (toolsLoaded && event.key.length === 1) {
			const tool = toolRegistry.getToolByShortcut(event.key);
			if (tool) {
				event.preventDefault();
				canvasStore.setActiveTool(tool.config.id as any);
				return;
			}
		}

		// Handle zoom shortcuts
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

	// Get cursor style from active tool
	$effect(() => {
		if (!toolsLoaded) return;
		const tool = toolRegistry.getTool(canvasStore.activeTool);
		if (tool && canvasElement) {
			canvasElement.style.cursor = tool.config.cursor;
		}
	});
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
		box-shadow: var(--shadow-lg);
		border: 2px solid var(--color-border);
		background: repeating-conic-gradient(#2a2a2a 0% 25%, #1a1a1a 0% 50%) 50% / 16px 16px;
	}

	.pixel-canvas:active {
		cursor: inherit; /* Use tool-specific cursor */
	}
</style>
