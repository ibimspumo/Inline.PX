/**
 * Move Tool Implementation (Placeholder)
 *
 * Moves/transforms selected content or layers.
 * TODO: Full implementation pending selection system.
 */

import { BaseTool } from '../base/BaseTool';
import type { ToolConfig } from '../base/ToolConfig';

class MoveTool extends BaseTool {
	public readonly config: ToolConfig = {
		id: 'move',
		name: 'Move',
		description: 'Move selected content or layers',
		iconName: 'Move',
		category: 'edit',
		shortcut: 'V',
		cursor: 'grab',
		supportsDrag: true,
		worksOnLockedLayers: false,
		order: 1
	};

	// TODO: Implement move functionality
	// Requires selection system to be implemented first
}

// Export singleton instance
export default new MoveTool();
