/**
 * Rectangle Tool Implementation
 *
 * Allows drawing rectangles by click-and-drag. Supports filled and outline modes,
 * with optional perfect square constraint.
 */

import { BaseTool } from '../base/BaseTool';
import type { ToolConfigExtended } from '../base/ToolMetadata';
import { commonToolOptions } from '../base/ToolOptions';
import type { ToolContext, MouseEventContext } from '../base/ToolContext';

class RectangleTool extends BaseTool {
	/** Starting position of the rectangle */
	private startX: number | null = null;
	private startY: number | null = null;

	/** Preview pixels to clear before drawing new rectangle */
	private previewPixels: Array<{ x: number; y: number; originalColor: number }> = [];

	public readonly config: ToolConfigExtended = {
		id: 'rectangle',
		name: 'Rectangle',
		description: 'Draw rectangles with fill or outline mode',
		iconName: 'Square',
		category: 'draw',
		shortcut: 'U',
		cursor: 'crosshair',
		supportsDrag: true,
		worksOnLockedLayers: false,
		order: 10,

		// Extended configuration
		version: '1.1.0',
		author: 'inline.px',
		license: 'MIT',
		tags: ['shape', 'rectangle', 'drawing', 'geometry'],

		// Tool options
		options: [
			{
				id: 'filled',
				label: 'Filled',
				description: 'Fill the rectangle with color',
				type: 'boolean',
				defaultValue: true
			},
			{
				id: 'lineWidth',
				label: 'Line Width',
				description: 'Width of the outline in pixels',
				type: 'slider',
				defaultValue: 1,
				min: 1,
				max: 16,
				step: 1
			},
			commonToolOptions.perfectPixels
		],

		// Documentation
		documentation: {
			description: 'Draw rectangular shapes on the canvas with precise control over fill and outline.',
			usage: 'Click and drag to define the rectangle. Hold Shift to constrain to a perfect square.',
			tips: [
				'Toggle "Filled" option to switch between solid and outline rectangles',
				'Adjust line width for thicker outlines',
				'Use "Perfect Pixels" to constrain to square shapes',
				'Use left-click for primary color and right-click for secondary color'
			],
			relatedTools: ['circle', 'line', 'pencil']
		}
	};

	onMouseDown(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		const { x, y } = mouseContext;

		// Store starting position
		this.startX = x;
		this.startY = y;

		// Clear preview
		this.previewPixels = [];

		return true;
	}

	onMouseMove(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		if (this.startX === null || this.startY === null) {
			return false;
		}

		// Clear previous preview
		this.clearPreview(toolContext);

		// Draw new preview
		this.drawRectangle(mouseContext, toolContext, true);

		return true;
	}

	onMouseUp(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		if (this.startX === null || this.startY === null) {
			return false;
		}

		// Clear preview
		this.clearPreview(toolContext);

		// Draw final rectangle
		this.drawRectangle(mouseContext, toolContext, false);

		// Reset state
		this.startX = null;
		this.startY = null;
		this.previewPixels = [];

		toolContext.requestRedraw();
		return true;
	}

	/**
	 * Draw rectangle from start position to current mouse position
	 */
	private drawRectangle(
		mouseContext: MouseEventContext,
		toolContext: ToolContext,
		isPreview: boolean
	): void {
		if (this.startX === null || this.startY === null) return;

		const { x, y, button } = mouseContext;
		const { colors, setPixel, getPixel, requestRedraw, canvas, state } = toolContext;

		// Use primary color for left click, secondary for right click
		const colorIndex = button === 2 ? colors.secondaryColorIndex : colors.primaryColorIndex;

		// Get options
		const filled = state.getToolOption<boolean>(this.config.id, 'filled') ?? true;
		const lineWidth = state.getToolOption<number>(this.config.id, 'lineWidth') ?? 1;
		const perfectPixels = state.getToolOption<boolean>(this.config.id, 'perfectPixels') ?? false;

		// Calculate rectangle bounds
		let x1 = Math.min(this.startX, x);
		let y1 = Math.min(this.startY, y);
		let x2 = Math.max(this.startX, x);
		let y2 = Math.max(this.startY, y);

		// Apply perfect pixels constraint (square)
		if (perfectPixels) {
			const size = Math.max(x2 - x1, y2 - y1);
			if (x < this.startX) {
				x1 = this.startX - size;
			} else {
				x2 = this.startX + size;
			}
			if (y < this.startY) {
				y1 = this.startY - size;
			} else {
				y2 = this.startY + size;
			}
		}

		// Draw filled or outline rectangle
		if (filled) {
			// Draw filled rectangle
			for (let py = y1; py <= y2; py++) {
				for (let px = x1; px <= x2; px++) {
					if (px >= 0 && px < canvas.width && py >= 0 && py < canvas.height) {
						if (isPreview) {
							// Store original color for preview
							this.previewPixels.push({ x: px, y: py, originalColor: getPixel(px, py) });
						}
						setPixel(px, py, colorIndex);
					}
				}
			}
		} else {
			// Draw outline rectangle with proper line width
			// Draw as multiple nested rectangles
			for (let i = 0; i < lineWidth; i++) {
				const innerX1 = x1 + i;
				const innerY1 = y1 + i;
				const innerX2 = x2 - i;
				const innerY2 = y2 - i;

				// Stop if rectangle becomes too small
				if (innerX1 > innerX2 || innerY1 > innerY2) break;

				// Top horizontal line
				for (let px = innerX1; px <= innerX2; px++) {
					if (px >= 0 && px < canvas.width && innerY1 >= 0 && innerY1 < canvas.height) {
						if (isPreview) {
							this.previewPixels.push({ x: px, y: innerY1, originalColor: getPixel(px, innerY1) });
						}
						setPixel(px, innerY1, colorIndex);
					}
				}

				// Bottom horizontal line
				if (innerY2 !== innerY1) {
					for (let px = innerX1; px <= innerX2; px++) {
						if (px >= 0 && px < canvas.width && innerY2 >= 0 && innerY2 < canvas.height) {
							if (isPreview) {
								this.previewPixels.push({ x: px, y: innerY2, originalColor: getPixel(px, innerY2) });
							}
							setPixel(px, innerY2, colorIndex);
						}
					}
				}

				// Left vertical line
				for (let py = innerY1; py <= innerY2; py++) {
					if (innerX1 >= 0 && innerX1 < canvas.width && py >= 0 && py < canvas.height) {
						if (isPreview) {
							this.previewPixels.push({ x: innerX1, y: py, originalColor: getPixel(innerX1, py) });
						}
						setPixel(innerX1, py, colorIndex);
					}
				}

				// Right vertical line
				if (innerX2 !== innerX1) {
					for (let py = innerY1; py <= innerY2; py++) {
						if (innerX2 >= 0 && innerX2 < canvas.width && py >= 0 && py < canvas.height) {
							if (isPreview) {
								this.previewPixels.push({ x: innerX2, y: py, originalColor: getPixel(innerX2, py) });
							}
							setPixel(innerX2, py, colorIndex);
						}
					}
				}
			}
		}

		requestRedraw();
	}

	/**
	 * Clear preview by restoring original pixels
	 */
	private clearPreview(toolContext: ToolContext): void {
		const { setPixel, requestRedraw } = toolContext;

		for (const pixel of this.previewPixels) {
			setPixel(pixel.x, pixel.y, pixel.originalColor);
		}

		this.previewPixels = [];
		requestRedraw();
	}

	canUse(toolContext: ToolContext): { valid: boolean; reason?: string } {
		const { canvas } = toolContext;
		const activeLayer = canvas.layers.find((l) => l.id === canvas.activeLayerId);

		if (!activeLayer) {
			return { valid: false, reason: 'No active layer' };
		}

		if (activeLayer.locked) {
			return { valid: false, reason: 'Layer is locked' };
		}

		return { valid: true };
	}
}

// Export singleton instance
export default new RectangleTool();
