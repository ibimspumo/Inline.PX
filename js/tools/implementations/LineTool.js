/**
 * LineTool - Draw Straight Lines
 *
 * Professional line drawing tool:
 * - Bresenham's line algorithm
 * - Variable thickness
 * - Live preview
 * - Selection-aware
 *
 * @extends BaseTool
 */

import BaseTool from '../BaseTool.js';

class LineTool extends BaseTool {
    static CONFIG = {
        id: 'line',
        name: 'Line',
        icon: 'show_chart',
        shortcut: 'L',
        cursor: 'crosshair',
        hasSizeOption: true,
        hasShapeOption: false,
        description: 'Draw straight lines',
        category: 'shape'
    };

    needsPreview() {
        return true;
    }

    onDrawStart(x, y, pixelData, context) {
        // Just save start position, no drawing yet
        return false;
    }

    onDrawContinue(x, y, pixelData, context) {
        // Restore preview data and draw line preview
        this.restorePreviewData(pixelData);
        return this.drawLine(this.startX, this.startY, x, y, pixelData, context);
    }

    onDrawEnd(x, y, pixelData, context) {
        // Draw final line
        this.restorePreviewData(pixelData);
        return this.drawLine(this.startX, this.startY, x, y, pixelData, context);
    }

    /**
     * Draw line using Bresenham's algorithm
     * @private
     */
    drawLine(x0, y0, x1, y1, pixelData, context) {
        const height = pixelData.length;
        const width = pixelData[0].length;
        const colorCode = context.colorCode || 0;
        const brushSize = context.brushSize || 1;
        let modified = false;

        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;

        let x = x0;
        let y = y0;

        while (true) {
            // Draw pixel or brush
            if (brushSize > 1) {
                modified = this.drawBrushAt(x, y, pixelData, colorCode, brushSize) || modified;
            } else {
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    if (this.respectsSelection() && !this.isInSelection(x, y)) {
                        // Skip
                    } else if (pixelData[y][x] !== colorCode) {
                        pixelData[y][x] = colorCode;
                        modified = true;
                    }
                }
            }

            if (x === x1 && y === y1) break;

            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x += sx;
            }
            if (e2 < dx) {
                err += dx;
                y += sy;
            }
        }

        return modified;
    }

    /**
     * Draw brush at position (for thick lines)
     * @private
     */
    drawBrushAt(x, y, pixelData, colorCode, size) {
        const height = pixelData.length;
        const width = pixelData[0].length;
        let modified = false;
        const halfSize = Math.floor(size / 2);

        for (let dy = -halfSize; dy <= halfSize; dy++) {
            for (let dx = -halfSize; dx <= halfSize; dx++) {
                const px = x + dx;
                const py = y + dy;

                const distance = dx * dx + dy * dy;
                const radius = halfSize * halfSize + halfSize;

                if (distance <= radius) {
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

export default LineTool;
