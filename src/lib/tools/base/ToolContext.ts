/**
 * Tool Context - Runtime context passed to tools
 *
 * Provides tools with access to canvas state, rendering, and stores
 * without direct coupling to implementation details.
 */

import type { Layer } from '$lib/types/canvas.types';
import type { CanvasRenderer } from '$lib/utils/renderPipeline';
import type { ToolStateManager } from '../state/ToolStateManager.svelte';

/**
 * Mouse event context for tool interactions
 */
export interface MouseEventContext {
	/** Pixel X coordinate (in canvas space) */
	x: number;
	/** Pixel Y coordinate (in canvas space) */
	y: number;
	/** Mouse button (0 = left, 1 = middle, 2 = right) */
	button: number;
	/** Original mouse event */
	originalEvent: MouseEvent;
}

/**
 * Canvas context for tool operations
 */
export interface CanvasContext {
	/** Canvas width in pixels */
	width: number;
	/** Canvas height in pixels */
	height: number;
	/** All layers (bottom to top) */
	layers: Layer[];
	/** Active layer ID */
	activeLayerId: string;
	/** Current zoom level */
	zoom: number;
	/** Pan offset X */
	panX: number;
	/** Pan offset Y */
	panY: number;
}

/**
 * Color context for tool operations
 */
export interface ColorContext {
	/** Primary color index (0-63) */
	primaryColorIndex: number;
	/** Secondary color index (0-63) */
	secondaryColorIndex: number;
}

/**
 * Complete tool context provided to all tool methods
 */
export interface ToolContext {
	/** Canvas state */
	canvas: CanvasContext;
	/** Color state */
	colors: ColorContext;
	/** Canvas renderer for re-rendering */
	renderer: CanvasRenderer | null;
	/** Tool state manager for persistent settings */
	state: ToolStateManager;
	/** Set pixel method */
	setPixel: (x: number, y: number, colorIndex: number) => void;
	/** Get pixel method */
	getPixel: (x: number, y: number, layerId?: string) => number;
	/** Request canvas redraw */
	requestRedraw: () => void;
	/** Set primary color index */
	setPrimaryColor: (colorIndex: number) => void;
	/** Set secondary color index */
	setSecondaryColor: (colorIndex: number) => void;
	/** Set pan offset */
	setPan: (x: number, y: number) => void;
}
