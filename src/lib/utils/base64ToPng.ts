/**
 * Base64 to PNG Converter
 *
 * Converts inline.px Base64 encoded pixel data to PNG images.
 * Format: WIDTHxHEIGHT:BASE64DATA
 *
 * Can be used for:
 * - Export to PNG files
 * - Generate preview thumbnails
 * - Create data URLs for img src attributes
 * - URL-based rendering (future API endpoint)
 */

import { COLOR_PALETTE } from '$lib/constants/colorPalette';

export interface Base64ToPngConfig {
	scale: number; // Pixel scale (1 = 1px per pixel, 2 = 2px per pixel, etc.)
	showCheckerboard: boolean; // Show transparency checkerboard
	backgroundColor?: string; // Background color (if no checkerboard)
	pixelBorders?: boolean; // Draw borders around pixels
	pixelBorderColor?: string;
}

export interface ParsedBase64Data {
	width: number;
	height: number;
	pixels: number[][]; // 2D array of color indices
}

const DEFAULT_CONFIG: Base64ToPngConfig = {
	scale: 1,
	showCheckerboard: true,
	backgroundColor: '#2a2a2a',
	pixelBorders: false,
	pixelBorderColor: 'rgba(0, 0, 0, 0.2)'
};

/**
 * Parses Base64 string format: WIDTHxHEIGHT:BASE64DATA
 */
export function parseBase64String(encoded: string): ParsedBase64Data {
	const [dimensions, data] = encoded.split(':');
	if (!dimensions || !data) {
		throw new Error('Invalid Base64 format. Expected: WIDTHxHEIGHT:BASE64DATA');
	}

	const [widthStr, heightStr] = dimensions.split('x');
	const width = parseInt(widthStr, 10);
	const height = parseInt(heightStr, 10);

	if (isNaN(width) || isNaN(height) || width <= 0 || height <= 0) {
		throw new Error('Invalid dimensions in Base64 string');
	}

	// Decode Base64 to color indices
	const pixels: number[][] = [];
	const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

	let dataIndex = 0;
	for (let y = 0; y < height; y++) {
		pixels[y] = [];
		for (let x = 0; x < width; x++) {
			const char = data[dataIndex++];
			const colorIndex = char ? base64Chars.indexOf(char) : 0;
			pixels[y][x] = colorIndex;
		}
	}

	return { width, height, pixels };
}

/**
 * Renders Base64 pixel data to a canvas
 */
export function renderBase64ToCanvas(
	canvas: HTMLCanvasElement,
	encoded: string,
	config: Partial<Base64ToPngConfig> = {}
): void {
	const finalConfig: Base64ToPngConfig = { ...DEFAULT_CONFIG, ...config };
	const { width, height, pixels } = parseBase64String(encoded);

	const ctx = canvas.getContext('2d', {
		alpha: true,
		willReadFrequently: false
	});

	if (!ctx) {
		throw new Error('Could not get 2D context from canvas');
	}

	// Set canvas size
	const canvasWidth = width * finalConfig.scale;
	const canvasHeight = height * finalConfig.scale;
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;

	// Disable image smoothing for crisp pixels
	ctx.imageSmoothingEnabled = false;

	// Clear canvas
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	// Draw background
	if (finalConfig.showCheckerboard) {
		drawCheckerboard(ctx, canvasWidth, canvasHeight, finalConfig.scale);
	} else if (finalConfig.backgroundColor) {
		ctx.fillStyle = finalConfig.backgroundColor;
		ctx.fillRect(0, 0, canvasWidth, canvasHeight);
	}

	// Draw pixels
	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const colorIndex = pixels[y][x];

			// Skip transparent pixels (index 0)
			if (colorIndex === 0) continue;

			const color = COLOR_PALETTE[colorIndex];
			if (!color) continue;

			// Draw pixel
			ctx.fillStyle = color.color;
			ctx.fillRect(
				x * finalConfig.scale,
				y * finalConfig.scale,
				finalConfig.scale,
				finalConfig.scale
			);
		}
	}

	// Draw pixel borders if enabled
	if (finalConfig.pixelBorders && finalConfig.pixelBorderColor) {
		ctx.strokeStyle = finalConfig.pixelBorderColor;
		ctx.lineWidth = 1;

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const colorIndex = pixels[y][x];
				if (colorIndex === 0) continue;

				ctx.strokeRect(
					x * finalConfig.scale + 0.5,
					y * finalConfig.scale + 0.5,
					finalConfig.scale - 1,
					finalConfig.scale - 1
				);
			}
		}
	}
}

/**
 * Draws checkerboard pattern for transparency
 */
function drawCheckerboard(
	ctx: CanvasRenderingContext2D,
	width: number,
	height: number,
	scale: number
): void {
	const checkSize = Math.max(4, scale / 2);

	for (let y = 0; y < height; y += checkSize) {
		for (let x = 0; x < width; x += checkSize) {
			const isEven = ((x / checkSize) + (y / checkSize)) % 2 === 0;
			ctx.fillStyle = isEven ? '#2a2a2a' : '#1a1a1a';
			ctx.fillRect(x, y, checkSize, checkSize);
		}
	}
}

/**
 * Converts Base64 string to PNG data URL
 * Perfect for: <img src={dataURL} />
 */
export function base64ToDataURL(
	encoded: string,
	config: Partial<Base64ToPngConfig> = {}
): string {
	const canvas = document.createElement('canvas');
	renderBase64ToCanvas(canvas, encoded, config);
	return canvas.toDataURL('image/png');
}

/**
 * Converts Base64 string to PNG Blob
 * Perfect for: File downloads, API uploads
 */
export async function base64ToBlob(
	encoded: string,
	config: Partial<Base64ToPngConfig> = {}
): Promise<Blob | null> {
	const canvas = document.createElement('canvas');
	renderBase64ToCanvas(canvas, encoded, config);

	return new Promise((resolve) => {
		canvas.toBlob((blob) => {
			resolve(blob);
		}, 'image/png');
	});
}

/**
 * Downloads Base64 string as PNG file
 */
export async function downloadBase64AsPng(
	encoded: string,
	filename: string = 'pixel-art.png',
	config: Partial<Base64ToPngConfig> = {}
): Promise<void> {
	const blob = await base64ToBlob(encoded, config);
	if (!blob) {
		throw new Error('Failed to create PNG blob');
	}

	// Create download link
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);

	// Cleanup
	URL.revokeObjectURL(url);
}

/**
 * Encodes pixels array to Base64 string format
 */
export function encodePixelsToBase64(
	width: number,
	height: number,
	pixels: number[][]
): string {
	const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	let encoded = '';

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			const colorIndex = pixels[y]?.[x] ?? 0;
			encoded += base64Chars[colorIndex] ?? 'A';
		}
	}

	return `${width}x${height}:${encoded}`;
}

/**
 * Helper: Get PNG dimensions without full render
 */
export function getBase64Dimensions(encoded: string): { width: number; height: number } {
	const [dimensions] = encoded.split(':');
	const [widthStr, heightStr] = dimensions.split('x');
	return {
		width: parseInt(widthStr, 10),
		height: parseInt(heightStr, 10)
	};
}

/**
 * Helper: Validate Base64 string format
 */
export function isValidBase64String(encoded: string): boolean {
	try {
		const { width, height } = parseBase64String(encoded);
		return width > 0 && height > 0;
	} catch {
		return false;
	}
}
