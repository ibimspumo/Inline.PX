<script>
	/**
	 * CanvasWrapper - Svelte 5 Canvas Integration
	 *
	 * Wraps the existing PixelCanvas.js logic and makes it reactive.
	 * Uses $effect to sync Svelte state with imperative canvas operations.
	 *
	 * @component
	 */
	import { onMount, onDestroy } from 'svelte';
	import { editor } from '$lib/stores/editor.svelte.js';
	import PixelCanvas from '../../../js/canvas/PixelCanvas.js';

	/** @type {HTMLCanvasElement | null} */
	let canvasElement = $state(null);

	/** @type {boolean} */
	let initialized = $state(false);

	/**
	 * Initialize PixelCanvas when component mounts
	 */
	onMount(async () => {
		if (!canvasElement) return;

		try {
			// Initialize PixelCanvas with current state
			await PixelCanvas.init(
				'pixel-canvas',
				editor.canvas.width,
				editor.canvas.height,
				handleCanvasChange
			);

			// Sync initial state from store to canvas
			syncStoreToCanvas();

			initialized = true;
			console.log('CanvasWrapper: PixelCanvas initialized');
		} catch (error) {
			console.error('CanvasWrapper: Failed to initialize PixelCanvas', error);
		}
	});

	/**
	 * Cleanup on component destroy
	 */
	onDestroy(() => {
		if (initialized) {
			PixelCanvas.destroy();
			initialized = false;
		}
	});

	/**
	 * Handle canvas changes from PixelCanvas.js
	 * Sync back to Svelte state
	 */
	function handleCanvasChange() {
		if (!initialized) return;

		// Export current state and update store
		const dataString = PixelCanvas.exportToString();
		editor.canvas.importFromString(dataString);

		// Mark file as dirty
		editor.file.markDirty();
	}

	/**
	 * Sync Svelte store state to PixelCanvas
	 */
	function syncStoreToCanvas() {
		if (!initialized) return;

		const dataString = editor.canvas.exportToString();
		PixelCanvas.importFromString(dataString);
	}

	/**
	 * React to canvas dimension changes from store
	 */
	$effect(() => {
		if (initialized) {
			const { width, height } = editor.canvas;
			PixelCanvas.resize(width, height);
		}
	});

	/**
	 * React to tool changes from store
	 */
	$effect(() => {
		if (initialized) {
			const { currentToolId, brushSize, shapeMode, selectedColor } = editor.tool;

			// Sync tool options to ToolRegistry
			if (window.ToolRegistry) {
				window.ToolRegistry.setCurrentTool(currentToolId);
				window.ToolRegistry.setToolOption('brushSize', brushSize);
				window.ToolRegistry.setToolOption('shapeMode', shapeMode);
				window.ToolRegistry.setToolOption('colorCode', selectedColor);
			}
		}
	});

	/**
	 * React to grid visibility changes
	 */
	$effect(() => {
		if (initialized) {
			const { gridVisible } = editor.canvas;

			if (window.CanvasRenderer) {
				window.CanvasRenderer.setGridVisible(gridVisible);
			}
		}
	});

	/**
	 * React to clear canvas action
	 */
	$effect(() => {
		if (initialized && editor.canvas.pixels.length === 0) {
			PixelCanvas.clear();
		}
	});
</script>

<div class="canvas-wrapper">
	<canvas id="pixel-canvas" bind:this={canvasElement}></canvas>
</div>

<style>
	.canvas-wrapper {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--canvas-bg, #1a1a1a);
		position: relative;
		overflow: hidden;
	}

	canvas {
		image-rendering: pixelated;
		image-rendering: crisp-edges;
		image-rendering: -moz-crisp-edges;
		border: 1px solid var(--border);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
	}
</style>
