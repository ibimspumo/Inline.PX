/**
 * BaseTool - Abstract Base Class for All Drawing Tools
 *
 * Provides a comprehensive framework for implementing drawing tools with:
 * - Lifecycle hooks (init, activate, deactivate, destroy)
 * - Drawing phases (start, continue, end, cancel)
 * - State management (tool options, history, undo/redo)
 * - Event handling (mouse, keyboard, touch)
 * - Preview system for shape tools
 * - Selection integration
 * - Custom cursors and UI updates
 * - Validation and error handling
 * - Performance optimization (debouncing, throttling)
 *
 * @abstract
 * @class BaseTool
 */

import logger from '../core/Logger.js';

class BaseTool {
    /**
     * Tool configuration - MUST be overridden by subclasses
     * @static
     * @type {Object}
     * @property {string} id - Unique tool identifier (lowercase, no spaces)
     * @property {string} name - Display name
     * @property {string} icon - Material Symbol icon name
     * @property {string} shortcut - Keyboard shortcut (single uppercase letter)
     * @property {string} cursor - CSS cursor style
     * @property {boolean} hasSizeOption - Shows brush size UI
     * @property {boolean} hasShapeOption - Shows fill/stroke UI
     * @property {string} description - Tool description for tooltips
     * @property {string} category - Tool category (drawing, shape, selection, navigation)
     */
    static CONFIG = {
        id: 'base-tool',
        name: 'Base Tool',
        icon: 'tool',
        shortcut: '',
        cursor: 'default',
        hasSizeOption: false,
        hasShapeOption: false,
        description: 'Base tool class',
        category: 'other'
    };

    /**
     * Default tool options - can be overridden
     * @static
     */
    static DEFAULT_OPTIONS = {
        brushSize: 1,
        shapeMode: 'fill', // 'fill' or 'stroke'
        opacity: 1.0,
        antiAlias: false,
        snapToGrid: false,
        constrainProportions: false // Shift key behavior
    };

    /**
     * Constructor
     */
    constructor() {
        // Prevent direct instantiation of base class
        if (new.target === BaseTool) {
            throw new Error('BaseTool is abstract and cannot be instantiated directly');
        }

        // Validate CONFIG override
        const config = this.constructor.CONFIG;
        if (!config || config.id === 'base-tool') {
            throw new Error(`${this.constructor.name} must override static CONFIG property`);
        }

        // Initialize state
        this.isActive = false;
        this.isDrawing = false;
        this.options = { ...this.constructor.DEFAULT_OPTIONS };

        // Drawing state
        this.startX = 0;
        this.startY = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.previewData = null;

        // Selection state
        this.selectionActive = false;
        this.selectionBounds = null;

        // Performance optimization
        this.throttleDelay = 16; // ~60fps
        this.lastThrottleTime = 0;

        // Event handlers (bound for proper cleanup)
        this.boundHandlers = {};

        // Callbacks
        this.onChangeCallback = null;
        this.onOptionChangeCallback = null;

        // History/undo integration
        this.actionHistory = [];

        // Logger reference
        this.logger = logger;

        this.logger.debug?.(`${this.constructor.CONFIG.name} tool created`);
    }

    // ==================== LIFECYCLE HOOKS ====================

    /**
     * Initialize tool - called once when tool is registered
     * Override to setup resources, load assets, etc.
     */
    init() {
        this.logger.debug?.(`${this.getName()} tool initialized`);
    }

    /**
     * Activate tool - called when tool is selected
     * Override to setup event listeners, show UI, etc.
     */
    activate() {
        this.isActive = true;
        this.logger.info?.(`${this.getName()} tool activated`);
    }

    /**
     * Deactivate tool - called when switching to another tool
     * Override to cleanup, hide UI, save state, etc.
     */
    deactivate() {
        this.isActive = false;
        this.cancelDrawing();
        this.logger.info?.(`${this.getName()} tool deactivated`);
    }

    /**
     * Destroy tool - called when tool is unregistered
     * Override to cleanup resources, remove listeners, etc.
     */
    destroy() {
        this.removeAllEventListeners();
        this.previewData = null;
        this.logger.debug?.(`${this.getName()} tool destroyed`);
    }

    // ==================== DRAWING LIFECYCLE ====================

    /**
     * Start drawing operation
     * @param {number} x - X coordinate (pixel grid)
     * @param {number} y - Y coordinate (pixel grid)
     * @param {Array<Array<number>>} pixelData - 2D array of color indices
     * @param {Object} context - Drawing context (colorCode, modifiers, etc.)
     * @returns {boolean} True if drawing started successfully
     */
    startDrawing(x, y, pixelData, context = {}) {
        if (!this.isActive) {
            this.logger.warn?.(`Cannot start drawing: ${this.getName()} is not active`);
            return false;
        }

        if (!this.validateCoordinates(x, y, pixelData)) {
            this.logger.warn?.(`Invalid coordinates: (${x}, ${y})`);
            return false;
        }

        this.isDrawing = true;
        this.startX = x;
        this.startY = y;
        this.lastX = x;
        this.lastY = y;

        // Save preview data for tools that need it
        if (this.needsPreview()) {
            this.previewData = this.clonePixelData(pixelData);
        }

        // Tool-specific implementation
        return this.onDrawStart(x, y, pixelData, context);
    }

    /**
     * Continue drawing operation (mouse/touch move)
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Array<Array<number>>} pixelData - Pixel data
     * @param {Object} context - Drawing context
     * @returns {boolean} True if data was modified
     */
    continueDrawing(x, y, pixelData, context = {}) {
        if (!this.isDrawing) {
            return false;
        }

        if (!this.validateCoordinates(x, y, pixelData)) {
            return false;
        }

        // Throttle for performance
        if (this.shouldThrottle()) {
            return false;
        }

        this.lastX = x;
        this.lastY = y;

        // Tool-specific implementation
        return this.onDrawContinue(x, y, pixelData, context);
    }

    /**
     * End drawing operation (mouse/touch up)
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Array<Array<number>>} pixelData - Pixel data
     * @param {Object} context - Drawing context
     * @returns {boolean} True if data was modified
     */
    endDrawing(x, y, pixelData, context = {}) {
        if (!this.isDrawing) {
            return false;
        }

        this.isDrawing = false;

        if (!this.validateCoordinates(x, y, pixelData)) {
            // Use last valid coordinates
            x = this.lastX;
            y = this.lastY;
        }

        // Tool-specific implementation
        const modified = this.onDrawEnd(x, y, pixelData, context);

        // Cleanup
        this.previewData = null;
        this.lastThrottleTime = 0;

        return modified;
    }

    /**
     * Cancel drawing operation (Escape key, context loss, etc.)
     */
    cancelDrawing() {
        if (this.isDrawing) {
            this.isDrawing = false;
            this.previewData = null;
            this.onDrawCancel();
            this.logger.debug?.(`${this.getName()} drawing cancelled`);
        }
    }

    // ==================== TOOL-SPECIFIC IMPLEMENTATIONS ====================
    // Subclasses MUST override these methods

    /**
     * Handle draw start - implement tool-specific logic
     * @abstract
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Array<Array<number>>} pixelData - Pixel data
     * @param {Object} context - Drawing context
     * @returns {boolean} True if drawing started successfully
     */
    onDrawStart(x, y, pixelData, context) {
        throw new Error(`${this.constructor.name} must implement onDrawStart()`);
    }

    /**
     * Handle draw continue - implement tool-specific logic
     * @abstract
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Array<Array<number>>} pixelData - Pixel data
     * @param {Object} context - Drawing context
     * @returns {boolean} True if data was modified
     */
    onDrawContinue(x, y, pixelData, context) {
        throw new Error(`${this.constructor.name} must implement onDrawContinue()`);
    }

    /**
     * Handle draw end - implement tool-specific logic
     * @abstract
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Array<Array<number>>} pixelData - Pixel data
     * @param {Object} context - Drawing context
     * @returns {boolean} True if data was modified
     */
    onDrawEnd(x, y, pixelData, context) {
        throw new Error(`${this.constructor.name} must implement onDrawEnd()`);
    }

    /**
     * Handle draw cancel - cleanup tool-specific state
     * Optional override
     */
    onDrawCancel() {
        // Optional override
    }

    // ==================== TOOL OPTIONS ====================

    /**
     * Set tool option
     * @param {string} key - Option key
     * @param {*} value - Option value
     */
    setOption(key, value) {
        if (this.options.hasOwnProperty(key)) {
            const oldValue = this.options[key];
            this.options[key] = value;
            this.onOptionChanged(key, value, oldValue);

            if (this.onOptionChangeCallback) {
                this.onOptionChangeCallback(key, value, oldValue);
            }
        } else {
            this.logger.warn?.(`Unknown option: ${key}`);
        }
    }

    /**
     * Get tool option
     * @param {string} key - Option key
     * @returns {*} Option value
     */
    getOption(key) {
        return this.options[key];
    }

    /**
     * Get all options
     * @returns {Object} All options
     */
    getAllOptions() {
        return { ...this.options };
    }

    /**
     * Reset options to defaults
     */
    resetOptions() {
        this.options = { ...this.constructor.DEFAULT_OPTIONS };
        this.onOptionsReset();
    }

    /**
     * Handle option change - override for custom behavior
     * @param {string} key - Option key
     * @param {*} newValue - New value
     * @param {*} oldValue - Old value
     */
    onOptionChanged(key, newValue, oldValue) {
        this.logger.debug?.(`${this.getName()} option changed: ${key} = ${newValue}`);
    }

    /**
     * Handle options reset - override for custom behavior
     */
    onOptionsReset() {
        // Optional override
    }

    // ==================== HELPER METHODS ====================

    /**
     * Check if tool needs preview mode (for shape tools)
     * @returns {boolean}
     */
    needsPreview() {
        return false; // Override in subclasses that need preview
    }

    /**
     * Validate coordinates are within bounds
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Array<Array<number>>} pixelData - Pixel data
     * @returns {boolean}
     */
    validateCoordinates(x, y, pixelData) {
        if (!pixelData || pixelData.length === 0) {
            return false;
        }
        const height = pixelData.length;
        const width = pixelData[0].length;
        return x >= 0 && x < width && y >= 0 && y < height;
    }

    /**
     * Clone pixel data for preview
     * @param {Array<Array<number>>} pixelData - Original data
     * @returns {Array<Array<number>>} Cloned data
     */
    clonePixelData(pixelData) {
        return pixelData.map(row => [...row]);
    }

    /**
     * Restore preview data
     * @param {Array<Array<number>>} pixelData - Target data
     */
    restorePreviewData(pixelData) {
        if (!this.previewData) {
            return;
        }
        for (let y = 0; y < pixelData.length; y++) {
            for (let x = 0; x < pixelData[y].length; x++) {
                pixelData[y][x] = this.previewData[y][x];
            }
        }
    }

    /**
     * Check if should throttle (performance optimization)
     * @returns {boolean}
     */
    shouldThrottle() {
        const now = Date.now();
        if (now - this.lastThrottleTime < this.throttleDelay) {
            return true;
        }
        this.lastThrottleTime = now;
        return false;
    }

    /**
     * Set pixel at coordinates
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Array<Array<number>>} pixelData - Pixel data
     * @param {number} colorCode - Color code
     * @returns {boolean} True if pixel was changed
     */
    setPixel(x, y, pixelData, colorCode) {
        const height = pixelData.length;
        const width = pixelData[0].length;

        if (x >= 0 && x < width && y >= 0 && y < height) {
            if (pixelData[y][x] !== colorCode) {
                pixelData[y][x] = colorCode;
                return true;
            }
        }
        return false;
    }

    /**
     * Get pixel at coordinates
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @param {Array<Array<number>>} pixelData - Pixel data
     * @returns {number|null} Color code or null
     */
    getPixel(x, y, pixelData) {
        const height = pixelData.length;
        const width = pixelData[0].length;

        if (x >= 0 && x < width && y >= 0 && y < height) {
            return pixelData[y][x];
        }
        return null;
    }

    // ==================== EVENT HANDLING ====================

    /**
     * Add event listener with automatic cleanup tracking
     * @param {EventTarget} target - Event target
     * @param {string} event - Event name
     * @param {Function} handler - Event handler
     */
    addEventListener(target, event, handler) {
        const boundHandler = handler.bind(this);
        target.addEventListener(event, boundHandler);

        const key = `${event}_${Date.now()}`;
        this.boundHandlers[key] = { target, event, handler: boundHandler };
    }

    /**
     * Remove all event listeners
     */
    removeAllEventListeners() {
        Object.values(this.boundHandlers).forEach(({ target, event, handler }) => {
            target.removeEventListener(event, handler);
        });
        this.boundHandlers = {};
    }

    // ==================== SELECTION SUPPORT ====================

    /**
     * Check if tool respects selection bounds
     * @returns {boolean}
     */
    respectsSelection() {
        return true; // Override to return false for tools that ignore selection
    }

    /**
     * Check if coordinates are within selection
     * @param {number} x - X coordinate
     * @param {number} y - Y coordinate
     * @returns {boolean}
     */
    isInSelection(x, y) {
        if (!this.selectionActive || !this.selectionBounds) {
            return true; // No selection = everything is valid
        }

        const { x1, y1, x2, y2 } = this.selectionBounds;
        return x >= x1 && x <= x2 && y >= y1 && y <= y2;
    }

    /**
     * Set selection bounds
     * @param {Object} bounds - Selection bounds {x1, y1, x2, y2}
     */
    setSelection(bounds) {
        this.selectionActive = true;
        this.selectionBounds = bounds;
    }

    /**
     * Clear selection
     */
    clearSelection() {
        this.selectionActive = false;
        this.selectionBounds = null;
    }

    // ==================== GETTERS ====================

    /**
     * Get tool ID
     * @returns {string}
     */
    getId() {
        return this.constructor.CONFIG.id;
    }

    /**
     * Get tool name
     * @returns {string}
     */
    getName() {
        return this.constructor.CONFIG.name;
    }

    /**
     * Get tool config
     * @returns {Object}
     */
    getConfig() {
        return { ...this.constructor.CONFIG };
    }

    /**
     * Get tool cursor
     * @returns {string}
     */
    getCursor() {
        return this.constructor.CONFIG.cursor;
    }

    /**
     * Check if tool has size option
     * @returns {boolean}
     */
    hasSizeOption() {
        return this.constructor.CONFIG.hasSizeOption;
    }

    /**
     * Check if tool has shape option
     * @returns {boolean}
     */
    hasShapeOption() {
        return this.constructor.CONFIG.hasShapeOption;
    }

    // ==================== CALLBACKS ====================

    /**
     * Set change callback
     * @param {Function} callback - Callback function
     */
    setChangeCallback(callback) {
        this.onChangeCallback = callback;
    }

    /**
     * Set option change callback
     * @param {Function} callback - Callback function
     */
    setOptionChangeCallback(callback) {
        this.onOptionChangeCallback = callback;
    }

    /**
     * Trigger change callback
     */
    triggerChange() {
        if (this.onChangeCallback) {
            this.onChangeCallback();
        }
    }
}

export default BaseTool;
