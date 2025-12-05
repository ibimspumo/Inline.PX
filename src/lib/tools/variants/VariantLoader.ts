/**
 * VariantLoader - Automatically loads and registers tool variants
 *
 * Registers predefined tool variants with the variant registry
 */

import { toolRegistry } from '../registry/ToolRegistry';
import { variantRegistry } from './VariantRegistry';
import {
	pencilVariants,
	bucketVariants,
	eraserVariants,
	rectangleVariants,
	circleVariants,
	lineVariants
} from './presets';

/**
 * Loading state flags
 */
let isLoaded = false;
let isLoading = false;
let loadingPromise: Promise<void> | null = null;

/**
 * Load all predefined tool variants
 *
 * This function can be called multiple times safely - it will only load once
 *
 * @returns Promise that resolves when all variants are loaded
 */
export async function loadAllVariants(): Promise<void> {
	// If already loaded, return immediately
	if (isLoaded) {
		return Promise.resolve();
	}

	// If currently loading, return the existing promise
	if (isLoading && loadingPromise) {
		return loadingPromise;
	}

	// Start loading
	isLoading = true;
	loadingPromise = (async () => {
		try {
			// Register Pencil variants
			const pencilTool = toolRegistry.getTool('pencil');
			if (pencilTool) {
				variantRegistry.registerVariants(pencilTool, pencilVariants);
			}

			// Register Bucket variants
			const bucketTool = toolRegistry.getTool('bucket');
			if (bucketTool) {
				variantRegistry.registerVariants(bucketTool, bucketVariants);
			}

			// Register Eraser variants
			const eraserTool = toolRegistry.getTool('eraser');
			if (eraserTool) {
				variantRegistry.registerVariants(eraserTool, eraserVariants);
			}

			// Register Rectangle variants
			const rectangleTool = toolRegistry.getTool('rectangle');
			if (rectangleTool) {
				variantRegistry.registerVariants(rectangleTool, rectangleVariants);
			}

			// Register Circle variants
			const circleTool = toolRegistry.getTool('circle');
			if (circleTool) {
				variantRegistry.registerVariants(circleTool, circleVariants);
			}

			// Register Line variants
			const lineTool = toolRegistry.getTool('line');
			if (lineTool) {
				variantRegistry.registerVariants(lineTool, lineVariants);
			}

			isLoaded = true;
			isLoading = false;
		} catch (error) {
			isLoading = false;
			loadingPromise = null;
			throw error;
		}
	})();

	return loadingPromise;
}

/**
 * Reset loading state (useful for testing)
 */
export function resetVariantLoader(): void {
	isLoaded = false;
	isLoading = false;
	loadingPromise = null;
	variantRegistry.clear();
}
