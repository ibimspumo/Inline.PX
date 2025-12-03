/**
 * RectangleTool - Draw Rectangles
 *
 * Professional rectangle drawing tool:
 * - Fill or stroke mode
 * - Live preview
 * - Selection-aware
 *
 * @extends BaseTool
 *
 * @typedef {import('../../types.js').DrawingContext} DrawingContext
 */

import BaseTool from '../BaseTool.js';

class RectangleTool extends BaseTool {
    static CONFIG = {
        id: 'rectangle',
        name: 'Rectangle',
        icon: 'rectangle',
        shortcut: 'R',
        cursor: 'crosshair',
        hasSizeOption: false,
        hasShapeOption: true,
        description: 'Draw rectangles',
        category: 'shape'
    };

    needsPreview() {
        return true;
    }

    onDrawStart(x, y, pixelData, context) {
        return false;
    }

    onDrawContinue(x, y, pixelData, context) {
        this.restorePreviewData(pixelData);
        return this.drawRectangle(this.startX, this.startY, x, y, pixelData, context);
    }

    onDrawEnd(x, y, pixelData, context) {
        this.restorePreviewData(pixelData);
        return this.drawRectangle(this.startX, this.startY, x, y, pixelData, context);
    }

    /**
     * Draw rectangle
     * @private
     */
    drawRectangle(x0, y0, x1, y1, pixelData, context) {
        const height = pixelData.length;
        const width = pixelData[0].length;
        const colorCode = context.colorCode || 0;
        const shapeMode = context.shapeMode || this.getOption('shapeMode') || 'fill';
        let modified = false;

        const minX = Math.max(0, Math.min(x0, x1));
        const maxX = Math.min(width - 1, Math.max(x0, x1));
        const minY = Math.max(0, Math.min(y0, y1));
        const maxY = Math.min(height - 1, Math.max(y0, y1));

        if (shapeMode === 'fill') {
            // Filled rectangle
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    if (this.respectsSelection() && !this.isInSelection(x, y)) {
                        continue;
                    }

                    if (pixelData[y][x] !== colorCode) {
                        pixelData[y][x] = colorCode;
                        modified = true;
                    }
                }
            }
        } else {
            // Stroke rectangle
            for (let x = minX; x <= maxX; x++) {
                // Top edge
                if (this.isInSelection(x, minY)) {
                    if (pixelData[minY][x] !== colorCode) {
                        pixelData[minY][x] = colorCode;
                        modified = true;
                    }
                }
                // Bottom edge
                if (this.isInSelection(x, maxY)) {
                    if (pixelData[maxY][x] !== colorCode) {
                        pixelData[maxY][x] = colorCode;
                        modified = true;
                    }
                }
            }
            for (let y = minY; y <= maxY; y++) {
                // Left edge
                if (this.isInSelection(minX, y)) {
                    if (pixelData[y][minX] !== colorCode) {
                        pixelData[y][minX] = colorCode;
                        modified = true;
                    }
                }
                // Right edge
                if (this.isInSelection(maxX, y)) {
                    if (pixelData[y][maxX] !== colorCode) {
                        pixelData[y][maxX] = colorCode;
                        modified = true;
                    }
                }
            }
        }

        return modified;
    }
}

export default RectangleTool;
