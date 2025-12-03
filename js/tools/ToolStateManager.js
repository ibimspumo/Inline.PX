/**
 * ToolStateManager - Manages shared state across tools
 *
 * Handles:
 * - Shared tool options (brushSize, shapeMode, colorCode)
 * - Option synchronization across tools
 * - Option change notifications
 *
 * @module ToolStateManager
 *
 * @typedef {import('../types.js').ToolOptions} ToolOptions
 */

import logger from '../core/Logger.js';

// Shared state across all tools
let sharedOptions = {
    brushSize: 1,
    shapeMode: 'fill',
    colorCode: 1
};

// Callbacks
let onToolOptionChangeCallback = null;

/**
 * Initialize state manager
 * @param {Object} initialOptions - Initial shared options
 * @param {Function} onOptionChange - Callback for option changes
 */
export function initStateManager(initialOptions = {}, onOptionChange = null) {
    sharedOptions = { ...sharedOptions, ...initialOptions };
    onToolOptionChangeCallback = onOptionChange;
    logger.debug?.('ToolStateManager initialized');
}

/**
 * Set a tool option
 * @param {string} key - Option key
 * @param {*} value - Option value
 */
export function setToolOption(key, value) {
    if (!sharedOptions.hasOwnProperty(key)) {
        logger.warn?.(`Unknown tool option: ${key}`);
        return;
    }

    const oldValue = sharedOptions[key];
    sharedOptions[key] = value;

    logger.debug?.(`Tool option changed: ${key} = ${value}`);

    // Notify callback
    if (onToolOptionChangeCallback) {
        onToolOptionChangeCallback(key, value, oldValue);
    }
}

/**
 * Get a tool option
 * @param {string} key - Option key
 * @returns {*} Option value
 */
export function getToolOption(key) {
    return sharedOptions[key];
}

/**
 * Get all shared options
 * @returns {Object} Shared options
 */
export function getSharedOptions() {
    return { ...sharedOptions };
}

/**
 * Sync options to a tool instance
 * @param {Object} tool - Tool instance
 */
export function syncOptionsToTool(tool) {
    Object.keys(sharedOptions).forEach(key => {
        tool.setOption(key, sharedOptions[key]);
    });
}

/**
 * Handle option change from a tool
 * @param {string} key - Option key
 * @param {*} value - New value
 * @param {*} oldValue - Old value
 */
export function handleToolOptionChange(key, value, oldValue) {
    // Update shared options if it's a shared option
    if (sharedOptions.hasOwnProperty(key)) {
        sharedOptions[key] = value;
    }

    // Notify callback
    if (onToolOptionChangeCallback) {
        onToolOptionChangeCallback(key, value, oldValue);
    }
}
