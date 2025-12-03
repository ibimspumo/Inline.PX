/**
 * MagicWandTool - Select by Color
 *
 * Professional magic wand tool:
 * - Select all connected pixels of same color
 * - Flood-fill based selection
 * - Creates rectangular selection around matched pixels
 *
 * @extends BaseTool
 */

class MagicWandTool extends BaseTool {
    static CONFIG = {
        id: 'magicWand',
        name: 'Magic Wand',
        icon: 'auto_fix_high',
        shortcut: 'W',
        cursor: 'crosshair',
        hasSizeOption: false,
        hasShapeOption: false,
        description: 'Select by color',
        category: 'selection'
    };

    respectsSelection() {
        return false;
    }

    onDrawStart(x, y, pixelData, context) {
        return false;
    }

    onDrawContinue(x, y, pixelData, context) {
        return false;
    }

    onDrawEnd(x, y, pixelData, context) {
        // Execute magic wand selection
        return this.selectByColor(x, y, pixelData, context);
    }

    /**
     * Select all connected pixels of same color
     * @private
     */
    selectByColor(x, y, pixelData, context) {
        const height = pixelData.length;
        const width = pixelData[0].length;

        if (x < 0 || x >= width || y < 0 || y >= height) {
            return false;
        }

        const targetColor = pixelData[y][x];
        const matchedPixels = [];
        const stack = [[x, y]];
        const visited = new Set();

        // Find all connected pixels of same color
        while (stack.length > 0) {
            const [cx, cy] = stack.pop();
            const key = `${cx},${cy}`;

            if (visited.has(key)) {
                continue;
            }

            if (cx < 0 || cx >= width || cy < 0 || cy >= height) {
                continue;
            }

            if (pixelData[cy][cx] !== targetColor) {
                continue;
            }

            visited.add(key);
            matchedPixels.push([cx, cy]);

            // Add neighbors
            stack.push([cx + 1, cy]);
            stack.push([cx - 1, cy]);
            stack.push([cx, cy + 1]);
            stack.push([cx, cy - 1]);
        }

        if (matchedPixels.length === 0) {
            this.clearSelection();
            return false;
        }

        // Calculate bounding box
        let minX = width;
        let minY = height;
        let maxX = 0;
        let maxY = 0;

        matchedPixels.forEach(([px, py]) => {
            minX = Math.min(minX, px);
            minY = Math.min(minY, py);
            maxX = Math.max(maxX, px);
            maxY = Math.max(maxY, py);
        });

        // Set selection bounds
        const bounds = {
            x1: minX,
            y1: minY,
            x2: maxX,
            y2: maxY
        };

        this.setSelection(bounds);

        // Notify for overlay update
        if (context.onSelectionChange) {
            context.onSelectionChange(bounds);
        }

        this.logger.info?.(`Magic wand selected ${matchedPixels.length} pixels`);
        return false; // Don't modify pixel data
    }
}

if (typeof window !== 'undefined') {
    window.MagicWandTool = MagicWandTool;
}
