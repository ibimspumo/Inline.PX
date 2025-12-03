/**
 * ToolDrawingProxy - Proxies drawing operations to current tool
 *
 * Provides delegation methods for:
 * - Drawing lifecycle (start, continue, end, cancel)
 * - Selection management
 * - Validation
 *
 * @module ToolDrawingProxy
 *
 * @typedef {import('../types.js').DrawingContext} DrawingContext
 * @typedef {import('../types.js').SelectionBounds} SelectionBounds
 */

import logger from '../core/Logger.js';

let currentTool = null;

/**
 * Set the current tool
 * @param {Object} tool - Tool instance
 */
export function setCurrentToolForDrawing(tool) {
    currentTool = tool;
}

/**
 * Start drawing operation
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Array} pixelData - Pixel data
 * @param {Object} context - Additional context
 * @returns {boolean} True if started successfully
 */
export function startDrawing(x, y, pixelData, context = {}) {
    if (!currentTool) {
        logger.warn?.('No tool selected for drawing');
        return false;
    }

    try {
        return currentTool.startDrawing(x, y, pixelData, context);
    } catch (error) {
        logger.error?.('Error starting drawing', error);
        return false;
    }
}

/**
 * Continue drawing operation
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Array} pixelData - Pixel data
 * @param {Object} context - Additional context
 * @returns {boolean} True if continued successfully
 */
export function continueDrawing(x, y, pixelData, context = {}) {
    if (!currentTool) {
        return false;
    }

    try {
        return currentTool.continueDrawing(x, y, pixelData, context);
    } catch (error) {
        logger.error?.('Error continuing drawing', error);
        return false;
    }
}

/**
 * End drawing operation
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Array} pixelData - Pixel data
 * @param {Object} context - Additional context
 * @returns {boolean} True if ended successfully
 */
export function endDrawing(x, y, pixelData, context = {}) {
    if (!currentTool) {
        return false;
    }

    try {
        return currentTool.endDrawing(x, y, pixelData, context);
    } catch (error) {
        logger.error?.('Error ending drawing', error);
        return false;
    }
}

/**
 * Cancel drawing operation
 */
export function cancelDrawing() {
    if (!currentTool) {
        return;
    }

    try {
        currentTool.cancelDrawing();
    } catch (error) {
        logger.error?.('Error canceling drawing', error);
    }
}

/**
 * Set selection bounds on current tool
 * @param {Object} bounds - Selection bounds {x1, y1, x2, y2}
 */
export function setSelection(bounds) {
    if (!currentTool) {
        return;
    }

    if (currentTool.setSelection) {
        currentTool.setSelection(bounds);
    }
}

/**
 * Clear selection on current tool
 */
export function clearSelection() {
    if (!currentTool) {
        return;
    }

    if (currentTool.clearSelection) {
        currentTool.clearSelection();
    }
}

/**
 * Check if current tool respects selection
 * @returns {boolean} True if respects selection
 */
export function respectsSelection() {
    if (!currentTool || !currentTool.respectsSelection) {
        return true;
    }

    return currentTool.respectsSelection();
}
