/**
 * Tool Configuration Interface
 *
 * Defines the metadata and configuration for each tool.
 * Used by the ToolRegistry and Toolbar for registration and display.
 */

/**
 * Tool category for grouping in toolbar
 */
export type ToolCategory = 'draw' | 'edit' | 'select' | 'view' | 'shape';

/**
 * Tool cursor type
 */
export type ToolCursor = 'crosshair' | 'pointer' | 'grab' | 'grabbing' | 'zoom-in' | 'zoom-out';

/**
 * Lucide icon name (without import)
 */
export type IconName =
	| 'Pencil'
	| 'Eraser'
	| 'PaintBucket'
	| 'Pipette'
	| 'Move'
	| 'Hand'
	| 'ZoomIn'
	| 'Square'
	| 'Circle'
	| 'Lasso'
	| 'Minus'
	| 'Star';

/**
 * Tool configuration
 */
export interface ToolConfig {
	/** Unique tool identifier (matches Tool type) */
	id: string;

	/** Display name */
	name: string;

	/** Tool description */
	description: string;

	/** Lucide icon name */
	iconName: IconName;

	/** Tool category for grouping */
	category: ToolCategory;

	/** Keyboard shortcut (e.g., 'B', 'E', 'G') */
	shortcut?: string;

	/** Cursor style when tool is active */
	cursor: ToolCursor;

	/** Whether tool supports click-and-drag */
	supportsDrag: boolean;

	/** Whether tool works on locked layers */
	worksOnLockedLayers: boolean;

	/** Tool display order within category (lower = first) */
	order: number;
}

/**
 * Tool metadata for display purposes
 */
export interface ToolMetadata {
	id: string;
	name: string;
	description: string;
	iconName: IconName;
	category: ToolCategory;
	shortcut?: string;
	order: number;
}
