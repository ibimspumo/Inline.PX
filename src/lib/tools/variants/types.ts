/**
 * Tool Variants - Type definitions
 *
 * Provides types for creating tool variants with preset configurations
 */

import type { BaseTool } from '../base/BaseTool';
import type { ToolConfigExtended } from '../base/ToolMetadata';
import type { IconName } from '../base/ToolConfig';

/**
 * Tool variant preset - defines option overrides for a variant
 */
export interface VariantPreset {
	/**
	 * Unique identifier for this variant
	 */
	variantId: string;

	/**
	 * Display name for the variant
	 */
	name: string;

	/**
	 * Description of the variant
	 */
	description: string;

	/**
	 * Icon name for the variant (optional, defaults to base tool icon)
	 */
	iconName?: IconName;

	/**
	 * Option values to override
	 * Key is option ID, value is the preset value
	 */
	optionPresets: Record<string, any>;

	/**
	 * Tags specific to this variant
	 */
	tags?: string[];
}

/**
 * Tool variant configuration
 */
export interface ToolVariant {
	/**
	 * Base tool ID this variant is based on
	 */
	baseToolId: string;

	/**
	 * Variant preset configuration
	 */
	preset: VariantPreset;

	/**
	 * Full tool configuration (merged from base + variant)
	 */
	config: ToolConfigExtended;

	/**
	 * Reference to the base tool instance
	 */
	baseTool: BaseTool;
}

/**
 * Variant group - tools with their variants
 */
export interface VariantGroup {
	/**
	 * Base tool ID
	 */
	toolId: string;

	/**
	 * Display name for the group
	 */
	name: string;

	/**
	 * Base tool instance
	 */
	baseTool: BaseTool;

	/**
	 * Array of variants for this tool
	 */
	variants: ToolVariant[];
}
