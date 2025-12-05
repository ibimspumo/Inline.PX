/**
 * Bucket/Fill Tool Implementation
 *
 * Flood fills a contiguous area with the selected color.
 * Uses stack-based flood fill algorithm for performance.
 */

import { BaseTool } from '../base/BaseTool';
import type { ToolConfig } from '../base/ToolConfig';
import type { ToolContext, MouseEventContext } from '../base/ToolContext';

class BucketTool extends BaseTool {
	public readonly config: ToolConfig = {
		id: 'bucket',
		name: 'Paint Bucket',
		description: 'Fill contiguous area with color',
		iconName: 'PaintBucket',
		category: 'draw',
		shortcut: 'G',
		cursor: 'crosshair',
		supportsDrag: false,
		worksOnLockedLayers: false,
		order: 3
	};

	onClick(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		const { x, y, button } = mouseContext;
		const { canvas, colors, setPixel, getPixel, requestRedraw } = toolContext;

		// Use primary color for left click, secondary for right click
		const fillColorIndex = button === 2 ? colors.secondaryColorIndex : colors.primaryColorIndex;

		// Get the target color at click position
		const targetColorIndex = getPixel(x, y);

		// If the fill color is the same as the target color, no need to fill
		if (targetColorIndex === fillColorIndex) {
			return false;
		}

		// Perform flood fill
		this.floodFill(x, y, targetColorIndex, fillColorIndex, canvas, setPixel, getPixel);
		requestRedraw();

		return true;
	}

	/**
	 * Flood fill algorithm using stack-based approach
	 */
	private floodFill(
		startX: number,
		startY: number,
		targetColor: number,
		fillColor: number,
		canvas: { width: number; height: number },
		setPixel: (x: number, y: number, colorIndex: number) => void,
		getPixel: (x: number, y: number) => number
	): void {
		const { width, height } = canvas;
		const stack: { x: number; y: number }[] = [{ x: startX, y: startY }];
		const visited = new Set<string>();

		while (stack.length > 0) {
			const { x, y } = stack.pop()!;

			// Skip if out of bounds
			if (x < 0 || x >= width || y < 0 || y >= height) continue;

			// Skip if already visited
			const key = `${x},${y}`;
			if (visited.has(key)) continue;
			visited.add(key);

			// Skip if this pixel is not the target color
			if (getPixel(x, y) !== targetColor) continue;

			// Fill this pixel
			setPixel(x, y, fillColor);

			// Add neighbors to stack (4-way connectivity)
			stack.push({ x: x + 1, y });
			stack.push({ x: x - 1, y });
			stack.push({ x, y: y + 1 });
			stack.push({ x, y: y - 1 });
		}
	}

	canUse(toolContext: ToolContext): { valid: boolean; reason?: string } {
		const { canvas } = toolContext;
		const activeLayer = canvas.layers.find(l => l.id === canvas.activeLayerId);

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
export default new BucketTool();
