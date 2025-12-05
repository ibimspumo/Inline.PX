/**
 * Color Palette System for inline.px
 *
 * 64 colors total (indexed 0-63 for Base64 encoding):
 * - Index 0: Transparent
 * - Index 1: Black
 * - Index 2: White
 * - Index 3-63: Color palette (61 colors)
 *
 * Each color maps to a Base64 character for compact storage.
 */

export interface PaletteColor {
	index: number;
	color: string;
	name: string;
}

// Base64 characters for encoding (A-Z, a-z, 0-9, +, /)
export const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

/**
 * The complete color palette with 64 colors
 */
export const COLOR_PALETTE: PaletteColor[] = [
	// Special colors (0-2)
	{ index: 0, color: 'transparent', name: 'Transparent' },
	{ index: 1, color: '#000000', name: 'Black' },
	{ index: 2, color: '#ffffff', name: 'White' },

	// Grayscale (3-8)
	{ index: 3, color: '#1a1a1a', name: 'Gray 1' },
	{ index: 4, color: '#333333', name: 'Gray 2' },
	{ index: 5, color: '#4d4d4d', name: 'Gray 3' },
	{ index: 6, color: '#808080', name: 'Gray 4' },
	{ index: 7, color: '#b3b3b3', name: 'Gray 5' },
	{ index: 8, color: '#e6e6e6', name: 'Gray 6' },

	// Reds (9-14)
	{ index: 9, color: '#330000', name: 'Dark Red 1' },
	{ index: 10, color: '#660000', name: 'Dark Red 2' },
	{ index: 11, color: '#990000', name: 'Dark Red 3' },
	{ index: 12, color: '#cc0000', name: 'Red' },
	{ index: 13, color: '#ff3333', name: 'Light Red' },
	{ index: 14, color: '#ff6666', name: 'Pink Red' },

	// Oranges (15-20)
	{ index: 15, color: '#663300', name: 'Dark Orange 1' },
	{ index: 16, color: '#994d00', name: 'Dark Orange 2' },
	{ index: 17, color: '#cc6600', name: 'Dark Orange 3' },
	{ index: 18, color: '#ff8800', name: 'Orange' },
	{ index: 19, color: '#ffaa33', name: 'Light Orange' },
	{ index: 20, color: '#ffcc66', name: 'Pale Orange' },

	// Yellows (21-26)
	{ index: 21, color: '#666600', name: 'Dark Yellow 1' },
	{ index: 22, color: '#999900', name: 'Dark Yellow 2' },
	{ index: 23, color: '#cccc00', name: 'Dark Yellow 3' },
	{ index: 24, color: '#ffff00', name: 'Yellow' },
	{ index: 25, color: '#ffff66', name: 'Light Yellow' },
	{ index: 26, color: '#ffffcc', name: 'Pale Yellow' },

	// Greens (27-32)
	{ index: 27, color: '#003300', name: 'Dark Green 1' },
	{ index: 28, color: '#006600', name: 'Dark Green 2' },
	{ index: 29, color: '#009900', name: 'Dark Green 3' },
	{ index: 30, color: '#00cc00', name: 'Green' },
	{ index: 31, color: '#33ff33', name: 'Light Green' },
	{ index: 32, color: '#99ff99', name: 'Pale Green' },

	// Cyans (33-38)
	{ index: 33, color: '#003333', name: 'Dark Cyan 1' },
	{ index: 34, color: '#006666', name: 'Dark Cyan 2' },
	{ index: 35, color: '#009999', name: 'Dark Cyan 3' },
	{ index: 36, color: '#00cccc', name: 'Cyan' },
	{ index: 37, color: '#33ffff', name: 'Light Cyan' },
	{ index: 38, color: '#99ffff', name: 'Pale Cyan' },

	// Blues (39-44)
	{ index: 39, color: '#000033', name: 'Dark Blue 1' },
	{ index: 40, color: '#000066', name: 'Dark Blue 2' },
	{ index: 41, color: '#000099', name: 'Dark Blue 3' },
	{ index: 42, color: '#0000cc', name: 'Blue' },
	{ index: 43, color: '#3333ff', name: 'Light Blue' },
	{ index: 44, color: '#6666ff', name: 'Pale Blue' },

	// Purples (45-50)
	{ index: 45, color: '#330033', name: 'Dark Purple 1' },
	{ index: 46, color: '#660066', name: 'Dark Purple 2' },
	{ index: 47, color: '#990099', name: 'Dark Purple 3' },
	{ index: 48, color: '#cc00cc', name: 'Purple' },
	{ index: 49, color: '#ff33ff', name: 'Light Purple' },
	{ index: 50, color: '#ff99ff', name: 'Pale Purple' },

	// Magentas (51-56)
	{ index: 51, color: '#660033', name: 'Dark Magenta 1' },
	{ index: 52, color: '#990066', name: 'Dark Magenta 2' },
	{ index: 53, color: '#cc0066', name: 'Dark Magenta 3' },
	{ index: 54, color: '#ff0088', name: 'Magenta' },
	{ index: 55, color: '#ff33aa', name: 'Light Magenta' },
	{ index: 56, color: '#ff66cc', name: 'Pale Magenta' },

	// Additional colors (57-63)
	{ index: 57, color: '#8b4513', name: 'Brown' },
	{ index: 58, color: '#daa520', name: 'Gold' },
	{ index: 59, color: '#4b0082', name: 'Indigo' },
	{ index: 60, color: '#2e8b57', name: 'Sea Green' },
	{ index: 61, color: '#ff1493', name: 'Deep Pink' },
	{ index: 62, color: '#00ced1', name: 'Dark Turquoise' },
	{ index: 63, color: '#ff6347', name: 'Tomato' }
];

/**
 * Get color by index
 */
export function getColorByIndex(index: number): PaletteColor | undefined {
	return COLOR_PALETTE.find((c) => c.index === index);
}

/**
 * Get Base64 character for color index
 */
export function indexToBase64(index: number): string {
	if (index < 0 || index >= 64) {
		throw new Error(`Index ${index} out of range (0-63)`);
	}
	return BASE64_CHARS[index];
}

/**
 * Get color index from Base64 character
 */
export function base64ToIndex(char: string): number {
	const index = BASE64_CHARS.indexOf(char);
	if (index === -1) {
		throw new Error(`Invalid Base64 character: ${char}`);
	}
	return index;
}

/**
 * Encode canvas data to Base64 string
 * Format: WIDTHxHEIGHT:BASE64DATA
 * Example: 8x8:AAAABBBB...
 */
export function encodeCanvas(
	width: number,
	height: number,
	pixels: number[]
): string {
	const encoded = pixels.map((index) => indexToBase64(index)).join('');
	return `${width}x${height}:${encoded}`;
}

/**
 * Decode Base64 string to canvas data
 */
export function decodeCanvas(encoded: string): {
	width: number;
	height: number;
	pixels: number[];
} {
	const [dimensions, data] = encoded.split(':');
	const [width, height] = dimensions.split('x').map(Number);

	if (!width || !height || !data) {
		throw new Error('Invalid encoded canvas format');
	}

	const pixels = data.split('').map((char) => base64ToIndex(char));

	if (pixels.length !== width * height) {
		throw new Error(
			`Pixel count mismatch: expected ${width * height}, got ${pixels.length}`
		);
	}

	return { width, height, pixels };
}
