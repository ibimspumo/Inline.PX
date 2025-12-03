/**
 * PencilTool - 1px Precise Drawing
 *
 * Precise single-pixel drawing tool:
 * - Always 1 pixel size
 * - Pixel-perfect precision
 * - No anti-aliasing
 * - Selection-aware
 *
 * @extends BaseTool
 */

class PencilTool extends BaseTool {
    static CONFIG = {
        id: 'pencil',
        name: 'Pencil',
        icon: 'edit',
        shortcut: 'P',
        cursor: 'crosshair',
        hasSizeOption: false,
        hasShapeOption: false,
        description: '1px precise drawing',
        category: 'drawing'
    };

    /**
     * Handle draw start
     */
    onDrawStart(x, y, pixelData, context) {
        return this.setPixelIfValid(x, y, pixelData, context.colorCode);
    }

    /**
     * Handle draw continue
     */
    onDrawContinue(x, y, pixelData, context) {
        return this.setPixelIfValid(x, y, pixelData, context.colorCode);
    }

    /**
     * Handle draw end
     */
    onDrawEnd(x, y, pixelData, context) {
        return this.setPixelIfValid(x, y, pixelData, context.colorCode);
    }

    /**
     * Set pixel if valid and in selection
     * @private
     */
    setPixelIfValid(x, y, pixelData, colorCode) {
        if (this.respectsSelection() && !this.isInSelection(x, y)) {
            return false;
        }

        return this.setPixel(x, y, pixelData, colorCode);
    }
}

// Register globally
if (typeof window !== 'undefined') {
    window.PencilTool = PencilTool;
}
