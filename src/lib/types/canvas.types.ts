/**
 * Canvas Type Definitions
 */

export interface Pixel {
	x: number;
	y: number;
	colorIndex: number;
}

export interface CanvasSize {
	width: number;
	height: number;
}

export interface Layer {
	id: string;
	name: string;
	visible: boolean;
	opacity: number;
	pixels: number[][];
	locked: boolean;
}

export interface CanvasState {
	width: number;
	height: number;
	layers: Layer[];
	activeLayerId: string;
	zoom: number;
	panX: number;
	panY: number;
}

export interface RenderContext {
	canvas: HTMLCanvasElement;
	ctx: CanvasRenderingContext2D;
	width: number;
	height: number;
	pixelSize: number;
	showGrid: boolean;
}

export interface CanvasHistory {
	past: CanvasState[];
	present: CanvasState;
	future: CanvasState[];
}

/**
 * Tool type - auto-generated from implementations
 *
 * @see generated-tool-types.ts
 */
export type { Tool } from './generated-tool-types';
