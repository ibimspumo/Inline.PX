/**
 * Type definitions for tool mixins
 *
 * Provides TypeScript types for creating and composing tool mixins
 */

import type { ToolOption } from '../base/ToolOptions';

/**
 * Constructor type for classes
 */
export type Constructor<T = {}> = new (...args: any[]) => T;

/**
 * Base mixin interface - all mixins should implement this
 */
export interface Mixin {
	/**
	 * Unique identifier for the mixin
	 */
	readonly mixinId: string;

	/**
	 * Options provided by this mixin
	 */
	readonly mixinOptions?: ToolOption[];

	/**
	 * Tags provided by this mixin
	 */
	readonly mixinTags?: string[];
}

/**
 * Mixin function type - takes a base class and returns an extended class
 */
export type MixinFunction<T extends Constructor> = (Base: T) => T;

/**
 * Extract the instance type from a constructor
 */
export type InstanceType<T> = T extends Constructor<infer U> ? U : never;

/**
 * Compose multiple mixins into a single class
 *
 * @example
 * ```typescript
 * class MyTool extends compose(BaseTool, BrushableMixin, ColorableMixin) {
 *   // Automatically gets brush and color functionality
 * }
 * ```
 */
export function compose<T extends Constructor>(Base: T, ...mixins: MixinFunction<any>[]): T {
	return mixins.reduce((acc, mixin) => mixin(acc), Base) as T;
}
