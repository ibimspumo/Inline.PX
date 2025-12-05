/**
 * Hand Tool Implementation
 *
 * Pans the canvas view by clicking and dragging.
 * Changes cursor to 'grabbing' during drag operation.
 */

import { BaseTool } from '../base/BaseTool';
import type { ToolConfigExtended } from '../base/ToolMetadata';
import type { ToolContext, MouseEventContext } from '../base/ToolContext';

class HandTool extends BaseTool {
	private isDragging = false;
	private lastX = 0;
	private lastY = 0;
	private initialPanX = 0;
	private initialPanY = 0;

	public readonly config: ToolConfigExtended = {
		id: 'hand',
		name: 'Hand',
		description: 'Pan the canvas view',
		iconName: 'Hand',
		category: 'view',
		shortcut: 'H',
		cursor: 'grab',
		supportsDrag: true,
		worksOnLockedLayers: true,
		order: 1,
		version: '1.0.0',
		author: 'inline.px',
		license: 'MIT',
		tags: ['navigation', 'pan', 'view'],
		options: [
			{
				id: 'panSpeed',
				label: 'Pan Speed',
				description: 'Speed multiplier for panning (higher = faster)',
				type: 'slider',
				defaultValue: 1,
				min: 0.1,
				max: 3,
				step: 0.1
			}
		]
	};

	onActivate(): void {
		// Change cursor to grab when tool is activated
		document.body.style.cursor = 'grab';
	}

	onDeactivate(): void {
		// Restore default cursor when tool is deactivated
		document.body.style.cursor = '';
		this.isDragging = false;
	}

	onMouseDown(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		const { originalEvent } = mouseContext;
		const { canvas } = toolContext;

		// Store initial pan position and mouse position
		this.isDragging = true;
		this.lastX = originalEvent.clientX;
		this.lastY = originalEvent.clientY;
		this.initialPanX = canvas.panX;
		this.initialPanY = canvas.panY;

		// Change cursor to grabbing
		document.body.style.cursor = 'grabbing';

		return true;
	}

	onMouseMove(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		if (!this.isDragging) return false;

		const { originalEvent } = mouseContext;
		const { state, setPan } = toolContext;

		// Get pan speed from options
		const panSpeed = state.getToolOption<number>(this.config.id, 'panSpeed') ?? 1;

		// Calculate delta movement
		const deltaX = (originalEvent.clientX - this.lastX) * panSpeed;
		const deltaY = (originalEvent.clientY - this.lastY) * panSpeed;

		// Update pan position
		const newPanX = this.initialPanX + deltaX;
		const newPanY = this.initialPanY + deltaY;

		// Apply pan
		setPan(newPanX, newPanY);

		return true;
	}

	onMouseUp(): boolean {
		this.isDragging = false;
		// Change cursor back to grab
		document.body.style.cursor = 'grab';
		return true;
	}

	canUse(): { valid: boolean; reason?: string } {
		// Hand tool can always be used
		return { valid: true };
	}
}

// Export singleton instance
export default new HandTool();
