/**
 * EraserTool - Erase to Transparent
 *
 * Eraser tool that sets pixels to transparent (0):
 * - Variable brush size (1-5 pixels)
 * - Circular eraser shape
 * - Always erases to transparent
 * - Selection-aware
 *
 * @extends BaseTool
 *
 * @typedef {import('../../types.js').DrawingContext} DrawingContext
 */

import BaseTool from '../BaseTool.js';

class EraserTool extends BaseTool {
    static CONFIG = {
        id: 'eraser',
        name: 'Eraser',
        icon: 'ink_eraser',
        shortcut: 'E',
        cursor: 'crosshair',
        hasSizeOption: true,
        hasShapeOption: false,
        description: 'Erase to transparent',
        category: 'drawing'
    };

    /**
     * Handle draw start
     */
    onDrawStart(x, y, pixelData, context) {
        return this.erase(x, y, pixelData, context);
    }

    /**
     * Handle draw continue
     */
    onDrawContinue(x, y, pixelData, context) {
        return this.erase(x, y, pixelData, context);
    }

    /**
     * Handle draw end
     */
    onDrawEnd(x, y, pixelData, context) {
        return this.erase(x, y, pixelData, context);
    }

    /**
     * Erase pixels at position
     * @private
     */
    erase(x, y, pixelData, context) {
        const height = pixelData.length;
        const width = pixelData[0].length;
        const size = context.brushSize || this.getOption('brushSize') || 1;

        let modified = false;
        const halfSize = Math.floor(size / 2);

        // Circular eraser shape
        for (let dy = -halfSize; dy <= halfSize; dy++) {
            for (let dx = -halfSize; dx <= halfSize; dx++) {
                const px = x + dx;
                const py = y + dy;

                // Check if within circle
                const distance = dx * dx + dy * dy;
                const radius = halfSize * halfSize + halfSize;

                if (distance <= radius) {
                    // Check bounds and selection
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        if (this.respectsSelection() && !this.isInSelection(px, py)) {
                            continue;
                        }

                        // Erase to transparent (0)
                        if (pixelData[py][px] !== 0) {
                            pixelData[py][px] = 0;
                            modified = true;
                        }
                    }
                }
            }
        }

        return modified;
    }
}

export default EraserTool;
