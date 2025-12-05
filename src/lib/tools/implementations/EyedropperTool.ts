/**
 * Eyedropper Tool Implementation
 *
 * Samples color from the canvas and sets it as the primary color.
 * Click to sample, right-click to set as secondary color.
 */

import { BaseTool } from '../base/BaseTool';
import type { ToolConfig } from '../base/ToolConfig';
import type { ToolContext, MouseEventContext } from '../base/ToolContext';

class EyedropperTool extends BaseTool {
	public readonly config: ToolConfig = {
		id: 'eyedropper',
		name: 'Eyedropper',
		description: 'Sample color from canvas',
		iconName: 'Pipette',
		category: 'draw',
		shortcut: 'I',
		cursor: 'crosshair',
		supportsDrag: false,
		worksOnLockedLayers: true, // Can sample from locked layers
		order: 4
	};

	onClick(mouseContext: MouseEventContext, toolContext: ToolContext): boolean {
		const { x, y, button } = mouseContext;
		const { getPixel } = toolContext;

		// Get color at clicked position
		const colorIndex = getPixel(x, y);

		// TODO: Set this as primary or secondary color
		// This requires access to colorStore, which we'll add to ToolContext
		console.log(`Eyedropper: Sampled color index ${colorIndex} (button: ${button})`);

		// For now, we'll need to emit an event or callback
		// This will be implemented when we integrate with colorStore

		return true;
	}

	canUse(): { valid: boolean; reason?: string } {
		// Eyedropper can always be used
		return { valid: true };
	}
}

// Export singleton instance
export default new EyedropperTool();
