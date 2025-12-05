/**
 * Hand Tool Implementation (Placeholder)
 *
 * Pans the canvas view.
 * TODO: Full implementation pending pan/zoom system enhancement.
 */

import { BaseTool } from '../base/BaseTool';
import type { ToolConfig } from '../base/ToolConfig';

class HandTool extends BaseTool {
	public readonly config: ToolConfig = {
		id: 'hand',
		name: 'Hand',
		description: 'Pan the canvas view',
		iconName: 'Hand',
		category: 'view',
		shortcut: 'H',
		cursor: 'grab',
		supportsDrag: true,
		worksOnLockedLayers: true,
		order: 1
	};

	// TODO: Implement pan functionality
	// Requires enhanced pan system in canvasStore
}

// Export singleton instance
export default new HandTool();
