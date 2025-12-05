/**
 * PNG Export API
 *
 * High-level API for exporting canvas/layers to PNG
 * Integrates with canvasStore and provides convenient export functions
 */

import type { Layer } from '$lib/types/canvas.types';
import {
	encodePixelsToBase64,
	base64ToBlob,
	base64ToDataURL,
	downloadBase64AsPng,
	type Base64ToPngConfig
} from './base64ToPng';

/**
 * Export a single layer to PNG
 */
export async function exportLayerToPng(
	layer: Layer,
	width: number,
	height: number,
	filename: string,
	config: Partial<Base64ToPngConfig> = {}
): Promise<void> {
	const base64 = encodePixelsToBase64(width, height, layer.pixels);
	await downloadBase64AsPng(base64, filename, config);
}

/**
 * Export multiple layers composited to PNG
 */
export async function exportCompositeLayersToPng(
	layers: Layer[],
	width: number,
	height: number,
	filename: string,
	config: Partial<Base64ToPngConfig> = {}
): Promise<void> {
	// Composite layers
	const composited = compositeLayersToPixels(layers, width, height);
	const base64 = encodePixelsToBase64(width, height, composited);
	await downloadBase64AsPng(base64, filename, config);
}

/**
 * Get layer as data URL (for preview/img src)
 */
export function getLayerAsDataURL(
	layer: Layer,
	width: number,
	height: number,
	config: Partial<Base64ToPngConfig> = {}
): string {
	const base64 = encodePixelsToBase64(width, height, layer.pixels);
	return base64ToDataURL(base64, config);
}

/**
 * Get composited layers as data URL
 */
export function getCompositeLayersAsDataURL(
	layers: Layer[],
	width: number,
	height: number,
	config: Partial<Base64ToPngConfig> = {}
): string {
	const composited = compositeLayersToPixels(layers, width, height);
	const base64 = encodePixelsToBase64(width, height, composited);
	return base64ToDataURL(base64, config);
}

/**
 * Get layer as Blob (for upload/API)
 */
export async function getLayerAsBlob(
	layer: Layer,
	width: number,
	height: number,
	config: Partial<Base64ToPngConfig> = {}
): Promise<Blob | null> {
	const base64 = encodePixelsToBase64(width, height, layer.pixels);
	return base64ToBlob(base64, config);
}

/**
 * Get composited layers as Blob
 */
export async function getCompositeLayersAsBlob(
	layers: Layer[],
	width: number,
	height: number,
	config: Partial<Base64ToPngConfig> = {}
): Promise<Blob | null> {
	const composited = compositeLayersToPixels(layers, width, height);
	const base64 = encodePixelsToBase64(width, height, composited);
	return base64ToBlob(base64, config);
}

/**
 * Helper: Composite multiple layers into single pixel array
 */
function compositeLayersToPixels(
	layers: Layer[],
	width: number,
	height: number
): number[][] {
	const pixels: number[][] = [];

	// Initialize with transparent
	for (let y = 0; y < height; y++) {
		pixels[y] = [];
		for (let x = 0; x < width; x++) {
			pixels[y][x] = 0;
		}
	}

	// Composite layers from bottom to top
	for (const layer of layers) {
		if (!layer.visible) continue;

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const colorIndex = layer.pixels[y][x];
				// Only draw non-transparent pixels
				if (colorIndex !== 0) {
					pixels[y][x] = colorIndex;
				}
			}
		}
	}

	return pixels;
}

/**
 * Export presets for common use cases
 */
export const ExportPresets = {
	/** 1:1 pixel scale, no background */
	ORIGINAL: {
		scale: 1,
		showCheckerboard: false,
		backgroundColor: undefined
	} as Base64ToPngConfig,

	/** 1:1 pixel scale with transparency checkerboard */
	ORIGINAL_WITH_CHECKER: {
		scale: 1,
		showCheckerboard: true
	} as Base64ToPngConfig,

	/** 2x upscale for better visibility */
	UPSCALE_2X: {
		scale: 2,
		showCheckerboard: false
	} as Base64ToPngConfig,

	/** 4x upscale for social media */
	UPSCALE_4X: {
		scale: 4,
		showCheckerboard: false
	} as Base64ToPngConfig,

	/** 8x upscale with pixel borders */
	UPSCALE_8X_BORDERED: {
		scale: 8,
		showCheckerboard: false,
		pixelBorders: true,
		pixelBorderColor: 'rgba(0, 0, 0, 0.3)'
	} as Base64ToPngConfig,

	/** Small thumbnail */
	THUMBNAIL: {
		scale: 1,
		showCheckerboard: true
	} as Base64ToPngConfig,

	/** White background (for printing) */
	WHITE_BACKGROUND: {
		scale: 4,
		showCheckerboard: false,
		backgroundColor: '#ffffff'
	} as Base64ToPngConfig,

	/** Black background */
	BLACK_BACKGROUND: {
		scale: 4,
		showCheckerboard: false,
		backgroundColor: '#000000'
	} as Base64ToPngConfig
};
