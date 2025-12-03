/**
 * FillTool - Flood Fill (Bucket Tool)
 *
 * Professional flood fill tool:
 * - Stack-based algorithm (non-recursive)
 * - Fast and efficient
 * - Selection-aware
 * - Prevents infinite loops
 *
 * @extends BaseTool
 */

import BaseTool from '../BaseTool.js';

class FillTool extends BaseTool {
    static CONFIG = {
        id: 'fill',
        name: 'Fill',
        icon: 'format_color_fill',
        shortcut: 'F',
        cursor: 'crosshair',
        hasSizeOption: false,
        hasShapeOption: false,
        description: 'Flood fill',
        category: 'drawing'
    };

    onDrawStart(x, y, pixelData, context) {
        // Fill happens on click, not drag
        return false;
    }

    onDrawContinue(x, y, pixelData, context) {
        // No continuous drawing for fill tool
        return false;
    }

    onDrawEnd(x, y, pixelData, context) {
        // Execute fill on mouse up
        return this.floodFill(x, y, pixelData, context);
    }

    /**
     * Flood fill algorithm (stack-based, non-recursive)
     * @private
     */
    floodFill(x, y, pixelData, context) {
        const height = pixelData.length;
        const width = pixelData[0].length;
        const newColor = context.colorCode || 0;

        // Validate coordinates
        if (x < 0 || x >= width || y < 0 || y >= height) {
            return false;
        }

        // Check selection
        if (this.respectsSelection() && !this.isInSelection(x, y)) {
            this.logger.warn?.('Fill tool: clicked outside selection');
            return false;
        }

        const targetColor = pixelData[y][x];

        // Same color, nothing to do
        if (targetColor === newColor) {
            return false;
        }

        const stack = [[x, y]];
        const visited = new Set();
        let modified = false;
        let iterations = 0;
        const maxIterations = width * height; // Safety limit

        while (stack.length > 0 && iterations < maxIterations) {
            iterations++;
            const [cx, cy] = stack.pop();

            // Create unique key for visited tracking
            const key = `${cx},${cy}`;
            if (visited.has(key)) {
                continue;
            }

            // Check bounds
            if (cx < 0 || cx >= width || cy < 0 || cy >= height) {
                continue;
            }

            // Check color match
            if (pixelData[cy][cx] !== targetColor) {
                continue;
            }

            // Check selection
            if (this.respectsSelection() && !this.isInSelection(cx, cy)) {
                continue;
            }

            // Fill pixel
            pixelData[cy][cx] = newColor;
            visited.add(key);
            modified = true;

            // Add neighbors to stack
            stack.push([cx + 1, cy]);
            stack.push([cx - 1, cy]);
            stack.push([cx, cy + 1]);
            stack.push([cx, cy - 1]);
        }

        if (iterations >= maxIterations) {
            this.logger.warn?.('Flood fill reached iteration limit');
        }

        return modified;
    }
}

export default FillTool;
