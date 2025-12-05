/**
 * Layer Thumbnail Generator
 * Renders a layer's pixels to a small thumbnail canvas for preview
 */

import { COLOR_PALETTE } from '$lib/constants/colorPalette';
import type { Layer } from '$lib/types/canvas.types';

export interface ThumbnailConfig {
	size: number; // Thumbnail size in pixels
	showCheckerboard: boolean;
	backgroundColor?: string;
}

/**
 * Renders a layer to a canvas element as a thumbnail
 */
export function renderLayerThumbnail(
	canvas: HTMLCanvasElement,
	layer: Layer,
	width: number,
	height: number,
	config: Partial<ThumbnailConfig> = {}
): void {
	const thumbnailConfig: ThumbnailConfig = {
		size: 32,
		showCheckerboard: true,
		backgroundColor: '#2a2a2a',
		...config
	};

	const ctx = canvas.getContext('2d', {
		alpha: true,
		willReadFrequently: false
	});

	if (!ctx) return;

	// Set canvas size
	canvas.width = thumbnailConfig.size;
	canvas.height = thumbnailConfig.size;

	// Disable image smoothing for crisp pixels
	ctx.imageSmoothingEnabled = false;

	// Calculate pixel size for thumbnail
	const pixelSize = thumbnailConfig.size / Math.max(width, height);

	// Clear canvas
	ctx.clearRect(0, 0, thumbnailConfig.size, thumbnailConfig.size);

	// Draw checkerboard background
	if (thumbnailConfig.showCheckerboard) {
		drawThumbnailCheckerboard(ctx, thumbnailConfig.size);
	} else if (thumbnailConfig.backgroundColor) {
		ctx.fillStyle = thumbnailConfig.backgroundColor;
		ctx.fillRect(0, 0, thumbnailConfig.size, thumbnailConfig.size);
	}

	// Render layer pixels
	ctx.globalAlpha = layer.opacity;

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const colorIndex = layer.pixels[y][x];

			// Skip transparent pixels
			if (colorIndex === 0) continue;

			const color = COLOR_PALETTE[colorIndex];
			if (!color) continue;

			// Draw pixel
			ctx.fillStyle = color.color;
			ctx.fillRect(
				Math.floor(x * pixelSize),
				Math.floor(y * pixelSize),
				Math.ceil(pixelSize),
				Math.ceil(pixelSize)
			);
		}
	}

	ctx.globalAlpha = 1.0;
}

/**
 * Draws a checkerboard pattern for transparency visualization
 */
function drawThumbnailCheckerboard(ctx: CanvasRenderingContext2D, size: number): void {
	const checkSize = 4; // Small checks for thumbnail

	for (let y = 0; y < size; y += checkSize) {
		for (let x = 0; x < size; x += checkSize) {
			const isEven = ((x / checkSize) + (y / checkSize)) % 2 === 0;
			ctx.fillStyle = isEven ? '#2a2a2a' : '#1a1a1a';
			ctx.fillRect(x, y, checkSize, checkSize);
		}
	}
}

/**
 * Creates a data URL from layer pixels for use in img src
 */
export function createLayerThumbnailDataURL(
	layer: Layer,
	width: number,
	height: number,
	config: Partial<ThumbnailConfig> = {}
): string {
	const canvas = document.createElement('canvas');
	renderLayerThumbnail(canvas, layer, width, height, config);
	return canvas.toDataURL('image/png');
}

/**
 * Renders layer to a blob (for export/download)
 */
export async function createLayerThumbnailBlob(
	layer: Layer,
	width: number,
	height: number,
	config: Partial<ThumbnailConfig> = {}
): Promise<Blob | null> {
	const canvas = document.createElement('canvas');
	renderLayerThumbnail(canvas, layer, width, height, config);

	return new Promise((resolve) => {
		canvas.toBlob((blob) => {
			resolve(blob);
		}, 'image/png');
	});
}
