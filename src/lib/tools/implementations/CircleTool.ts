/**
 * Circle Tool Implementation
 *
 * Allows drawing circles and ellipses by click-and-drag. Supports filled and outline modes,
 * with optional perfect circle constraint.
 */

import { BaseTool } from '../base/BaseTool';
import type { ToolConfigExtended } from '../base/ToolMetadata';
import { commonToolOptions } from '../base/ToolOptions';
import type { ToolContext, MouseEventContext } from '../base/ToolContext';

class CircleTool extends BaseTool {
	/** Starting position of the circle */
	private startX: number | null = null;
	private startY: number | null = null;

	/** Preview pixels to clear before drawing new circle */
	private previewPixels: Array<{ x: number; y: number; originalColor: number }> = [];

	public readonly config: ToolConfigExtended = {
		id: 'circle',
		name: 'Circle',
		description: 'Draw circles and ellipses with fill or outline mode',
		iconName: 'Circle',
		category: 'draw',
		shortcut: 'C',
		cursor: 'crosshair',
		supportsDrag: true,
		worksOnLockedLayers: false,
		order: 11,

		// Extended configuration
		version: '1.1.0',
		author: 'inline.px',
		license: 'MIT',
		tags: ['shape', 'circle', 'ellipse', 'drawing', 'geometry'],

		// Tool options
		options: [
			{
				id: 'filled',
				label: 'Filled',
				description: 'Fill the circle with color',
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
			description: 'Draw circular and elliptical shapes on the canvas with precise control over fill and outline.',
			usage: 'Click and drag to define the circle. Enable "Perfect Pixels" to constrain to a perfect circle instead of an ellipse.',
			tips: [
				'Toggle "Filled" option to switch between solid and outline circles',
				'Adjust line width for thicker outlines',
				'Use "Perfect Pixels" to constrain to perfect circles',
				'Use left-click for primary color and right-click for secondary color'
			],
			relatedTools: ['rectangle', 'line', 'pencil']
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
		this.drawCircle(mouseContext, toolContext, true);

		return true;
	}

	onMouseUp(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		if (this.startX === null || this.startY === null) {
			return false;
		}

		// Clear preview
		this.clearPreview(toolContext);

		// Draw final circle
		this.drawCircle(mouseContext, toolContext, false);

		// Reset state
		this.startX = null;
		this.startY = null;
		this.previewPixels = [];

		toolContext.requestRedraw();
		return true;
	}

	/**
	 * Draw circle from start position to current mouse position
	 */
	private drawCircle(
		mouseContext: MouseEventContext,
		toolContext: ToolContext,
		isPreview: boolean
	): void {
		if (this.startX === null || this.startY === null) return;

		const { x, y, button } = mouseContext;
		const { colors, requestRedraw, state } = toolContext;

		// Use primary color for left click, secondary for right click
		const colorIndex = button === 2 ? colors.secondaryColorIndex : colors.primaryColorIndex;

		// Get options
		const filled = state.getToolOption<boolean>(this.config.id, 'filled') ?? true;
		const lineWidth = state.getToolOption<number>(this.config.id, 'lineWidth') ?? 1;
		const perfectPixels = state.getToolOption<boolean>(this.config.id, 'perfectPixels') ?? false;

		// Calculate center and radii
		const cx = Math.round((this.startX + x) / 2);
		const cy = Math.round((this.startY + y) / 2);
		let rx = Math.round(Math.abs(x - this.startX) / 2);
		let ry = Math.round(Math.abs(y - this.startY) / 2);

		// Apply perfect circle constraint
		if (perfectPixels) {
			const radius = Math.max(rx, ry);
			rx = radius;
			ry = radius;
		}

		// Draw filled or outline circle
		if (filled) {
			this.drawFilledEllipse(cx, cy, rx, ry, colorIndex, toolContext, isPreview);
		} else {
			// For outline, draw multiple filled ellipses with decreasing radii
			for (let i = 0; i < lineWidth; i++) {
				const outerRx = Math.max(1, rx - i);
				const outerRy = Math.max(1, ry - i);
				this.drawEllipseOutlineLayer(cx, cy, outerRx, outerRy, colorIndex, toolContext, isPreview);
			}
		}

		requestRedraw();
	}

	/**
	 * Draw a filled ellipse using scan-line algorithm
	 */
	private drawFilledEllipse(
		cx: number,
		cy: number,
		rx: number,
		ry: number,
		colorIndex: number,
		toolContext: ToolContext,
		isPreview: boolean
	): void {
		const { setPixel, getPixel, canvas } = toolContext;

		// Use ellipse equation: (x-cx)²/rx² + (y-cy)²/ry² <= 1
		for (let dy = -ry; dy <= ry; dy++) {
			const py = cy + dy;
			if (py < 0 || py >= canvas.height) continue;

			// Calculate x extent at this y
			const term = 1 - (dy * dy) / (ry * ry);
			if (term < 0) continue;

			const dx = Math.floor(rx * Math.sqrt(term));

			for (let x = cx - dx; x <= cx + dx; x++) {
				if (x >= 0 && x < canvas.width) {
					if (isPreview) {
						this.previewPixels.push({ x, y: py, originalColor: getPixel(x, py) });
					}
					setPixel(x, py, colorIndex);
				}
			}
		}
	}

	/**
	 * Draw a single outline layer of an ellipse
	 */
	private drawEllipseOutlineLayer(
		cx: number,
		cy: number,
		rx: number,
		ry: number,
		colorIndex: number,
		toolContext: ToolContext,
		isPreview: boolean
	): void {
		const { setPixel, getPixel, canvas } = toolContext;

		if (rx <= 0 || ry <= 0) return;

		// Use Bresenham-like algorithm for ellipse
		// We'll plot points that satisfy the ellipse equation within a tolerance

		const pixels = new Set<string>();

		// Scan through all possible points in the bounding box
		for (let dy = -ry; dy <= ry; dy++) {
			const py = cy + dy;
			if (py < 0 || py >= canvas.height) continue;

			// For this y, find the x positions on the ellipse edge
			const term = 1 - (dy * dy) / (ry * ry);
			if (term < 0) continue;

			const dx = Math.round(rx * Math.sqrt(term));

			// Draw left and right edge pixels
			const leftX = cx - dx;
			const rightX = cx + dx;

			if (leftX >= 0 && leftX < canvas.width) {
				const key = `${leftX},${py}`;
				if (!pixels.has(key)) {
					pixels.add(key);
					if (isPreview) {
						this.previewPixels.push({ x: leftX, y: py, originalColor: getPixel(leftX, py) });
					}
					setPixel(leftX, py, colorIndex);
				}
			}

			if (rightX >= 0 && rightX < canvas.width && rightX !== leftX) {
				const key = `${rightX},${py}`;
				if (!pixels.has(key)) {
					pixels.add(key);
					if (isPreview) {
						this.previewPixels.push({ x: rightX, y: py, originalColor: getPixel(rightX, py) });
					}
					setPixel(rightX, py, colorIndex);
				}
			}
		}

		// Now scan horizontally to fill gaps
		for (let dx = -rx; dx <= rx; dx++) {
			const px = cx + dx;
			if (px < 0 || px >= canvas.width) continue;

			const term = 1 - (dx * dx) / (rx * rx);
			if (term < 0) continue;

			const dy = Math.round(ry * Math.sqrt(term));

			// Draw top and bottom edge pixels
			const topY = cy - dy;
			const bottomY = cy + dy;

			if (topY >= 0 && topY < canvas.height) {
				const key = `${px},${topY}`;
				if (!pixels.has(key)) {
					pixels.add(key);
					if (isPreview) {
						this.previewPixels.push({ x: px, y: topY, originalColor: getPixel(px, topY) });
					}
					setPixel(px, topY, colorIndex);
				}
			}

			if (bottomY >= 0 && bottomY < canvas.height && bottomY !== topY) {
				const key = `${px},${bottomY}`;
				if (!pixels.has(key)) {
					pixels.add(key);
					if (isPreview) {
						this.previewPixels.push({ x: px, y: bottomY, originalColor: getPixel(px, bottomY) });
					}
					setPixel(px, bottomY, colorIndex);
				}
			}
		}
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
export default new CircleTool();
