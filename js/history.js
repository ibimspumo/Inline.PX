/**
 * History Module - Undo/Redo System
 *
 * Manages canvas history for undo/redo functionality.
 * Stores snapshots of canvas state with efficient memory management.
 */

import logger from './core/Logger.js';

// History stacks
let undoStack = [];
let redoStack = [];

// Settings
const MAX_HISTORY = 50; // Maximum number of undo states

// Callbacks
let onHistoryChange = null;

/**
 * Initialize history system
 * @param {Object} options - Configuration options
 */
function init(options = {}) {
    if (options.onHistoryChange) {
        onHistoryChange = options.onHistoryChange;
    }

    logger.info('History system initialized');
}

/**
 * Save current state to history
 * @param {string} dataString - Canvas data string (WxH:DATA)
 * @param {string} action - Description of action (optional)
 */
function pushState(dataString, action = 'Change') {
    if (!dataString) return;

    // Add to undo stack
    undoStack.push({
        data: dataString,
        action: action,
        timestamp: Date.now()
    });

    // Limit stack size
    if (undoStack.length > MAX_HISTORY) {
        undoStack.shift();
    }

    // Clear redo stack when new action is performed
    redoStack = [];

    notifyHistoryChange();
}

/**
 * Undo last action
 * @param {string} currentState - Current canvas state to save before undo
 * @returns {string|null} Previous state data or null if nothing to undo
 */
function undo(currentState) {
    if (undoStack.length === 0) {
        logger.debug('Nothing to undo');
        return null;
    }

    // Save current state to redo stack
    if (currentState) {
        redoStack.push({
            data: currentState,
            action: 'Redo point',
            timestamp: Date.now()
        });
    }

    // Get previous state
    const previousState = undoStack.pop();

    notifyHistoryChange();
    logger.info('Undo:', previousState.action);

    return previousState.data;
}

/**
 * Redo last undone action
 * @param {string} currentState - Current canvas state to save before redo
 * @returns {string|null} Next state data or null if nothing to redo
 */
function redo(currentState) {
    if (redoStack.length === 0) {
        logger.debug('Nothing to redo');
        return null;
    }

    // Save current state to undo stack
    if (currentState) {
        undoStack.push({
            data: currentState,
            action: 'Undo point',
            timestamp: Date.now()
        });
    }

    // Get next state
    const nextState = redoStack.pop();

    notifyHistoryChange();
    logger.info('Redo:', nextState.action);

    return nextState.data;
}

/**
 * Clear all history
 */
function clear() {
    undoStack = [];
    redoStack = [];
    notifyHistoryChange();
    logger.info('History cleared');
}

/**
 * Check if undo is available
 * @returns {boolean}
 */
function canUndo() {
    return undoStack.length > 0;
}

/**
 * Check if redo is available
 * @returns {boolean}
 */
function canRedo() {
    return redoStack.length > 0;
}

/**
 * Get history stats
 * @returns {Object}
 */
function getStats() {
    return {
        undoCount: undoStack.length,
        redoCount: redoStack.length,
        maxHistory: MAX_HISTORY
    };
}

/**
 * Notify listeners of history change
 */
function notifyHistoryChange() {
    if (onHistoryChange) {
        onHistoryChange({
            canUndo: canUndo(),
            canRedo: canRedo(),
            undoCount: undoStack.length,
            redoCount: redoStack.length
        });
    }
}

const History = {
    init,
    pushState,
    undo,
    redo,
    clear,
    canUndo,
    canRedo,
    getStats
};

export default History;
