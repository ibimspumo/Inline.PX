/**
 * PatternableMixin - Adds pattern fill support to tools
 *
 * Provides pattern fill functionality for fill-based tools
 */

import type { Constructor, Mixin } from './types';
import { commonToolOptions, type PatternType } from '../base/ToolOptions';

/**
 * Interface for patternable tools
 */
export interface Patternable extends Mixin {
	/**
	 * Get the current pattern type
	 */
	getPattern(): PatternType;

	/**
	 * Check if a pixel should be filled based on pattern
	 */
	shouldFillPixel(x: number, y: number): boolean;

	/**
	 * Apply pattern to a region
	 */
	applyPattern(pixels: { x: number; y: number }[], colorIndex: number): void;
}

/**
 * Mixin that adds pattern fill functionality to a tool
 *
 * @example
 * ```typescript
 * class MyTool extends PatternableMixin(BaseTool) {
 *   // Now has getPattern(), shouldFillPixel(), and applyPattern() methods
 * }
 * ```
 */
export function PatternableMixin<T extends Constructor>(Base: T) {
	return class extends Base implements Patternable {
		readonly mixinId = 'patternable';
		readonly mixinOptions = [commonToolOptions.pattern];
		readonly mixinTags = ['pattern', 'fill'];

		/**
		 * Get the current pattern type
		 *
		 * @returns Current pattern type
		 */
		getPattern(): PatternType {
			// This will be overridden by the tool implementation
			// Tools using this mixin should call toolContext.state.getToolOption()
			return 'solid';
		}

		/**
		 * Check if a pixel should be filled based on pattern
		 *
		 * @param x - X coordinate
		 * @param y - Y coordinate
		 * @returns True if pixel should be filled
		 */
		shouldFillPixel(x: number, y: number): boolean {
			const pattern = this.getPattern();

			switch (pattern) {
				case 'solid':
					return true;
				case 'checkerboard':
					return (x + y) % 2 === 0;
				case 'horizontal':
					return y % 2 === 0;
				case 'vertical':
					return x % 2 === 0;
				case 'diagonal':
					return (x - y) % 2 === 0;
				default:
					return true;
			}
		}

		/**
		 * Apply pattern to a region
		 *
		 * @param pixels - Array of pixel coordinates to fill
		 * @param colorIndex - Color index to use
		 */
		applyPattern(pixels: { x: number; y: number }[], colorIndex: number): void {
			// This is a helper method - tools should override or extend this
			// Default implementation filters pixels based on pattern
			const filledPixels = pixels.filter((p) => this.shouldFillPixel(p.x, p.y));
			// Tools should implement their own setPixel logic for filledPixels
		}
	};
}
