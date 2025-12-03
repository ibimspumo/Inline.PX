/**
 * BrushTool - Variable Size Painting Brush
 *
 * Professional brush tool with:
 * - Variable brush size (1-5 pixels)
 * - Circular brush shape
 * - Smooth continuous drawing
 * - Selection-aware
 *
 * @extends BaseTool
 */

import BaseTool from '../BaseTool.js';

class BrushTool extends BaseTool {
    static CONFIG = {
        id: 'brush',
        name: 'Brush',
        icon: 'brush',
        shortcut: 'B',
        cursor: 'crosshair',
        hasSizeOption: true,
        hasShapeOption: false,
        description: 'Variable size painting brush',
        category: 'drawing'
    };

    /**
     * Handle draw start
     */
    onDrawStart(x, y, pixelData, context) {
        return this.drawBrush(x, y, pixelData, context);
    }

    /**
     * Handle draw continue
     */
    onDrawContinue(x, y, pixelData, context) {
        return this.drawBrush(x, y, pixelData, context);
    }

    /**
     * Handle draw end
     */
    onDrawEnd(x, y, pixelData, context) {
        // Final draw at end position
        return this.drawBrush(x, y, pixelData, context);
    }

    /**
     * Draw with brush at position
     * @private
     */
    drawBrush(x, y, pixelData, context) {
        const height = pixelData.length;
        const width = pixelData[0].length;
        const size = context.brushSize || this.getOption('brushSize') || 1;
        const colorCode = context.colorCode || 0;

        let modified = false;
        const halfSize = Math.floor(size / 2);

        // Circular brush shape
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

                        if (pixelData[py][px] !== colorCode) {
                            pixelData[py][px] = colorCode;
                            modified = true;
                        }
                    }
                }
            }
        }

        return modified;
    }
}

export default BrushTool;
