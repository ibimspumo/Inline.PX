/**
 * Tool Option Schema
 *
 * Defines configurable options for tools (e.g., brush size, opacity).
 * Options are dynamically rendered in the UI based on their type.
 */

import type { ToolContext } from './ToolContext';

export type OptionType = 'number' | 'boolean' | 'string' | 'color' | 'select' | 'slider';

/**
 * Pattern fill types
 */
export type PatternType = 'solid' | 'checkerboard' | 'horizontal' | 'vertical' | 'diagonal';

/**
 * Tool option interface
 *
 * @template T - The value type for this option
 */
export interface ToolOption<T = any> {
	/** Unique option identifier */
	id: string;

	/** Display label */
	label: string;

	/** Option description/tooltip */
	description?: string;

	/** Option type determines UI control */
	type: OptionType;

	/** Default value */
	defaultValue: T;

	/** For number/slider: minimum value */
	min?: number;

	/** For number/slider: maximum value */
	max?: number;

	/** For number/slider: step increment */
	step?: number;

	/** For select: available options */
	options?: Array<{ value: T; label: string }>;

	/** Validation function */
	validation?: (value: T) => boolean | string;

	/** Whether option is visible in UI */
	visible?: boolean | ((context: ToolContext) => boolean);
}

/**
 * Common tool options that can be reused across tools
 */
export const commonToolOptions = {
	/**
	 * Brush size option (1-64 pixels)
	 */
	brushSize: {
		id: 'brushSize',
		label: 'Brush Size',
		description: 'Size of the brush in pixels',
		type: 'slider' as const,
		defaultValue: 1,
		min: 1,
		max: 64,
		step: 1
	},

	/**
	 * Opacity option (0-100%)
	 */
	opacity: {
		id: 'opacity',
		label: 'Opacity',
		description: 'Brush opacity (0-100%)',
		type: 'slider' as const,
		defaultValue: 100,
		min: 0,
		max: 100,
		step: 1
	},

	/**
	 * Anti-aliasing option
	 */
	antiAlias: {
		id: 'antiAlias',
		label: 'Anti-Aliasing',
		description: 'Smooth edges',
		type: 'boolean' as const,
		defaultValue: false
	},

	/**
	 * Tolerance option for flood fill
	 */
	tolerance: {
		id: 'tolerance',
		label: 'Tolerance',
		description: 'Color matching tolerance (0-100)',
		type: 'slider' as const,
		defaultValue: 0,
		min: 0,
		max: 100,
		step: 1
	},

	/**
	 * Contiguous fill option
	 */
	contiguous: {
		id: 'contiguous',
		label: 'Contiguous',
		description: 'Only fill connected pixels',
		type: 'boolean' as const,
		defaultValue: true
	},

	/**
	 * Snap to grid option
	 */
	snapToGrid: {
		id: 'snapToGrid',
		label: 'Snap to Grid',
		description: 'Snap cursor to grid intersections',
		type: 'boolean' as const,
		defaultValue: false
	},

	/**
	 * Grid size option
	 */
	gridSize: {
		id: 'gridSize',
		label: 'Grid Size',
		description: 'Size of the snap grid in pixels',
		type: 'slider' as const,
		defaultValue: 8,
		min: 1,
		max: 32,
		step: 1
	},

	/**
	 * Perfect pixels option (squares only)
	 */
	perfectPixels: {
		id: 'perfectPixels',
		label: 'Perfect Pixels',
		description: 'Draw only perfect square shapes',
		type: 'boolean' as const,
		defaultValue: false
	},

	/**
	 * Blend mode option
	 */
	blendMode: {
		id: 'blendMode',
		label: 'Blend Mode',
		description: 'How to blend with existing pixels',
		type: 'select' as const,
		defaultValue: 'normal',
		options: [
			{ value: 'normal', label: 'Normal' },
			{ value: 'add', label: 'Add' },
			{ value: 'multiply', label: 'Multiply' },
			{ value: 'screen', label: 'Screen' },
			{ value: 'overlay', label: 'Overlay' }
		]
	},

	/**
	 * Pattern fill mode
	 */
	pattern: {
		id: 'pattern',
		label: 'Pattern',
		description: 'Fill pattern type',
		type: 'select' as const,
		defaultValue: 'solid',
		options: [
			{ value: 'solid', label: 'Solid' },
			{ value: 'checkerboard', label: 'Checkerboard' },
			{ value: 'horizontal', label: 'Horizontal Lines' },
			{ value: 'vertical', label: 'Vertical Lines' },
			{ value: 'diagonal', label: 'Diagonal Lines' }
		]
	},

	/**
	 * Dithering amount
	 */
	dithering: {
		id: 'dithering',
		label: 'Dithering',
		description: 'Amount of dithering to apply (0-100%)',
		type: 'slider' as const,
		defaultValue: 0,
		min: 0,
		max: 100,
		step: 5
	},

	/**
	 * Threshold value
	 */
	threshold: {
		id: 'threshold',
		label: 'Threshold',
		description: 'Threshold value for binary operations',
		type: 'slider' as const,
		defaultValue: 128,
		min: 0,
		max: 255,
		step: 1
	},

	/**
	 * Smoothing/interpolation
	 */
	smoothing: {
		id: 'smoothing',
		label: 'Smoothing',
		description: 'Enable smooth interpolation',
		type: 'boolean' as const,
		defaultValue: false
	},

	/**
	 * Pressure sensitivity (for future tablet support)
	 */
	pressureSensitivity: {
		id: 'pressureSensitivity',
		label: 'Pressure Sensitivity',
		description: 'Adjust size/opacity based on pressure',
		type: 'boolean' as const,
		defaultValue: false
	}
};
