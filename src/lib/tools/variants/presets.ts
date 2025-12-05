/**
 * Tool Variant Presets
 *
 * Predefined variants for common tools
 */

import type { VariantPreset } from './types';

/**
 * Pencil tool variants
 */
export const pencilVariants: VariantPreset[] = [
	{
		variantId: 'soft-brush',
		name: 'Soft Brush',
		description: 'Larger brush with medium opacity',
		optionPresets: {
			brushSize: 4,
			opacity: 50
		},
		tags: ['soft', 'brush']
	},
	{
		variantId: 'hard-brush',
		name: 'Hard Brush',
		description: 'Small precise brush with full opacity',
		optionPresets: {
			brushSize: 1,
			opacity: 100
		},
		tags: ['hard', 'precise']
	},
	{
		variantId: 'pixel-brush',
		name: 'Pixel Brush',
		description: 'Single pixel brush for detailed work',
		optionPresets: {
			brushSize: 1,
			snapToGrid: false
		},
		tags: ['pixel', 'detail']
	},
	{
		variantId: 'grid-brush',
		name: 'Grid Brush',
		description: 'Medium brush that snaps to 8x8 grid',
		optionPresets: {
			brushSize: 8,
			snapToGrid: true,
			gridSize: 8
		},
		tags: ['grid', 'aligned']
	}
];

/**
 * Bucket fill tool variants
 */
export const bucketVariants: VariantPreset[] = [
	{
		variantId: 'solid-fill',
		name: 'Solid Fill',
		description: 'Fill with solid color',
		optionPresets: {
			pattern: 'solid',
			tolerance: 0,
			contiguous: true
		},
		tags: ['solid', 'fill']
	},
	{
		variantId: 'pattern-checkerboard',
		name: 'Checkerboard Fill',
		description: 'Fill with checkerboard pattern',
		optionPresets: {
			pattern: 'checkerboard',
			tolerance: 0,
			contiguous: true
		},
		tags: ['pattern', 'checkerboard']
	},
	{
		variantId: 'pattern-horizontal',
		name: 'Horizontal Lines',
		description: 'Fill with horizontal line pattern',
		optionPresets: {
			pattern: 'horizontal',
			tolerance: 0,
			contiguous: true
		},
		tags: ['pattern', 'lines']
	},
	{
		variantId: 'pattern-vertical',
		name: 'Vertical Lines',
		description: 'Fill with vertical line pattern',
		optionPresets: {
			pattern: 'vertical',
			tolerance: 0,
			contiguous: true
		},
		tags: ['pattern', 'lines']
	},
	{
		variantId: 'tolerant-fill',
		name: 'Tolerant Fill',
		description: 'Fill similar colors with high tolerance',
		optionPresets: {
			pattern: 'solid',
			tolerance: 30,
			contiguous: true
		},
		tags: ['tolerant', 'similar']
	}
];

/**
 * Eraser tool variants
 */
export const eraserVariants: VariantPreset[] = [
	{
		variantId: 'fine-eraser',
		name: 'Fine Eraser',
		description: 'Single pixel eraser for precision',
		optionPresets: {
			brushSize: 1
		},
		tags: ['fine', 'precise']
	},
	{
		variantId: 'medium-eraser',
		name: 'Medium Eraser',
		description: 'Medium-sized eraser for general use',
		optionPresets: {
			brushSize: 8
		},
		tags: ['medium']
	},
	{
		variantId: 'large-eraser',
		name: 'Large Eraser',
		description: 'Large eraser for quick cleanup',
		optionPresets: {
			brushSize: 16
		},
		tags: ['large', 'cleanup']
	}
];

/**
 * Rectangle tool variants
 */
export const rectangleVariants: VariantPreset[] = [
	{
		variantId: 'filled-rect',
		name: 'Filled Rectangle',
		description: 'Draw filled rectangles',
		optionPresets: {
			filled: true,
			lineWidth: 1,
			perfectPixels: false
		},
		tags: ['filled', 'solid']
	},
	{
		variantId: 'outline-rect',
		name: 'Outline Rectangle',
		description: 'Draw rectangle outlines',
		optionPresets: {
			filled: false,
			lineWidth: 1,
			perfectPixels: true
		},
		tags: ['outline', 'border']
	},
	{
		variantId: 'thick-outline-rect',
		name: 'Thick Outline',
		description: 'Draw thick rectangle outlines',
		optionPresets: {
			filled: false,
			lineWidth: 3,
			perfectPixels: true
		},
		tags: ['outline', 'thick']
	}
];

/**
 * Circle tool variants
 */
export const circleVariants: VariantPreset[] = [
	{
		variantId: 'filled-circle',
		name: 'Filled Circle',
		description: 'Draw filled circles',
		optionPresets: {
			filled: true,
			lineWidth: 1,
			perfectPixels: false
		},
		tags: ['filled', 'solid']
	},
	{
		variantId: 'outline-circle',
		name: 'Outline Circle',
		description: 'Draw circle outlines',
		optionPresets: {
			filled: false,
			lineWidth: 1,
			perfectPixels: true
		},
		tags: ['outline', 'border']
	},
	{
		variantId: 'thick-outline-circle',
		name: 'Thick Outline',
		description: 'Draw thick circle outlines',
		optionPresets: {
			filled: false,
			lineWidth: 3,
			perfectPixels: true
		},
		tags: ['outline', 'thick']
	}
];

/**
 * Line tool variants
 */
export const lineVariants: VariantPreset[] = [
	{
		variantId: 'thin-line',
		name: 'Thin Line',
		description: 'Draw single-pixel lines',
		optionPresets: {
			lineWidth: 1,
			perfectAngles: false
		},
		tags: ['thin', 'fine']
	},
	{
		variantId: 'perfect-line',
		name: 'Perfect Line',
		description: 'Lines constrained to 45° angles',
		optionPresets: {
			lineWidth: 1,
			perfectAngles: true
		},
		tags: ['perfect', 'constrained']
	},
	{
		variantId: 'thick-line',
		name: 'Thick Line',
		description: 'Draw thick lines',
		optionPresets: {
			lineWidth: 3,
			perfectAngles: false
		},
		tags: ['thick', 'bold']
	}
];
