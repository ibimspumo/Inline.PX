/**
 * Pencil Tool Implementation
 *
 * Allows freehand drawing with primary (left-click) or secondary (right-click) color.
 * Supports click-and-drag for continuous drawing.
 */

import { BaseTool } from '../base/BaseTool';
import type { ToolConfig } from '../base/ToolConfig';
import type { ToolContext, MouseEventContext } from '../base/ToolContext';

class PencilTool extends BaseTool {
	public readonly config: ToolConfig = {
		id: 'pencil',
		name: 'Pencil',
		description: 'Draw freehand with primary or secondary color',
		iconName: 'Pencil',
		category: 'draw',
		shortcut: 'B',
		cursor: 'crosshair',
		supportsDrag: true,
		worksOnLockedLayers: false,
		order: 1
	};

	onMouseDown(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		return this.drawPixel(mouseContext, toolContext);
	}

	onMouseMove(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		return this.drawPixel(mouseContext, toolContext);
	}

	/**
	 * Draw a pixel at the mouse position
	 */
	private drawPixel(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		const { x, y, button } = mouseContext;
		const { colors, setPixel, requestRedraw } = toolContext;

		// Use primary color for left click, secondary for right click
		const colorIndex = button === 2 ? colors.secondaryColorIndex : colors.primaryColorIndex;

		setPixel(x, y, colorIndex);
		requestRedraw();

		return true;
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
export default new PencilTool();
