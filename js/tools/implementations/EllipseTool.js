/**
 * EllipseTool - Draw Circles and Ellipses
 *
 * Professional ellipse drawing tool:
 * - Fill or stroke mode
 * - Live preview
 * - Selection-aware
 *
 * @extends BaseTool
 */

import BaseTool from '../BaseTool.js';

class EllipseTool extends BaseTool {
    static CONFIG = {
        id: 'ellipse',
        name: 'Ellipse',
        icon: 'circle',
        shortcut: 'O',
        cursor: 'crosshair',
        hasSizeOption: false,
        hasShapeOption: true,
        description: 'Draw circles/ellipses',
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
        return this.drawEllipse(this.startX, this.startY, x, y, pixelData, context);
    }

    onDrawEnd(x, y, pixelData, context) {
        this.restorePreviewData(pixelData);
        return this.drawEllipse(this.startX, this.startY, x, y, pixelData, context);
    }

    /**
     * Draw ellipse
     * @private
     */
    drawEllipse(x0, y0, x1, y1, pixelData, context) {
        const height = pixelData.length;
        const width = pixelData[0].length;
        const colorCode = context.colorCode || 0;
        const shapeMode = context.shapeMode || this.getOption('shapeMode') || 'fill';
        let modified = false;

        const centerX = Math.floor((x0 + x1) / 2);
        const centerY = Math.floor((y0 + y1) / 2);
        const rx = Math.abs(x1 - x0) / 2;
        const ry = Math.abs(y1 - y0) / 2;

        if (shapeMode === 'fill') {
            // Filled ellipse
            for (let y = Math.floor(centerY - ry); y <= Math.ceil(centerY + ry); y++) {
                for (let x = Math.floor(centerX - rx); x <= Math.ceil(centerX + rx); x++) {
                    if (x < 0 || x >= width || y < 0 || y >= height) continue;

                    const dx = (x - centerX) / rx;
                    const dy = (y - centerY) / ry;

                    if (dx * dx + dy * dy <= 1) {
                        if (this.respectsSelection() && !this.isInSelection(x, y)) {
                            continue;
                        }

                        if (pixelData[y][x] !== colorCode) {
                            pixelData[y][x] = colorCode;
                            modified = true;
                        }
                    }
                }
            }
        } else {
            // Stroke ellipse
            const points = [];
            for (let angle = 0; angle < 360; angle += 1) {
                const rad = angle * Math.PI / 180;
                const x = Math.round(centerX + rx * Math.cos(rad));
                const y = Math.round(centerY + ry * Math.sin(rad));

                if (x >= 0 && x < width && y >= 0 && y < height) {
                    if (this.respectsSelection() && !this.isInSelection(x, y)) {
                        continue;
                    }

                    if (pixelData[y][x] !== colorCode) {
                        pixelData[y][x] = colorCode;
                        modified = true;
                    }
                }
            }
        }

        return modified;
    }
}

export default EllipseTool;
