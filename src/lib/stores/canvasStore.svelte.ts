/**
 * Canvas Store - Central state management for canvas
 * Uses Svelte 5 Runes for reactivity
 */

import type { CanvasState, Layer, Pixel, Tool } from '$lib/types/canvas.types';
import { COLOR_PALETTE } from '$lib/constants/colorPalette';

function createCanvasStore() {
	// Create initial layer
	function createEmptyLayer(
		id: string,
		name: string,
		width: number,
		height: number
	): Layer {
		const pixels: number[][] = [];
		for (let y = 0; y < height; y++) {
			pixels[y] = [];
			for (let x = 0; x < width; x++) {
				pixels[y][x] = 0; // Transparent by default
			}
		}

		return {
			id,
			name,
			visible: true,
			opacity: 1.0,
			pixels,
			locked: false
		};
	}

	// Initial canvas state (8x8)
	const initialState: CanvasState = {
		width: 8,
		height: 8,
		layers: [createEmptyLayer('layer-1', 'Background', 8, 8)],
		activeLayerId: 'layer-1',
		zoom: 1.0,
		panX: 0,
		panY: 0
	};

	// State
	let width = $state(initialState.width);
	let height = $state(initialState.height);
	let layers = $state<Layer[]>(initialState.layers);
	let activeLayerId = $state(initialState.activeLayerId);
	let zoom = $state(initialState.zoom);
	let panX = $state(initialState.panX);
	let panY = $state(initialState.panY);
	let activeTool = $state<Tool>('pencil');

	// Derived state
	let activeLayer = $derived(layers.find((l) => l.id === activeLayerId));
	let visibleLayers = $derived(layers.filter((l) => l.visible));

	// Actions
	function setPixel(x: number, y: number, colorIndex: number) {
		if (!activeLayer || activeLayer.locked) return;
		if (x < 0 || x >= width || y < 0 || y >= height) return;

		// Update pixel in active layer
		const layer = layers.find((l) => l.id === activeLayerId);
		if (layer) {
			layer.pixels[y][x] = colorIndex;
		}
	}

	function getPixel(x: number, y: number, layerId?: string): number {
		const layer = layerId
			? layers.find((l) => l.id === layerId)
			: activeLayer;

		if (!layer) return 0;
		if (x < 0 || x >= width || y < 0 || y >= height) return 0;

		return layer.pixels[y][x];
	}

	function clearCanvas() {
		if (!activeLayer || activeLayer.locked) return;

		const layer = layers.find((l) => l.id === activeLayerId);
		if (layer) {
			for (let y = 0; y < height; y++) {
				for (let x = 0; x < width; x++) {
					layer.pixels[y][x] = 0; // Transparent
				}
			}
		}
	}

	function resizeCanvas(newWidth: number, newHeight: number) {
		// Resize all layers
		layers = layers.map((layer) => {
			const newPixels: number[][] = [];
			for (let y = 0; y < newHeight; y++) {
				newPixels[y] = [];
				for (let x = 0; x < newWidth; x++) {
					// Copy existing pixel or use transparent
					newPixels[y][x] =
						y < height && x < width ? layer.pixels[y][x] : 0;
				}
			}
			return { ...layer, pixels: newPixels };
		});

		width = newWidth;
		height = newHeight;
	}

	function addLayer(name: string) {
		const newLayer = createEmptyLayer(
			`layer-${Date.now()}`,
			name,
			width,
			height
		);
		layers = [...layers, newLayer];
		activeLayerId = newLayer.id;
	}

	function removeLayer(layerId: string) {
		if (layers.length <= 1) return; // Keep at least one layer

		layers = layers.filter((l) => l.id !== layerId);

		// If removed layer was active, select another
		if (layerId === activeLayerId) {
			activeLayerId = layers[layers.length - 1].id;
		}
	}

	function toggleLayerVisibility(layerId: string) {
		const layer = layers.find((l) => l.id === layerId);
		if (layer) {
			layer.visible = !layer.visible;
		}
	}

	function setActiveLayer(layerId: string) {
		if (layers.find((l) => l.id === layerId)) {
			activeLayerId = layerId;
		}
	}

	function setZoom(newZoom: number) {
		zoom = Math.max(0.1, Math.min(10, newZoom));
	}

	function setPan(x: number, y: number) {
		panX = x;
		panY = y;
	}

	// Get flattened view of all visible layers (for rendering)
	function getFlattenedPixels(): number[][] {
		const flattened: number[][] = [];

		// Initialize with transparent
		for (let y = 0; y < height; y++) {
			flattened[y] = [];
			for (let x = 0; x < width; x++) {
				flattened[y][x] = 0;
			}
		}

		// Composite layers from bottom to top
		for (const layer of layers) {
			if (!layer.visible) continue;

			for (let y = 0; y < height; y++) {
				for (let x = 0; x < width; x++) {
					const colorIndex = layer.pixels[y][x];
					// Only draw non-transparent pixels
					if (colorIndex !== 0) {
						flattened[y][x] = colorIndex;
					}
				}
			}
		}

		return flattened;
	}

	function toggleLayerLock(layerId: string) {
		const layer = layers.find((l) => l.id === layerId);
		if (layer) {
			layer.locked = !layer.locked;
		}
	}

	function renameLayer(layerId: string, newName: string) {
		const layer = layers.find((l) => l.id === layerId);
		if (layer) {
			layer.name = newName;
		}
	}

	function duplicateLayer(layerId: string) {
		const layer = layers.find((l) => l.id === layerId);
		if (!layer) return;

		// Deep copy pixels
		const pixelsCopy: number[][] = [];
		for (let y = 0; y < height; y++) {
			pixelsCopy[y] = [...layer.pixels[y]];
		}

		const newLayer: Layer = {
			id: `layer-${Date.now()}`,
			name: `${layer.name} Copy`,
			visible: true,
			opacity: layer.opacity,
			pixels: pixelsCopy,
			locked: false
		};

		// Insert after the original layer
		const index = layers.findIndex((l) => l.id === layerId);
		layers = [...layers.slice(0, index + 1), newLayer, ...layers.slice(index + 1)];
		activeLayerId = newLayer.id;
	}

	function moveLayerUp(layerId: string) {
		const index = layers.findIndex((l) => l.id === layerId);
		if (index <= 0) return; // Already at top or not found

		// Swap with layer above
		const newLayers = [...layers];
		[newLayers[index], newLayers[index - 1]] = [newLayers[index - 1], newLayers[index]];
		layers = newLayers;
	}

	function moveLayerDown(layerId: string) {
		const index = layers.findIndex((l) => l.id === layerId);
		if (index === -1 || index >= layers.length - 1) return; // Already at bottom or not found

		// Swap with layer below
		const newLayers = [...layers];
		[newLayers[index], newLayers[index + 1]] = [newLayers[index + 1], newLayers[index]];
		layers = newLayers;
	}

	function setLayerOpacity(layerId: string, opacity: number) {
		const layer = layers.find((l) => l.id === layerId);
		if (layer) {
			layer.opacity = Math.max(0, Math.min(1, opacity));
		}
	}

	function reorderLayers(newLayers: Layer[]) {
		layers = newLayers;
	}

	function setActiveTool(tool: Tool) {
		activeTool = tool;
	}

	return {
		// State (read-only getters)
		get width() {
			return width;
		},
		get height() {
			return height;
		},
		get layers() {
			return layers;
		},
		get activeLayerId() {
			return activeLayerId;
		},
		get activeLayer() {
			return activeLayer;
		},
		get visibleLayers() {
			return visibleLayers;
		},
		get zoom() {
			return zoom;
		},
		get panX() {
			return panX;
		},
		get panY() {
			return panY;
		},
		get activeTool() {
			return activeTool;
		},

		// Actions
		setPixel,
		getPixel,
		clearCanvas,
		resizeCanvas,
		addLayer,
		removeLayer,
		toggleLayerVisibility,
		toggleLayerLock,
		setActiveLayer,
		setZoom,
		setPan,
		getFlattenedPixels,
		renameLayer,
		duplicateLayer,
		moveLayerUp,
		moveLayerDown,
		setLayerOpacity,
		reorderLayers,
		setActiveTool
	};
}

// Export singleton instance
export const canvasStore = createCanvasStore();
