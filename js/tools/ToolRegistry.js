/**
 * ToolRegistry - Dynamic Tool Management System (Refactored)
 *
 * Features:
 * - Tool registration and lifecycle management
 * - Tool switching with state preservation
 * - Event-driven architecture
 * - Delegates drawing to ToolDrawingProxy
 * - Delegates state to ToolStateManager
 *
 * @module ToolRegistry
 *
 * @typedef {import('../types.js').ToolConfig} ToolConfig
 * @typedef {import('../types.js').ToolOptions} ToolOptions
 * @typedef {import('../types.js').DrawingContext} DrawingContext
 * @typedef {import('../types.js').SelectionBounds} SelectionBounds
 * @typedef {import('../types.js').PixelData} PixelData
 */

import logger from '../core/Logger.js';
import BaseTool from './BaseTool.js';
import * as StateManager from './ToolStateManager.js';
import * as DrawingProxy from './ToolDrawingProxy.js';

// Registry state
/** @type {Map<string, BaseTool>} */
const tools = new Map(); // id -> tool instance
/** @type {Array<string>} */
const toolOrder = []; // Ordered list of tool IDs
/** @type {BaseTool|null} */
let currentTool = null;
/** @type {string|null} */
let currentToolId = null;

// Callbacks
let onToolChangeCallback = null;

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

    // Initialize state manager
    StateManager.initStateManager(
        options.sharedOptions,
        options.onToolOptionChange
    );

    logger.info?.('ToolRegistry initialized');
}

/**
 * Register a tool class
 * @param {typeof BaseTool} ToolClass - Tool class (extends BaseTool)
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
            StateManager.handleToolOptionChange(key, value, oldValue);
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
 * @param {Array<typeof BaseTool>} toolClasses - Array of tool classes
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
        DrawingProxy.setCurrentToolForDrawing(null);
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
 * @returns {boolean} True if set successfully
 */
function setCurrentTool(id) {
    const tool = tools.get(id);
    if (!tool) {
        logger.warn?.(`Tool "${id}" not found`);
        return false;
    }

    // Deactivate current tool
    if (currentTool && currentTool !== tool) {
        currentTool.deactivate();
    }

    // Activate new tool
    currentTool = tool;
    currentToolId = id;
    currentTool.activate();

    // Sync shared options to tool
    StateManager.syncOptionsToTool(currentTool);

    // Update drawing proxy
    DrawingProxy.setCurrentToolForDrawing(currentTool);

    // Notify callback
    if (onToolChangeCallback) {
        onToolChangeCallback(id, tool);
    }

    logger.info?.(`Current tool set: ${id}`);
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
 * @returns {Array<ToolConfig>} Array of tool configs
 */
function getAllTools() {
    return toolOrder.map(id => {
        const tool = tools.get(id);
        return tool ? tool.getConfig() : null;
    }).filter(config => config !== null);
}

/**
 * Get tool by keyboard shortcut
 * @param {string} key - Keyboard key
 * @returns {BaseTool|null} Tool instance
 */
function getToolByShortcut(key) {
    const upperKey = key.toUpperCase();
    for (const [id, tool] of tools) {
        const config = tool.getConfig();
        if (config.shortcut === upperKey) {
            return tool;
        }
    }
    return null;
}

/**
 * Check if tool is registered
 * @param {string} id - Tool ID
 * @returns {boolean} True if registered
 */
function hasTool(id) {
    return tools.has(id);
}

/**
 * Get tool count
 * @returns {number} Number of registered tools
 */
function getToolCount() {
    return tools.size;
}

/**
 * Clear all tools
 */
function clearAll() {
    // Deactivate current tool
    if (currentTool) {
        currentTool.deactivate();
    }

    // Destroy all tools
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
        currentToolId: currentToolId,
        toolIds: [...toolOrder]
    };
}

// Export registry interface
const ToolRegistry = {
    // Core
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
    hasTool,
    getToolCount,
    clearAll,
    getStats,

    // State management (delegated)
    setToolOption: StateManager.setToolOption,
    getToolOption: StateManager.getToolOption,
    getSharedOptions: StateManager.getSharedOptions,

    // Drawing operations (delegated)
    startDrawing: DrawingProxy.startDrawing,
    continueDrawing: DrawingProxy.continueDrawing,
    endDrawing: DrawingProxy.endDrawing,
    cancelDrawing: DrawingProxy.cancelDrawing,
    setSelection: DrawingProxy.setSelection,
    clearSelection: DrawingProxy.clearSelection,
    respectsSelection: DrawingProxy.respectsSelection
};

export default ToolRegistry;
