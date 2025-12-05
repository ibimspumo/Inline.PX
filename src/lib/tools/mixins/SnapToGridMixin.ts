/**
 * SnapToGridMixin - Adds grid snapping support to tools
 *
 * Provides grid snapping functionality for precise pixel placement
 */

import type { Constructor, Mixin } from './types';
import { commonToolOptions } from '../base/ToolOptions';

/**
 * Interface for grid-snappable tools
 */
export interface SnapToGrid extends Mixin {
	/**
	 * Snap coordinates to grid
	 */
	snapToGrid(x: number, y: number): { x: number; y: number };

	/**
	 * Check if grid snapping is enabled
	 */
	isGridSnapEnabled(): boolean;

	/**
	 * Get the current grid size
	 */
	getGridSize(): number;
}

/**
 * Mixin that adds grid snapping functionality to a tool
 *
 * @example
 * ```typescript
 * class MyTool extends SnapToGridMixin(BaseTool) {
 *   // Now has snapToGrid(), isGridSnapEnabled(), and getGridSize() methods
 * }
 * ```
 */
export function SnapToGridMixin<T extends Constructor>(Base: T) {
	return class extends Base implements SnapToGrid {
		readonly mixinId = 'snapToGrid';
		readonly mixinOptions = [commonToolOptions.snapToGrid, commonToolOptions.gridSize];
		readonly mixinTags = ['grid', 'precision'];

		/**
		 * Snap coordinates to grid
		 *
		 * @param x - X coordinate to snap
		 * @param y - Y coordinate to snap
		 * @returns Snapped coordinates
		 */
		snapToGrid(x: number, y: number): { x: number; y: number } {
			if (!this.isGridSnapEnabled()) {
				return { x, y };
			}

			const gridSize = this.getGridSize();
			return {
				x: Math.floor(x / gridSize) * gridSize,
				y: Math.floor(y / gridSize) * gridSize
			};
		}

		/**
		 * Check if grid snapping is enabled
		 *
		 * @returns True if grid snapping is enabled
		 */
		isGridSnapEnabled(): boolean {
			// This will be overridden by the tool implementation
			// Tools using this mixin should call toolContext.state.getToolOption()
			return false;
		}

		/**
		 * Get the current grid size
		 *
		 * @returns Grid size in pixels
		 */
		getGridSize(): number {
			// This will be overridden by the tool implementation
			// Tools using this mixin should call toolContext.state.getToolOption()
			return 8;
		}
	};
}
