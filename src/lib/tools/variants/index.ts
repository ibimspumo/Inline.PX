/**
 * Tool Variants - Tool variant system
 *
 * Export all variant-related functionality
 */

export type { VariantPreset, ToolVariant, VariantGroup } from './types';
export { VariantRegistry, variantRegistry } from './VariantRegistry';
export { loadAllVariants, resetVariantLoader } from './VariantLoader';
export {
	pencilVariants,
	bucketVariants,
	eraserVariants,
	rectangleVariants,
	circleVariants,
	lineVariants
} from './presets';
