/**
 * VariantRegistry - Manages tool variants
 *
 * Central registry for tool variants with preset configurations
 */

import type { BaseTool } from '../base/BaseTool';
import type { ToolConfigExtended } from '../base/ToolMetadata';
import type { VariantPreset, ToolVariant, VariantGroup } from './types';

/**
 * Singleton registry for managing tool variants
 */
export class VariantRegistry {
	private static instance: VariantRegistry;
	private variants: Map<string, ToolVariant[]> = new Map();
	private variantGroups: Map<string, VariantGroup> = new Map();

	private constructor() {}

	/**
	 * Get the singleton instance
	 */
	public static getInstance(): VariantRegistry {
		if (!VariantRegistry.instance) {
			VariantRegistry.instance = new VariantRegistry();
		}
		return VariantRegistry.instance;
	}

	/**
	 * Register a variant for a tool
	 *
	 * @param baseTool - Base tool instance
	 * @param preset - Variant preset configuration
	 */
	public registerVariant(baseTool: BaseTool, preset: VariantPreset): void {
		const baseConfig = baseTool.config as ToolConfigExtended;
		const baseToolId = baseConfig.id;

		// Create variant configuration by merging base config with preset
		const variantConfig: ToolConfigExtended = {
			...baseConfig,
			id: `${baseToolId}-${preset.variantId}` as any, // Create unique variant ID
			name: preset.name,
			description: preset.description,
			iconName: preset.iconName || baseConfig.iconName,
			tags: [...(baseConfig.tags || []), ...(preset.tags || [])],
			// Note: We don't modify options here, just store the preset values
		};

		const variant: ToolVariant = {
			baseToolId,
			preset,
			config: variantConfig,
			baseTool
		};

		// Add to variants map
		const toolVariants = this.variants.get(baseToolId) || [];
		toolVariants.push(variant);
		this.variants.set(baseToolId, toolVariants);

		// Update variant group
		if (!this.variantGroups.has(baseToolId)) {
			this.variantGroups.set(baseToolId, {
				toolId: baseToolId,
				name: baseConfig.name,
				baseTool,
				variants: []
			});
		}
		const group = this.variantGroups.get(baseToolId)!;
		group.variants.push(variant);
	}

	/**
	 * Register multiple variants for a tool
	 *
	 * @param baseTool - Base tool instance
	 * @param presets - Array of variant presets
	 */
	public registerVariants(baseTool: BaseTool, presets: VariantPreset[]): void {
		presets.forEach((preset) => this.registerVariant(baseTool, preset));
	}

	/**
	 * Get all variants for a tool
	 *
	 * @param toolId - Base tool ID
	 * @returns Array of variants, or empty array if none
	 */
	public getVariants(toolId: string): ToolVariant[] {
		return this.variants.get(toolId) || [];
	}

	/**
	 * Get a specific variant
	 *
	 * @param toolId - Base tool ID
	 * @param variantId - Variant ID
	 * @returns Variant or undefined if not found
	 */
	public getVariant(toolId: string, variantId: string): ToolVariant | undefined {
		const variants = this.getVariants(toolId);
		return variants.find((v) => v.preset.variantId === variantId);
	}

	/**
	 * Get variant group for a tool
	 *
	 * @param toolId - Base tool ID
	 * @returns Variant group or undefined if not found
	 */
	public getVariantGroup(toolId: string): VariantGroup | undefined {
		return this.variantGroups.get(toolId);
	}

	/**
	 * Get all variant groups
	 *
	 * @returns Array of all variant groups
	 */
	public getAllVariantGroups(): VariantGroup[] {
		return Array.from(this.variantGroups.values());
	}

	/**
	 * Check if a tool has variants
	 *
	 * @param toolId - Base tool ID
	 * @returns True if tool has variants
	 */
	public hasVariants(toolId: string): boolean {
		const variants = this.variants.get(toolId);
		return variants !== undefined && variants.length > 0;
	}

	/**
	 * Clear all variants (useful for testing)
	 */
	public clear(): void {
		this.variants.clear();
		this.variantGroups.clear();
	}
}

/**
 * Get the singleton variant registry instance
 */
export const variantRegistry = VariantRegistry.getInstance();
