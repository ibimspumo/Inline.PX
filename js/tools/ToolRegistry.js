/**
 * ToolRegistry - Dynamic Tool Management System
 *
 * Features:
 * - Automatic tool discovery and registration
 * - Tool lifecycle management (init, activate, deactivate)
 * - Tool switching with state preservation
 * - Event-driven architecture
 * - Singleton pattern for global access
 *
 * @module ToolRegistry
 */

import logger from '../core/Logger.js';
import BaseTool from './BaseTool.js';

    // Registry state
const tools = new Map(); // id -> tool instance
const toolOrder = []; // Ordered list of tool IDs
let currentTool = null;
let currentToolId = null;

    // Shared state across all tools
let sharedOptions = {
    brushSize: 1,
    shapeMode: 'fill',
    colorCode: 1
};

    // Callbacks
let onToolChangeCallback = null;
let onToolOptionChangeCallback = null;

/**
 * Initialize the tool registry
 * @param {Object} options - Initialization options
 */
function init(options = {}) {
    logger.info?.('ToolRegistry initializing...');

        // Set callbacks
    if (options.onToolChange) {
        onToolChangeCallback = options.onToolChange;
    }
    if (options.onToolOptionChange) {
        onToolOptionChangeCallback = options.onToolOptionChange;
    }

        // Set shared options
    if (options.sharedOptions) {
        sharedOptions = { ...sharedOptions, ...options.sharedOptions };
    }

    logger.info?.('ToolRegistry initialized');
}

/**
 * Register a tool class
 * @param {class} ToolClass - Tool class (extends BaseTool)
 * @returns {boolean} True if registered successfully
 */
function registerTool(ToolClass) {
    try {
            // Validate tool class
        if (!ToolClass || !ToolClass.CONFIG) {
            logger.error?.('Invalid tool class: missing CONFIG', ToolClass);
            return false;
        }

        const config = ToolClass.CONFIG;
        const id = config.id;

        if (!id) {
            logger.error?.('Tool class missing id in CONFIG', ToolClass);
            return false;
        }

            // Check for duplicates
        if (tools.has(id)) {
            logger.warn?.(`Tool "${id}" already registered, skipping`);
            return false;
        }

            // Create tool instance
        const toolInstance = new ToolClass();

            // Set callbacks
        toolInstance.setChangeCallback(() => {
            logger.debug?.(`Tool ${id} triggered change`);
        });

        toolInstance.setOptionChangeCallback((key, value, oldValue) => {
                // Update shared options
            if (sharedOptions.hasOwnProperty(key)) {
                sharedOptions[key] = value;
            }

                // Notify callback
            if (onToolOptionChangeCallback) {
                onToolOptionChangeCallback(key, value, oldValue);
            }
        });

            // Initialize tool
        toolInstance.init();

            // Register
        tools.set(id, toolInstance);
        toolOrder.push(id);

        logger.info?.(`Tool registered: ${config.name} (${id})`);
        return true;

    } catch (error) {
        logger.error?.('Failed to register tool', error);
        return false;
    }
}

/**
 * Register multiple tools at once
 * @param {Array<class>} toolClasses - Array of tool classes
 * @returns {number} Number of tools registered
 */
function registerTools(toolClasses) {
    let count = 0;
    toolClasses.forEach(ToolClass => {
        if (registerTool(ToolClass)) {
            count++;
        }
    });
    logger.info?.(`Registered ${count} tools`);
    return count;
}

/**
 * Unregister a tool
 * @param {string} id - Tool ID
 * @returns {boolean} True if unregistered successfully
 */
function unregisterTool(id) {
    const tool = tools.get(id);
    if (!tool) {
        logger.warn?.(`Tool "${id}" not found`);
        return false;
    }

        // Deactivate if current
    if (currentToolId === id) {
        tool.deactivate();
        currentTool = null;
        currentToolId = null;
    }

        // Destroy and remove
    tool.destroy();
    tools.delete(id);

    const index = toolOrder.indexOf(id);
    if (index > -1) {
        toolOrder.splice(index, 1);
    }

    logger.info?.(`Tool unregistered: ${id}`);
    return true;
}

/**
 * Set current tool by ID
 * @param {string} id - Tool ID
 * @returns {boolean} True if tool was activated
 */
function setCurrentTool(id) {
        // Check if tool exists
    const tool = tools.get(id);
    if (!tool) {
        logger.error?.(`Tool "${id}" not found`);
        return false;
    }

        // Same tool, ignore
    if (currentToolId === id) {
        logger.debug?.(`Tool "${id}" already active`);
        return true;
    }

        // Deactivate current tool
    if (currentTool) {
        currentTool.deactivate();
        logger.debug?.(`Deactivated tool: ${currentToolId}`);
    }

        // Activate new tool
    tool.activate();

        // Sync shared options to tool
    Object.keys(sharedOptions).forEach(key => {
        if (tool.options.hasOwnProperty(key)) {
            tool.setOption(key, sharedOptions[key]);
        }
    });

    currentTool = tool;
    currentToolId = id;

        // Notify callback
    if (onToolChangeCallback) {
        onToolChangeCallback(id, tool.getConfig());
    }

    logger.info?.(`Tool activated: ${tool.getName()} (${id})`);
    return true;
}

/**
 * Get current tool instance
 * @returns {BaseTool|null} Current tool
 */
function getCurrentTool() {
    return currentTool;
}

/**
 * Get current tool ID
 * @returns {string|null} Current tool ID
 */
function getCurrentToolId() {
    return currentToolId;
}

/**
 * Get tool by ID
 * @param {string} id - Tool ID
 * @returns {BaseTool|null} Tool instance
 */
function getTool(id) {
    return tools.get(id) || null;
}

/**
 * Get all registered tools
 * @returns {Array<Object>} Array of tool configs
 */
function getAllTools() {
    return toolOrder.map(id => {
        const tool = tools.get(id);
        return tool ? tool.getConfig() : null;
    }).filter(Boolean);
}

/**
 * Get tool by shortcut key
 * @param {string} key - Shortcut key (uppercase)
 * @returns {BaseTool|null} Tool instance
 */
function getToolByShortcut(key) {
    const upperKey = key.toUpperCase();
    for (const [id, tool] of tools) {
        if (tool.getConfig().shortcut === upperKey) {
            return tool;
        }
    }
    return null;
}

/**
 * Set tool option (applies to current tool and shared state)
 * @param {string} key - Option key
 * @param {*} value - Option value
 */
function setToolOption(key, value) {
        // Update shared options
    if (sharedOptions.hasOwnProperty(key)) {
        sharedOptions[key] = value;
    }

        // Update current tool
    if (currentTool) {
        currentTool.setOption(key, value);
    }
}

/**
 * Get tool option
 * @param {string} key - Option key
 * @returns {*} Option value
 */
function getToolOption(key) {
    if (currentTool) {
        return currentTool.getOption(key);
    }
    return sharedOptions[key];
}

/**
 * Get all shared options
 * @returns {Object} Shared options
 */
function getSharedOptions() {
    return { ...sharedOptions };
}

    // ==================== DRAWING DELEGATION ====================

/**
 * Start drawing with current tool
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Array<Array<number>>} pixelData - Pixel data
 * @param {Object} context - Drawing context
 * @returns {boolean} True if drawing started
 */
function startDrawing(x, y, pixelData, context = {}) {
    if (!currentTool) {
        logger.warn?.('No tool active, cannot start drawing');
        return false;
    }

        // Inject shared options into context
    context.brushSize = sharedOptions.brushSize;
    context.shapeMode = sharedOptions.shapeMode;
    context.colorCode = sharedOptions.colorCode;

    return currentTool.startDrawing(x, y, pixelData, context);
}

/**
 * Continue drawing with current tool
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Array<Array<number>>} pixelData - Pixel data
 * @param {Object} context - Drawing context
 * @returns {boolean} True if data was modified
 */
function continueDrawing(x, y, pixelData, context = {}) {
    if (!currentTool) {
        return false;
    }

    context.brushSize = sharedOptions.brushSize;
    context.shapeMode = sharedOptions.shapeMode;
    context.colorCode = sharedOptions.colorCode;

    return currentTool.continueDrawing(x, y, pixelData, context);
}

/**
 * End drawing with current tool
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Array<Array<number>>} pixelData - Pixel data
 * @param {Object} context - Drawing context
 * @returns {boolean} True if data was modified
 */
function endDrawing(x, y, pixelData, context = {}) {
    if (!currentTool) {
        return false;
    }

    context.brushSize = sharedOptions.brushSize;
    context.shapeMode = sharedOptions.shapeMode;
    context.colorCode = sharedOptions.colorCode;

    return currentTool.endDrawing(x, y, pixelData, context);
}

/**
 * Cancel drawing with current tool
 */
function cancelDrawing() {
    if (currentTool) {
        currentTool.cancelDrawing();
    }
}

    // ==================== SELECTION SUPPORT ====================

/**
 * Set selection for current tool
 * @param {Object} bounds - Selection bounds {x1, y1, x2, y2}
 */
function setSelection(bounds) {
    if (currentTool) {
        currentTool.setSelection(bounds);
    }
}

/**
 * Clear selection for current tool
 */
function clearSelection() {
    if (currentTool) {
        currentTool.clearSelection();
    }
}

/**
 * Check if current tool respects selection
 * @returns {boolean}
 */
function respectsSelection() {
    return currentTool ? currentTool.respectsSelection() : true;
}

    // ==================== UTILITIES ====================

/**
 * Check if a tool is registered
 * @param {string} id - Tool ID
 * @returns {boolean}
 */
function hasTool(id) {
    return tools.has(id);
}

/**
 * Get number of registered tools
 * @returns {number}
 */
function getToolCount() {
    return tools.size;
}

/**
 * Clear all tools (for cleanup/reset)
 */
function clearAll() {
        // Deactivate current
    if (currentTool) {
        currentTool.deactivate();
    }

        // Destroy all
    tools.forEach(tool => tool.destroy());

        // Clear
    tools.clear();
    toolOrder.length = 0;
    currentTool = null;
    currentToolId = null;

    logger.info?.('All tools cleared');
}

/**
 * Get registry statistics
 * @returns {Object} Statistics
 */
function getStats() {
    return {
        totalTools: tools.size,
        currentTool: currentToolId,
        toolOrder: [...toolOrder],
        sharedOptions: { ...sharedOptions }
    };
}

const ToolRegistry = {
    init,
    registerTool,
    registerTools,
    unregisterTool,
    setCurrentTool,
    getCurrentTool,
    getCurrentToolId,
    getTool,
    getAllTools,
    getToolByShortcut,
    setToolOption,
    getToolOption,
    getSharedOptions,
    startDrawing,
    continueDrawing,
    endDrawing,
    cancelDrawing,
    setSelection,
    clearSelection,
    respectsSelection,
    hasTool,
    getToolCount,
    clearAll,
    getStats
};

export default ToolRegistry;
