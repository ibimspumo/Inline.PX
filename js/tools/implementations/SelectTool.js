/**
 * SelectTool - Rectangular Selection
 *
 * Professional selection tool:
 * - Rectangular selection area
 * - Persistent selection across tool switches
 * - Live preview during dragging
 * - Selection data export
 *
 * @extends BaseTool
 */

class SelectTool extends BaseTool {
    static CONFIG = {
        id: 'select',
        name: 'Select',
        icon: 'select_all',
        shortcut: 'M',
        cursor: 'crosshair',
        hasSizeOption: false,
        hasShapeOption: false,
        description: 'Rectangular selection',
        category: 'selection'
    };

    constructor() {
        super();
        this.tempSelection = null; // Temp selection during drag
    }

    respectsSelection() {
        return false; // Selection tool doesn't respect its own selection
    }

    onDrawStart(x, y, pixelData, context) {
        // Start new selection
        this.tempSelection = { x1: x, y1: y, x2: x, y2: y };
        return false;
    }

    onDrawContinue(x, y, pixelData, context) {
        // Update temp selection
        if (this.tempSelection) {
            this.tempSelection.x2 = x;
            this.tempSelection.y2 = y;
        }
        return false;
    }

    onDrawEnd(x, y, pixelData, context) {
        // Finalize selection
        if (this.tempSelection) {
            const bounds = {
                x1: Math.min(this.tempSelection.x1, x),
                y1: Math.min(this.tempSelection.y1, y),
                x2: Math.max(this.tempSelection.x1, x),
                y2: Math.max(this.tempSelection.y1, y)
            };

            // Set selection bounds
            this.setSelection(bounds);
            this.tempSelection = null;

            // Notify for overlay update
            if (context.onSelectionChange) {
                context.onSelectionChange(bounds);
            }
        }
        return false;
    }

    onDrawCancel() {
        this.tempSelection = null;
    }

    /**
     * Get current selection data for rendering
     * @returns {Object|null} Selection data
     */
    getSelectionData() {
        if (this.tempSelection) {
            return {
                active: true,
                isDrawing: true,
                x1: this.tempSelection.x1,
                y1: this.tempSelection.y1,
                x2: this.tempSelection.x2,
                y2: this.tempSelection.y2
            };
        } else if (this.selectionActive && this.selectionBounds) {
            return {
                active: true,
                isDrawing: false,
                ...this.selectionBounds
            };
        }
        return null;
    }

    /**
     * Get selected pixels
     * @param {Array<Array<number>>} pixelData - Pixel data
     * @returns {Array<Array<number>>|null} Selected pixel data
     */
    getSelectedPixels(pixelData) {
        if (!this.selectionActive || !this.selectionBounds) {
            return null;
        }

        const { x1, y1, x2, y2 } = this.selectionBounds;
        const selected = [];

        for (let y = y1; y <= y2; y++) {
            const row = [];
            for (let x = x1; x <= x2; x++) {
                if (y >= 0 && y < pixelData.length && x >= 0 && x < pixelData[0].length) {
                    row.push(pixelData[y][x]);
                } else {
                    row.push(0); // Transparent for out-of-bounds
                }
            }
            selected.push(row);
        }

        return selected;
    }
}

if (typeof window !== 'undefined') {
    window.SelectTool = SelectTool;
}
