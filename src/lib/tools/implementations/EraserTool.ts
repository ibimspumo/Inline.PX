/**
 * Eraser Tool Implementation
 *
 * Erases pixels by setting them to transparent (color index 0).
 * Supports click-and-drag for continuous erasing.
 */

import { BaseTool } from '../base/BaseTool';
import type { ToolConfig } from '../base/ToolConfig';
import type { ToolContext, MouseEventContext } from '../base/ToolContext';

class EraserTool extends BaseTool {
	public readonly config: ToolConfig = {
		id: 'eraser',
		name: 'Eraser',
		description: 'Erase pixels to transparent',
		iconName: 'Eraser',
		category: 'draw',
		shortcut: 'E',
		cursor: 'crosshair',
		supportsDrag: true,
		worksOnLockedLayers: false,
		order: 2
	};

	onMouseDown(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		return this.erasePixel(mouseContext, toolContext);
	}

	onMouseMove(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		return this.erasePixel(mouseContext, toolContext);
	}

	/**
	 * Erase a pixel at the mouse position
	 */
	private erasePixel(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		const { x, y } = mouseContext;
		const { setPixel, requestRedraw } = toolContext;

		// Always set to transparent (index 0)
		setPixel(x, y, 0);
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
export default new EraserTool();
