/**
 * Tools Module - Professional Drawing Tools
 *
 * Implements Photoshop-style tools:
 * - Brush (B): Variable size painting
 * - Pencil (P): 1px precise drawing
 * - Eraser (E): Erase to transparent
 * - Line (L): Draw straight lines
 * - Rectangle (R): Draw rectangles
 * - Ellipse (O): Draw circles/ellipses
 * - Fill (F): Flood fill
 * - Select (M): Rectangular selection
 * - Magic Wand (W): Select by color
 * - Move (V): Move content
 * - Hand (H): Pan canvas
 */

const Tools = (function() {
    'use strict';

    // Tool definitions
    const TOOL_TYPES = {
        BRUSH: 'brush',
        PENCIL: 'pencil',
        ERASER: 'eraser',
        LINE: 'line',
        RECTANGLE: 'rectangle',
        ELLIPSE: 'ellipse',
        FILL: 'fill',
        SELECT: 'select',
        MAGIC_WAND: 'magicWand',
        MOVE: 'move',
        HAND: 'hand'
    };

    // Tool metadata
    const TOOL_INFO = {
        [TOOL_TYPES.BRUSH]: {
            name: 'Brush',
            icon: '🖌️',
            shortcut: 'B',
            cursor: 'crosshair',
            hasSizeOption: true,
            hasShapeOption: false
        },
        [TOOL_TYPES.PENCIL]: {
            name: 'Pencil',
            icon: '✏️',
            shortcut: 'P',
            cursor: 'crosshair',
            hasSizeOption: false,
            hasShapeOption: false
        },
        [TOOL_TYPES.ERASER]: {
            name: 'Eraser',
            icon: '🧹',
            shortcut: 'E',
            cursor: 'crosshair',
            hasSizeOption: true,
            hasShapeOption: false
        },
        [TOOL_TYPES.LINE]: {
            name: 'Line',
            icon: '📏',
            shortcut: 'L',
            cursor: 'crosshair',
            hasSizeOption: true,
            hasShapeOption: false
        },
        [TOOL_TYPES.RECTANGLE]: {
            name: 'Rectangle',
            icon: '⬜',
            shortcut: 'R',
            cursor: 'crosshair',
            hasSizeOption: false,
            hasShapeOption: true // Fill or stroke
        },
        [TOOL_TYPES.ELLIPSE]: {
            name: 'Ellipse',
            icon: '⭕',
            shortcut: 'O',
            cursor: 'crosshair',
            hasSizeOption: false,
            hasShapeOption: true // Fill or stroke
        },
        [TOOL_TYPES.FILL]: {
            name: 'Fill',
            icon: '🪣',
            shortcut: 'F',
            cursor: 'crosshair',
            hasSizeOption: false,
            hasShapeOption: false
        },
        [TOOL_TYPES.SELECT]: {
            name: 'Select',
            icon: '🔲',
            shortcut: 'M',
            cursor: 'crosshair',
            hasSizeOption: false,
            hasShapeOption: false
        },
        [TOOL_TYPES.MAGIC_WAND]: {
            name: 'Magic Wand',
            icon: '🪄',
            shortcut: 'W',
            cursor: 'crosshair',
            hasSizeOption: false,
            hasShapeOption: false
        },
        [TOOL_TYPES.MOVE]: {
            name: 'Move',
            icon: '✋',
            shortcut: 'V',
            cursor: 'move',
            hasSizeOption: false,
            hasShapeOption: false
        },
        [TOOL_TYPES.HAND]: {
            name: 'Hand',
            icon: '👋',
            shortcut: 'H',
            cursor: 'grab',
            hasSizeOption: false,
            hasShapeOption: false
        }
    };

    // Current tool state
    let currentTool = TOOL_TYPES.BRUSH;
    let brushSize = 1;
    let shapeMode = 'fill'; // 'fill' or 'stroke'
    let onToolChangeCallback = null;

    // Tool drawing state
    let isDrawing = false;
    let startX = 0;
    let startY = 0;
    let previewData = null; // For shape preview
    let selectionActive = false; // For selection tool

    /**
     * Initialize tools system
     * @param {Function} onToolChange - Callback when tool changes
     */
    function init(onToolChange) {
        onToolChangeCallback = onToolChange;
    }

    /**
     * Set current tool
     * @param {string} toolType - Tool type from TOOL_TYPES
     */
    function setTool(toolType) {
        if (!TOOL_INFO[toolType]) {
            console.error('Invalid tool type:', toolType);
            return;
        }

        currentTool = toolType;

        if (onToolChangeCallback) {
            onToolChangeCallback(toolType, TOOL_INFO[toolType]);
        }
    }

    /**
     * Get current tool
     * @returns {string} Current tool type
     */
    function getCurrentTool() {
        return currentTool;
    }

    /**
     * Get tool info
     * @param {string} toolType - Tool type
     * @returns {Object} Tool info
     */
    function getToolInfo(toolType) {
        return TOOL_INFO[toolType];
    }

    /**
     * Set brush size
     * @param {number} size - Brush size (1, 2, 3, 5)
     */
    function setBrushSize(size) {
        brushSize = Math.max(1, Math.min(5, size));
    }

    /**
     * Get brush size
     * @returns {number} Current brush size
     */
    function getBrushSize() {
        return brushSize;
    }

    /**
     * Set shape mode
     * @param {string} mode - 'fill' or 'stroke'
     */
    function setShapeMode(mode) {
        shapeMode = mode === 'stroke' ? 'stroke' : 'fill';
    }

    /**
     * Get shape mode
     * @returns {string} Current shape mode
     */
    function getShapeMode() {
        return shapeMode;
    }

    /**
     * Start drawing operation
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Array} pixelData - Canvas pixel data
     */
    function startDrawing(x, y, pixelData) {
        isDrawing = true;
        startX = x;
        startY = y;

        // Save initial state for shape tools
        if ([TOOL_TYPES.LINE, TOOL_TYPES.RECTANGLE, TOOL_TYPES.ELLIPSE].includes(currentTool)) {
            previewData = pixelData.map(row => [...row]);
        }

        // Start selection for select tool
        if (currentTool === TOOL_TYPES.SELECT) {
            selectionActive = true;
        }
    }

    /**
     * Continue drawing operation
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Array} pixelData - Canvas pixel data
     * @param {number} colorCode - Current color code
     * @returns {boolean} Whether data was modified
     */
    function continueDrawing(x, y, pixelData, colorCode) {
        if (!isDrawing) return false;

        switch (currentTool) {
            case TOOL_TYPES.BRUSH:
            case TOOL_TYPES.PENCIL:
            case TOOL_TYPES.ERASER:
                return drawBrush(x, y, pixelData, colorCode);

            case TOOL_TYPES.LINE:
                return drawLinePreview(x, y, pixelData, colorCode);

            case TOOL_TYPES.RECTANGLE:
                return drawRectanglePreview(x, y, pixelData, colorCode);

            case TOOL_TYPES.ELLIPSE:
                return drawEllipsePreview(x, y, pixelData, colorCode);

            default:
                return false;
        }
    }

    /**
     * End drawing operation
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Array} pixelData - Canvas pixel data
     * @param {number} colorCode - Current color code
     * @returns {boolean} Whether data was modified
     */
    function endDrawing(x, y, pixelData, colorCode) {
        if (!isDrawing) return false;

        isDrawing = false;
        selectionActive = false;
        let modified = false;

        switch (currentTool) {
            case TOOL_TYPES.FILL:
                modified = floodFill(x, y, pixelData, colorCode);
                break;

            case TOOL_TYPES.LINE:
                modified = drawLine(startX, startY, x, y, pixelData, colorCode);
                break;

            case TOOL_TYPES.RECTANGLE:
                modified = drawRectangle(startX, startY, x, y, pixelData, colorCode);
                break;

            case TOOL_TYPES.ELLIPSE:
                modified = drawEllipse(startX, startY, x, y, pixelData, colorCode);
                break;

            case TOOL_TYPES.SELECT:
                // Selection doesn't modify data
                console.log('Selection created:', startX, startY, 'to', x, y);
                break;
        }

        previewData = null;
        return modified;
    }

    /**
     * Get selection data for visualization
     * @returns {Object|null} Selection data
     */
    function getSelectionData() {
        if (currentTool === TOOL_TYPES.SELECT && selectionActive) {
            return {
                active: true,
                startX: startX,
                startY: startY
            };
        }
        return null;
    }

    /**
     * Draw with brush tool
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Array} pixelData - Canvas pixel data
     * @param {number} colorCode - Current color code
     * @returns {boolean} Whether data was modified
     */
    function drawBrush(x, y, pixelData, colorCode) {
        const height = pixelData.length;
        const width = pixelData[0].length;
        const size = currentTool === TOOL_TYPES.PENCIL ? 1 : brushSize;
        const color = currentTool === TOOL_TYPES.ERASER ? 0 : colorCode;

        let modified = false;
        const halfSize = Math.floor(size / 2);

        for (let dy = -halfSize; dy <= halfSize; dy++) {
            for (let dx = -halfSize; dx <= halfSize; dx++) {
                const px = x + dx;
                const py = y + dy;

                // Circle brush shape
                if (dx * dx + dy * dy <= halfSize * halfSize + halfSize) {
                    if (px >= 0 && px < width && py >= 0 && py < height) {
                        if (pixelData[py][px] !== color) {
                            pixelData[py][px] = color;
                            modified = true;
                        }
                    }
                }
            }
        }

        return modified;
    }

    /**
     * Draw line (Bresenham's algorithm)
     * @param {number} x0 - Start X
     * @param {number} y0 - Start Y
     * @param {number} x1 - End X
     * @param {number} y1 - End Y
     * @param {Array} pixelData - Canvas pixel data
     * @param {number} colorCode - Current color code
     * @returns {boolean} Whether data was modified
     */
    function drawLine(x0, y0, x1, y1, pixelData, colorCode) {
        const height = pixelData.length;
        const width = pixelData[0].length;
        let modified = false;

        const dx = Math.abs(x1 - x0);
        const dy = Math.abs(y1 - y0);
        const sx = x0 < x1 ? 1 : -1;
        const sy = y0 < y1 ? 1 : -1;
        let err = dx - dy;

        let x = x0;
        let y = y0;

        while (true) {
            if (x >= 0 && x < width && y >= 0 && y < height) {
                if (brushSize > 1) {
                    modified = drawBrush(x, y, pixelData, colorCode) || modified;
                } else {
                    if (pixelData[y][x] !== colorCode) {
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
     * Draw line preview
     */
    function drawLinePreview(x, y, pixelData, colorCode) {
        if (!previewData) return false;

        // Restore original data
        for (let py = 0; py < pixelData.length; py++) {
            for (let px = 0; px < pixelData[py].length; px++) {
                pixelData[py][px] = previewData[py][px];
            }
        }

        // Draw preview line
        return drawLine(startX, startY, x, y, pixelData, colorCode);
    }

    /**
     * Draw rectangle
     */
    function drawRectangle(x0, y0, x1, y1, pixelData, colorCode) {
        const height = pixelData.length;
        const width = pixelData[0].length;
        let modified = false;

        const minX = Math.max(0, Math.min(x0, x1));
        const maxX = Math.min(width - 1, Math.max(x0, x1));
        const minY = Math.max(0, Math.min(y0, y1));
        const maxY = Math.min(height - 1, Math.max(y0, y1));

        if (shapeMode === 'fill') {
            // Filled rectangle
            for (let y = minY; y <= maxY; y++) {
                for (let x = minX; x <= maxX; x++) {
                    if (pixelData[y][x] !== colorCode) {
                        pixelData[y][x] = colorCode;
                        modified = true;
                    }
                }
            }
        } else {
            // Stroke rectangle
            for (let x = minX; x <= maxX; x++) {
                if (pixelData[minY][x] !== colorCode) {
                    pixelData[minY][x] = colorCode;
                    modified = true;
                }
                if (pixelData[maxY][x] !== colorCode) {
                    pixelData[maxY][x] = colorCode;
                    modified = true;
                }
            }
            for (let y = minY; y <= maxY; y++) {
                if (pixelData[y][minX] !== colorCode) {
                    pixelData[y][minX] = colorCode;
                    modified = true;
                }
                if (pixelData[y][maxX] !== colorCode) {
                    pixelData[y][maxX] = colorCode;
                    modified = true;
                }
            }
        }

        return modified;
    }

    /**
     * Draw rectangle preview
     */
    function drawRectanglePreview(x, y, pixelData, colorCode) {
        if (!previewData) return false;

        // Restore original data
        for (let py = 0; py < pixelData.length; py++) {
            for (let px = 0; px < pixelData[py].length; px++) {
                pixelData[py][px] = previewData[py][px];
            }
        }

        return drawRectangle(startX, startY, x, y, pixelData, colorCode);
    }

    /**
     * Draw ellipse (Bresenham's ellipse algorithm)
     */
    function drawEllipse(x0, y0, x1, y1, pixelData, colorCode) {
        const height = pixelData.length;
        const width = pixelData[0].length;
        let modified = false;

        const centerX = Math.floor((x0 + x1) / 2);
        const centerY = Math.floor((y0 + y1) / 2);
        const rx = Math.abs(x1 - x0) / 2;
        const ry = Math.abs(y1 - y0) / 2;

        if (shapeMode === 'fill') {
            // Filled ellipse
            for (let y = Math.floor(centerY - ry); y <= Math.ceil(centerY + ry); y++) {
                for (let x = Math.floor(centerX - rx); x <= Math.ceil(centerX + rx); x++) {
                    const dx = (x - centerX) / rx;
                    const dy = (y - centerY) / ry;
                    if (dx * dx + dy * dy <= 1) {
                        if (x >= 0 && x < width && y >= 0 && y < height) {
                            if (pixelData[y][x] !== colorCode) {
                                pixelData[y][x] = colorCode;
                                modified = true;
                            }
                        }
                    }
                }
            }
        } else {
            // Stroke ellipse (simplified)
            const points = [];
            for (let angle = 0; angle < 360; angle += 1) {
                const rad = angle * Math.PI / 180;
                const x = Math.round(centerX + rx * Math.cos(rad));
                const y = Math.round(centerY + ry * Math.sin(rad));
                if (x >= 0 && x < width && y >= 0 && y < height) {
                    points.push({ x, y });
                }
            }

            points.forEach(p => {
                if (pixelData[p.y][p.x] !== colorCode) {
                    pixelData[p.y][p.x] = colorCode;
                    modified = true;
                }
            });
        }

        return modified;
    }

    /**
     * Draw ellipse preview
     */
    function drawEllipsePreview(x, y, pixelData, colorCode) {
        if (!previewData) return false;

        // Restore original data
        for (let py = 0; py < pixelData.length; py++) {
            for (let px = 0; px < pixelData[py].length; px++) {
                pixelData[py][px] = previewData[py][px];
            }
        }

        return drawEllipse(startX, startY, x, y, pixelData, colorCode);
    }

    /**
     * Flood fill algorithm
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Array} pixelData - Canvas pixel data
     * @param {number} newColor - New color code
     * @returns {boolean} Whether data was modified
     */
    function floodFill(x, y, pixelData, newColor) {
        const height = pixelData.length;
        const width = pixelData[0].length;

        if (x < 0 || x >= width || y < 0 || y >= height) return false;

        const targetColor = pixelData[y][x];
        if (targetColor === newColor) return false;

        const stack = [[x, y]];
        let modified = false;

        while (stack.length > 0) {
            const [cx, cy] = stack.pop();

            if (cx < 0 || cx >= width || cy < 0 || cy >= height) continue;
            if (pixelData[cy][cx] !== targetColor) continue;

            pixelData[cy][cx] = newColor;
            modified = true;

            stack.push([cx + 1, cy]);
            stack.push([cx - 1, cy]);
            stack.push([cx, cy + 1]);
            stack.push([cx, cy - 1]);
        }

        return modified;
    }

    // Public API
    return {
        TOOL_TYPES,
        TOOL_INFO,
        init,
        setTool,
        getCurrentTool,
        getToolInfo,
        setBrushSize,
        getBrushSize,
        setShapeMode,
        getShapeMode,
        startDrawing,
        continueDrawing,
        endDrawing,
        getSelectionData
    };
})();
