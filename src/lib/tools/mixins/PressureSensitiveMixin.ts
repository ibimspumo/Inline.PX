/**
 * PressureSensitiveMixin - Adds pressure sensitivity support to tools
 *
 * Provides pressure-based modifications for stylus/pen input
 */

import type { Constructor, Mixin } from './types';

/**
 * Interface for pressure-sensitive tools
 */
export interface PressureSensitive extends Mixin {
	/**
	 * Get the current pressure value (0.0 - 1.0)
	 */
	getPressure(): number;

	/**
	 * Apply pressure to a value (e.g., brush size, opacity)
	 */
	applyPressure(baseValue: number, pressure: number): number;

	/**
	 * Check if pressure sensitivity is supported
	 */
	supportsPressure(): boolean;
}

/**
 * Mixin that adds pressure sensitivity functionality to a tool
 *
 * @example
 * ```typescript
 * class MyTool extends PressureSensitiveMixin(BaseTool) {
 *   // Now has getPressure(), applyPressure(), and supportsPressure() methods
 * }
 * ```
 */
export function PressureSensitiveMixin<T extends Constructor>(Base: T) {
	return class extends Base implements PressureSensitive {
		readonly mixinId = 'pressureSensitive';
		readonly mixinTags = ['pressure', 'stylus', 'advanced'];

		/**
		 * Get the current pressure value (0.0 - 1.0)
		 *
		 * @returns Pressure value, defaults to 1.0 if not available
		 */
		getPressure(): number {
			// This will be overridden by the tool implementation
			// Tools using this mixin should access pointer event pressure
			return 1.0;
		}

		/**
		 * Apply pressure to a value (e.g., brush size, opacity)
		 *
		 * @param baseValue - Base value to modify
		 * @param pressure - Pressure value (0.0 - 1.0)
		 * @returns Modified value based on pressure
		 */
		applyPressure(baseValue: number, pressure: number): number {
			// Linear pressure curve by default
			return Math.max(1, Math.round(baseValue * pressure));
		}

		/**
		 * Check if pressure sensitivity is supported
		 *
		 * @returns True if device supports pressure input
		 */
		supportsPressure(): boolean {
			// Check if browser supports pointer events with pressure
			return 'PointerEvent' in window;
		}
	};
}
