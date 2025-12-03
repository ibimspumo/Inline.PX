/**
 * CanvasEvents - Canvas Event Handler
 *
 * Manages user interaction with the canvas:
 * - Mouse and touch event handling
 * - Coordinate translation
 * - Tool integration
 * - Drawing state management
 *
 * @module CanvasEvents
 */

const CanvasEvents = (function() {
    'use strict';

    let canvas = null;
    let renderer = null;
    let pixelData = null;
    let toolRegistry = null;
    let colorPalette = null;
    let viewport = null;

    let onChangeCallback = null;
    let isDrawing = false;

    const logger = window.Logger || console;
    const eventBus = window.EventBus || null;

    /**
     * Initialize event handler
     * @param {HTMLCanvasElement} canvasElement - Canvas element
     * @param {Object} dependencies - Module dependencies
     */
    function init(canvasElement, dependencies = {}) {
        canvas = canvasElement;
        renderer = dependencies.renderer || window.CanvasRenderer;
        pixelData = dependencies.pixelData || window.PixelData;
        toolRegistry = dependencies.toolRegistry || window.ToolRegistry;
        colorPalette = dependencies.colorPalette || window.ColorPalette;
        viewport = dependencies.viewport || window.Viewport;
        onChangeCallback = dependencies.onChange || null;

        setupEventListeners();
        logger.debug?.('CanvasEvents initialized');
    }

    /**
     * Setup event listeners
     * @private
     */
    function setupEventListeners() {
        // Mouse events
        canvas.addEventListener('mousedown', handleMouseDown);
        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseUp);

        // Touch events
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleTouchEnd);
        canvas.addEventListener('touchcancel', handleTouchEnd);

        // Prevent context menu
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());

        logger.debug?.('Canvas event listeners registered');
    }

    /**
     * Handle mouse down
     * @private
     */
    function handleMouseDown(e) {
        if (!toolRegistry || !pixelData) return;

        const coords = getPixelCoordinates(e);
        if (!coords) return;

        const data = pixelData.getData();
        const colorIndex = colorPalette ? colorPalette.getCurrentColorIndex() : 1;

        const context = {
            colorCode: colorIndex,
            event: e
        };

        isDrawing = true;
        toolRegistry.startDrawing(coords.x, coords.y, data, context);

        // Immediate draw for continuous tools
        const toolId = toolRegistry.getCurrentToolId();
        if (['brush', 'pencil', 'eraser'].includes(toolId)) {
            if (toolRegistry.continueDrawing(coords.x, coords.y, data, context)) {
                triggerRender();
                triggerChange();
            }
        }
    }

    /**
     * Handle mouse move
     * @private
     */
    function handleMouseMove(e) {
        if (!toolRegistry || !pixelData) return;

        const coords = getPixelCoordinates(e);
        if (!coords) return;

        const data = pixelData.getData();
        const colorIndex = colorPalette ? colorPalette.getCurrentColorIndex() : 1;

        const context = {
            colorCode: colorIndex,
            event: e,
            onSelectionChange: handleSelectionChange
        };

        if (toolRegistry.continueDrawing(coords.x, coords.y, data, context)) {
            triggerRender();
            triggerChange();
        }

        // Update selection preview for select tool
        const toolId = toolRegistry.getCurrentToolId();
        if (toolId === 'select' && window.SelectionOverlay) {
            window.SelectionOverlay.renderPreview(coords.x, coords.y);
        }
    }

    /**
     * Handle mouse up
     * @private
     */
    function handleMouseUp(e) {
        if (!isDrawing || !toolRegistry || !pixelData) {
            isDrawing = false;
            return;
        }

        isDrawing = false;

        const coords = getPixelCoordinates(e);
        const data = pixelData.getData();
        const colorIndex = colorPalette ? colorPalette.getCurrentColorIndex() : 1;

        const context = {
            colorCode: colorIndex,
            event: e,
            onSelectionChange: handleSelectionChange
        };

        let modified = false;
        if (coords) {
            modified = toolRegistry.endDrawing(coords.x, coords.y, data, context);
        } else {
            // Mouse left canvas - use invalid coords to signal end
            modified = toolRegistry.endDrawing(-1, -1, data, context);
        }

        if (modified) {
            triggerRender();
            triggerChange();
        }

        // Update selection overlay for select tool
        const toolId = toolRegistry.getCurrentToolId();
        if (toolId === 'select' && window.SelectionOverlay) {
            window.SelectionOverlay.renderPreview();
        }
    }

    /**
     * Handle touch start
     * @private
     */
    function handleTouchStart(e) {
        e.preventDefault();

        if (e.touches.length === 0) return;

        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY,
            bubbles: true
        });

        handleMouseDown(mouseEvent);
    }

    /**
     * Handle touch move
     * @private
     */
    function handleTouchMove(e) {
        e.preventDefault();

        if (e.touches.length === 0) return;

        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY,
            bubbles: true
        });

        handleMouseMove(mouseEvent);
    }

    /**
     * Handle touch end
     * @private
     */
    function handleTouchEnd(e) {
        e.preventDefault();

        const mouseEvent = new MouseEvent('mouseup', {
            bubbles: true
        });

        handleMouseUp(mouseEvent);
    }

    /**
     * Get pixel coordinates from mouse/touch event
     * @private
     * @param {MouseEvent} e - Mouse event
     * @returns {Object|null} {x, y} or null
     */
    function getPixelCoordinates(e) {
        if (!renderer || !pixelData) return null;

        const dims = pixelData.getDimensions();
        const zoom = viewport ? viewport.getZoom() : 1.0;

        return renderer.screenToPixelCoords(
            e.clientX,
            e.clientY,
            dims.width,
            dims.height,
            zoom
        );
    }

    /**
     * Handle selection change callback
     * @private
     */
    function handleSelectionChange(bounds) {
        if (window.SelectionOverlay) {
            window.SelectionOverlay.setSelection(bounds);
            window.SelectionOverlay.renderPreview();
        }

        // Emit event
        if (eventBus) {
            eventBus.emit(eventBus.Events.SELECTION_CHANGED, bounds);
        }
    }

    /**
     * Trigger canvas render
     * @private
     */
    function triggerRender() {
        if (renderer && pixelData) {
            renderer.render(pixelData.getData());
        }
    }

    /**
     * Trigger change callback
     * @private
     */
    function triggerChange() {
        if (onChangeCallback) {
            onChangeCallback();
        }

        // Emit event
        if (eventBus) {
            eventBus.emit(eventBus.Events.CANVAS_CHANGED);
        }
    }

    /**
     * Set change callback
     * @param {Function} callback - Callback function
     */
    function setChangeCallback(callback) {
        onChangeCallback = callback;
    }

    /**
     * Remove all event listeners
     */
    function destroy() {
        if (!canvas) return;

        canvas.removeEventListener('mousedown', handleMouseDown);
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseup', handleMouseUp);
        canvas.removeEventListener('mouseleave', handleMouseUp);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
        canvas.removeEventListener('touchcancel', handleTouchEnd);
        canvas.removeEventListener('contextmenu', (e) => e.preventDefault());

        logger.debug?.('CanvasEvents destroyed');
    }

    // Public API
    return {
        init,
        setChangeCallback,
        destroy
    };
})();

if (typeof window !== 'undefined') {
    window.CanvasEvents = CanvasEvents;
}
