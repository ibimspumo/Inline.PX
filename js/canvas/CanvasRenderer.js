/**
 * CanvasRenderer - Canvas Rendering Engine
 *
 * Handles all rendering operations:
 * - Pixel rendering with color mapping
 * - Checkerboard pattern for transparency
 * - Grid overlay
 * - Size calculations
 * - Smooth rendering optimizations
 *
 * @module CanvasRenderer
 *
 * @typedef {import('../types.js').PixelData} PixelData
 */

import logger from '../core/Logger.js';
import ColorPalette from '../colorPalette.js';

let canvas = null;
let ctx = null;
let pixelSize = 30;
let showGrid = true;
let constants = null;

/**
 * Initialize renderer
 * @param {HTMLCanvasElement} canvasElement - Canvas element
 * @param {Object} config - Configuration constants
 */
function init(canvasElement, config = null) {
    canvas = canvasElement;
    ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    constants = config;

    logger.debug?.('CanvasRenderer initialized');
}

/**
 * Calculate optimal pixel size for viewport
 * @param {number} width - Canvas width in pixels
 * @param {number} height - Canvas height in pixels
 * @returns {number} Optimal pixel size
 */
function calculatePixelSize(width, height) {
    const container = canvas.parentElement;
    if (!container) {
        return constants?.canvas?.defaultPixelSize || 30;
    }

    const maxWidth = Math.min(container.clientWidth - 40, 800);
    const maxHeight = Math.min(window.innerHeight * 0.5, 800);

    const pixelSizeW = Math.floor(maxWidth / width);
    const pixelSizeH = Math.floor(maxHeight / height);

    const minSize = constants?.canvas?.minPixelSize || 8;
    const maxSize = constants?.canvas?.maxPixelSize || 50;

    return Math.max(minSize, Math.min(pixelSizeW, pixelSizeH, maxSize));
}

/**
 * Update canvas size
 * @param {number} width - Canvas width in pixels
 * @param {number} height - Canvas height in pixels
 * @param {number} pxSize - Pixel size (optional, auto-calculate if not provided)
 */
function updateCanvasSize(width, height, pxSize = null) {
    if (pxSize !== null) {
        pixelSize = pxSize;
    } else {
        pixelSize = calculatePixelSize(width, height);
    }

    canvas.width = width * pixelSize;
    canvas.height = height * pixelSize;
    ctx.imageSmoothingEnabled = false;

    logger.debug?.(`Canvas size updated: ${canvas.width}×${canvas.height} (pixel size: ${pixelSize})`);
}

/**
 * Render pixel data to canvas
 * @param {Array<Array<number>>} pixelData - 2D array of color indices
 */
function render(pixelData) {
    if (!pixelData || pixelData.length === 0) {
        logger.warn?.('No pixel data to render');
        return;
    }

    const height = pixelData.length;
    const width = pixelData[0].length;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw pixels
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const colorIndex = pixelData[y][x];

            if (colorIndex === 0) {
                // Transparent - draw checkerboard
                drawCheckerboard(x, y);
            } else {
                // Colored pixel
                const color = ColorPalette.getColor(colorIndex);
                ctx.fillStyle = color;
                ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
            }
        }
    }

    // Draw grid overlay
    if (showGrid) {
        drawGrid(width, height);
    }
}

/**
 * Draw checkerboard pattern for transparent pixel
 * @private
 * @param {number} x - Pixel X coordinate
 * @param {number} y - Pixel Y coordinate
 */
function drawCheckerboard(x, y) {
    const size = Math.max(2, Math.floor(pixelSize / 4));

    for (let dy = 0; dy < pixelSize; dy += size) {
        for (let dx = 0; dx < pixelSize; dx += size) {
            const isEven = ((Math.floor(dx / size) + Math.floor(dy / size)) % 2) === 0;
            ctx.fillStyle = isEven ? '#2a2a2a' : '#1a1a1a';
            ctx.fillRect(
                x * pixelSize + dx,
                y * pixelSize + dy,
                size,
                size
            );
        }
    }
}

/**
 * Draw grid overlay
 * @private
 * @param {number} width - Canvas width in pixels
 * @param {number} height - Canvas width in pixels
 */
function drawGrid(width, height) {
    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let x = 0; x <= width; x++) {
        ctx.beginPath();
        ctx.moveTo(x * pixelSize, 0);
        ctx.lineTo(x * pixelSize, height * pixelSize);
        ctx.stroke();
    }

    // Horizontal lines
    for (let y = 0; y <= height; y++) {
        ctx.beginPath();
        ctx.moveTo(0, y * pixelSize);
        ctx.lineTo(width * pixelSize, y * pixelSize);
        ctx.stroke();
    }
}

/**
 * Clear canvas
 */
function clear() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
}

/**
 * Set grid visibility
 * @param {boolean} visible - Show grid
 */
function setGridVisible(visible) {
    showGrid = visible;
}

/**
 * Get current pixel size
 * @returns {number} Pixel size
 */
function getPixelSize() {
    return pixelSize;
}

/**
 * Get canvas element
 * @returns {HTMLCanvasElement} Canvas element
 */
function getCanvas() {
    return canvas;
}

/**
 * Get canvas context
 * @returns {CanvasRenderingContext2D} Canvas context
 */
function getContext() {
    return ctx;
}

/**
 * Convert screen coordinates to pixel coordinates
 * @param {number} screenX - Screen X coordinate
 * @param {number} screenY - Screen Y coordinate
 * @param {number} width - Canvas width in pixels
 * @param {number} height - Canvas height in pixels
 * @param {number} zoom - Zoom level (default 1.0)
 * @returns {Object|null} {x, y} pixel coordinates or null
 */
function screenToPixelCoords(screenX, screenY, width, height, zoom = 1.0) {
    const rect = canvas.getBoundingClientRect();

    const x = Math.floor((screenX - rect.left) / (pixelSize * zoom));
    const y = Math.floor((screenY - rect.top) / (pixelSize * zoom));

    if (x >= 0 && x < width && y >= 0 && y < height) {
        return { x, y };
    }
    return null;
}

/**
 * Convert pixel coordinates to screen coordinates
 * @param {number} pixelX - Pixel X coordinate
 * @param {number} pixelY - Pixel Y coordinate
 * @param {number} zoom - Zoom level (default 1.0)
 * @returns {Object} {x, y} screen coordinates
 */
function pixelToScreenCoords(pixelX, pixelY, zoom = 1.0) {
    return {
        x: pixelX * pixelSize * zoom,
        y: pixelY * pixelSize * zoom
    };
}

const CanvasRenderer = {
    init,
    calculatePixelSize,
    updateCanvasSize,
    render,
    clear,
    setGridVisible,
    getPixelSize,
    getCanvas,
    getContext,
    screenToPixelCoords,
    pixelToScreenCoords
};

export default CanvasRenderer;
