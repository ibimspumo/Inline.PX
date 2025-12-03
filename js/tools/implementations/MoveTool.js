/**
 * MoveTool - Move Canvas Content
 *
 * Professional move tool:
 * - Move entire canvas or selection
 * - Live preview during drag
 * - Respects selection bounds
 *
 * @extends BaseTool
 */

class MoveTool extends BaseTool {
    static CONFIG = {
        id: 'move',
        name: 'Move',
        icon: 'open_with',
        shortcut: 'V',
        cursor: 'move',
        hasSizeOption: false,
        hasShapeOption: false,
        description: 'Move content',
        category: 'navigation'
    };

    constructor() {
        super();
        this.originalData = null;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    needsPreview() {
        return true;
    }

    onDrawStart(x, y, pixelData, context) {
        // Save original data
        this.originalData = this.clonePixelData(pixelData);
        this.offsetX = 0;
        this.offsetY = 0;
        return false;
    }

    onDrawContinue(x, y, pixelData, context) {
        // Calculate offset
        this.offsetX = x - this.startX;
        this.offsetY = y - this.startY;

        // Apply move preview
        return this.applyMove(pixelData);
    }

    onDrawEnd(x, y, pixelData, context) {
        // Final move
        this.offsetX = x - this.startX;
        this.offsetY = y - this.startY;

        const modified = this.applyMove(pixelData);
        this.originalData = null;

        return modified;
    }

    onDrawCancel() {
        this.originalData = null;
        this.offsetX = 0;
        this.offsetY = 0;
    }

    /**
     * Apply move operation
     * @private
     */
    applyMove(pixelData) {
        if (!this.originalData) {
            return false;
        }

        const height = pixelData.length;
        const width = pixelData[0].length;

        // Clear canvas or selection area
        if (this.selectionActive && this.selectionBounds) {
            // Move only selection
            const { x1, y1, x2, y2 } = this.selectionBounds;

            // Clear selection area
            for (let y = y1; y <= y2; y++) {
                for (let x = x1; x <= x2; x++) {
                    if (y >= 0 && y < height && x >= 0 && x < width) {
                        pixelData[y][x] = 0;
                    }
                }
            }

            // Move selected pixels
            for (let y = y1; y <= y2; y++) {
                for (let x = x1; x <= x2; x++) {
                    const srcX = x;
                    const srcY = y;
                    const destX = x + this.offsetX;
                    const destY = y + this.offsetY;

                    if (srcY >= 0 && srcY < height && srcX >= 0 && srcX < width) {
                        if (destY >= 0 && destY < height && destX >= 0 && destX < width) {
                            pixelData[destY][destX] = this.originalData[srcY][srcX];
                        }
                    }
                }
            }
        } else {
            // Move entire canvas
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    const srcX = x - this.offsetX;
                    const srcY = y - this.offsetY;

                    if (srcY >= 0 && srcY < height && srcX >= 0 && srcX < width) {
                        pixelData[y][x] = this.originalData[srcY][srcX];
                    } else {
                        pixelData[y][x] = 0; // Fill with transparent
                    }
                }
            }
        }

        return true;
    }
}

if (typeof window !== 'undefined') {
    window.MoveTool = MoveTool;
}
