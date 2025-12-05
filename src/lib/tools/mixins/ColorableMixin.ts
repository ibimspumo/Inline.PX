/**
 * ColorableMixin - Adds primary/secondary color support to tools
 *
 * Provides color selection functionality for drawing tools
 */

import type { Constructor, Mixin } from './types';

/**
 * Interface for colorable tools
 */
export interface Colorable extends Mixin {
	/**
	 * Get the color index based on mouse button (0 = primary, 2 = secondary)
	 */
	getColorForButton(button: number): number;

	/**
	 * Check if tool supports secondary color (right-click)
	 */
	supportsSecondaryColor(): boolean;
}

/**
 * Mixin that adds color selection functionality to a tool
 *
 * @example
 * ```typescript
 * class MyTool extends ColorableMixin(BaseTool) {
 *   // Now has getColorForButton() and supportsSecondaryColor() methods
 * }
 * ```
 */
export function ColorableMixin<T extends Constructor>(Base: T) {
	return class extends Base implements Colorable {
		readonly mixinId = 'colorable';
		readonly mixinTags = ['color', 'drawing'];

		/**
		 * Get the color index based on mouse button
		 *
		 * @param button - Mouse button (0 = left/primary, 2 = right/secondary)
		 * @returns Color index to use
		 */
		getColorForButton(button: number): number {
			// This will be overridden by the tool implementation
			// Tools using this mixin should access toolContext.primaryColorIndex/secondaryColorIndex
			return button === 2 ? 0 : 1; // Placeholder
		}

		/**
		 * Check if tool supports secondary color (right-click)
		 *
		 * @returns True if tool supports right-click for secondary color
		 */
		supportsSecondaryColor(): boolean {
			return true;
		}
	};
}
