/**
 * BrushableMixin - Adds brush size support to tools
 *
 * Provides brush size functionality for drawing tools
 */

import type { Constructor, Mixin } from './types';
import { commonToolOptions } from '../base/ToolOptions';

/**
 * Interface for brushable tools
 */
export interface Brushable extends Mixin {
	/**
	 * Get the current brush size from tool state
	 */
	getBrushSize(): number;

	/**
	 * Set pixels in a brush pattern around a center point
	 */
	drawBrush(x: number, y: number, colorIndex: number): void;
}

/**
 * Mixin that adds brush size functionality to a tool
 *
 * @example
 * ```typescript
 * class MyTool extends BrushableMixin(BaseTool) {
 *   // Now has getBrushSize() and drawBrush() methods
 * }
 * ```
 */
export function BrushableMixin<T extends Constructor>(Base: T) {
	return class extends Base implements Brushable {
		readonly mixinId = 'brushable';
		readonly mixinOptions = [commonToolOptions.brushSize];
		readonly mixinTags = ['brush'];

		/**
		 * Get the current brush size from tool state
		 */
		getBrushSize(): number {
			// This will be overridden by the tool implementation
			// Tools using this mixin should call toolContext.state.getToolOption()
			return 1;
		}

		/**
		 * Draw pixels in a brush pattern around a center point
		 *
		 * @param x - X coordinate of brush center
		 * @param y - Y coordinate of brush center
		 * @param colorIndex - Color index to draw
		 */
		drawBrush(x: number, y: number, colorIndex: number): void {
			// This is a helper method - tools should override or extend this
			// Default implementation draws a square brush
			const brushSize = this.getBrushSize();
			const halfSize = Math.floor(brushSize / 2);

			for (let dy = -halfSize; dy <= halfSize; dy++) {
				for (let dx = -halfSize; dx <= halfSize; dx++) {
					const px = x + dx;
					const py = y + dy;
					// Tools should implement their own setPixel logic
					// This is just a placeholder
				}
			}
		}
	};
}
