/**
 * Editor State Store (Svelte 5 Simplified)
 *
 * Central reactive state management using Svelte 5 writable stores.
 * This version uses standard Svelte stores for compatibility.
 *
 * @module stores/editor-simple
 */

import { writable } from 'svelte/store';

// ==================== CANVAS STATE ====================

function createCanvasStore() {
	const { subscribe, update } = writable({
		width: 16,
		height: 16,
		pixels: Array.from({ length: 16 }, () => Array.from({ length: 16 }, () => 0)),
		gridVisible: true,
		zoom: 1
	});

	return {
		subscribe,
		resize(newWidth, newHeight) {
			update(state => {
				const oldPixels = state.pixels;
				const oldHeight = state.height;
				const oldWidth = state.width;

				const newPixels = Array.from({ length: newHeight }, (_, y) =>
					Array.from({ length: newWidth }, (_, x) => {
						if (y < oldHeight && x < oldWidth) {
							return oldPixels[y][x];
						}
						return 0;
					})
				);

				return {
					...state,
					width: newWidth,
					height: newHeight,
					pixels: newPixels
				};
			});
		},
		clear() {
			update(state => ({
				...state,
				pixels: Array.from({ length: state.height }, () =>
					Array.from({ length: state.width }, () => 0)
				)
			}));
		},
		toggleGrid() {
			update(state => ({ ...state, gridVisible: !state.gridVisible }));
		},
		setZoom(zoomLevel) {
			update(state => ({
				...state,
				zoom: Math.max(0.1, Math.min(10, zoomLevel))
			}));
		}
	};
}

// ==================== TOOL STATE ====================

function createToolStore() {
	const { subscribe, update } = writable({
		currentToolId: 'brush',
		brushSize: 1,
		shapeMode: 'fill',
		selectedColor: 1
	});

	return {
		subscribe,
		setTool(toolId) {
			update(state => ({ ...state, currentToolId: toolId }));
		},
		setBrushSize(size) {
			update(state => ({
				...state,
				brushSize: Math.max(1, Math.min(10, size))
			}));
		},
		setShapeMode(mode) {
			update(state => ({ ...state, shapeMode: mode }));
		},
		setColor(colorIndex) {
			update(state => ({ ...state, selectedColor: colorIndex }));
		}
	};
}

// ==================== FILE STATE ====================

function createFileStore() {
	const { subscribe, update } = writable({
		currentFileName: 'Untitled',
		isDirty: false,
		lastSaved: Date.now()
	});

	return {
		subscribe,
		markDirty() {
			update(state => ({ ...state, isDirty: true }));
		},
		markClean() {
			update(state => ({
				...state,
				isDirty: false,
				lastSaved: Date.now()
			}));
		},
		setFileName(name) {
			update(state => ({ ...state, currentFileName: name }));
		}
	};
}

// ==================== EDITOR STORE (SINGLETON) ====================

export const editor = {
	canvas: createCanvasStore(),
	tool: createToolStore(),
	file: createFileStore()
};
