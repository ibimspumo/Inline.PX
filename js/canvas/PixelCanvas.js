/**
 * PixelCanvas - Main Canvas Controller (Refactored)
 *
 * Orchestrates all canvas sub-modules:
 * - PixelData: Data management
 * - CanvasRenderer: Rendering
 * - CanvasEvents: User interaction
 * - SelectionOverlay: Selection visualization
 *
 * Provides unified public API for backward compatibility
 *
 * @module PixelCanvas
 */

const PixelCanvas = (function() {
    'use strict';

    let canvasElement = null;
    let onChangeCallback = null;
    let constants = null;

    const logger = window.Logger || console;
    const eventBus = window.EventBus || null;

    // Sub-modules
    const pixelData = window.PixelData;
    const renderer = window.CanvasRenderer;
    const events = window.CanvasEvents;
    const selectionOverlay = window.SelectionOverlay;

    /**
     * Initialize the pixel canvas
     * @param {string} canvasId - ID of the canvas element
     * @param {number} width - Initial width
     * @param {number} height - Initial height
     * @param {Function} onChange - Change callback
     * @returns {Promise<void>}
     */
    async function init(canvasId, width = 16, height = 16, onChange = null) {
        try {
            logger.info?.('PixelCanvas initializing...');

            onChangeCallback = onChange;
            canvasElement = document.getElementById(canvasId);

            if (!canvasElement) {
                throw new Error(`Canvas element "${canvasId}" not found`);
            }

            // Load constants
            if (window.ConfigLoader) {
                constants = await window.ConfigLoader.loadConstants();
            }

            // Initialize sub-modules
            if (pixelData) {
                pixelData.init(width, height);
            } else {
                throw new Error('PixelData module not available');
            }

            if (renderer) {
                renderer.init(canvasElement, constants);
                renderer.updateCanvasSize(width, height);
            } else {
                throw new Error('CanvasRenderer module not available');
            }

            if (selectionOverlay) {
                selectionOverlay.init(canvasElement, {
                    renderer,
                    toolRegistry: window.ToolRegistry
                });
            }

            if (events) {
                events.init(canvasElement, {
                    renderer,
                    pixelData,
                    toolRegistry: window.ToolRegistry,
                    colorPalette: window.ColorPalette,
                    viewport: window.Viewport,
                    onChange: handleChange
                });
            } else {
                throw new Error('CanvasEvents module not available');
            }

            // Initial render
            render();
            updateSizeDisplay();

            logger.info?.(`PixelCanvas initialized: ${width}×${height}`);

            // Emit event
            if (eventBus) {
                eventBus.emit(eventBus.Events.CANVAS_RESIZED, { width, height });
            }

        } catch (error) {
            logger.error?.('PixelCanvas initialization failed', error);
            throw error;
        }
    }

    /**
     * Render canvas
     */
    function render() {
        if (renderer && pixelData) {
            renderer.render(pixelData.getData());
        }
    }

    /**
     * Clear canvas
     */
    function clear() {
        if (pixelData) {
            pixelData.clear();
            render();
            handleChange();

            if (eventBus) {
                eventBus.emit(eventBus.Events.CANVAS_CLEARED);
            }
        }
    }

    /**
     * Resize canvas
     * @param {number} newWidth - New width
     * @param {number} newHeight - New height
     * @returns {boolean} Success
     */
    function resize(newWidth, newHeight) {
        if (!pixelData || !renderer) {
            logger.error?.('Cannot resize: modules not initialized');
            return false;
        }

        const success = pixelData.resize(newWidth, newHeight);

        if (success) {
            renderer.updateCanvasSize(newWidth, newHeight);

            if (selectionOverlay) {
                selectionOverlay.updateSize();
            }

            render();
            updateSizeDisplay();
            handleChange();

            if (eventBus) {
                eventBus.emit(eventBus.Events.CANVAS_RESIZED, {
                    width: newWidth,
                    height: newHeight
                });
            }
        }

        return success;
    }

    /**
     * Export to Base64 string
     * @param {boolean} compress - Apply RLE compression
     * @returns {string} Export string
     */
    function exportToString(compress = false) {
        if (!pixelData) {
            logger.error?.('Cannot export: PixelData not initialized');
            return '';
        }

        return pixelData.exportToString(compress);
    }

    /**
     * Import from Base64 string
     * @param {string} str - Import string
     * @returns {boolean} Success
     */
    function importFromString(str) {
        if (!pixelData || !renderer) {
            logger.error?.('Cannot import: modules not initialized');
            return false;
        }

        const result = pixelData.importFromString(str);

        if (result.success) {
            const dims = pixelData.getDimensions();
            renderer.updateCanvasSize(dims.width, dims.height);

            if (selectionOverlay) {
                selectionOverlay.updateSize();
                selectionOverlay.clearSelection();
            }

            render();
            updateSizeDisplay();
            handleChange();

            if (eventBus) {
                eventBus.emit(eventBus.Events.FILE_LOADED, {
                    width: dims.width,
                    height: dims.height
                });
            }

            return true;
        } else {
            // Show error dialog
            if (window.Dialogs) {
                window.Dialogs.alert('Import Failed', result.error, 'error');
            } else {
                alert('Import failed: ' + result.error);
            }

            return false;
        }
    }

    /**
     * Get pixel data array
     * @returns {Array<Array<number>>} Pixel data
     */
    function getPixelData() {
        return pixelData ? pixelData.getData() : [];
    }

    /**
     * Get canvas dimensions
     * @returns {Object} {width, height}
     */
    function getDimensions() {
        return pixelData ? pixelData.getDimensions() : { width: 0, height: 0 };
    }

    /**
     * Clear selection overlay
     */
    function clearSelectionOverlay() {
        if (selectionOverlay) {
            selectionOverlay.clearSelection();
        }
    }

    /**
     * Get canvas statistics
     * @returns {Object} Statistics
     */
    function getStats() {
        return pixelData ? pixelData.getStats() : {};
    }

    /**
     * Update size display in UI
     * @private
     */
    function updateSizeDisplay() {
        if (!pixelData) return;

        const dims = pixelData.getDimensions();
        const sizeDisplay = document.getElementById('canvasSizeDisplay');

        if (sizeDisplay && window.FormatUtils) {
            sizeDisplay.textContent = window.FormatUtils.formatDimensions(dims.width, dims.height);
        } else if (sizeDisplay) {
            sizeDisplay.textContent = `${dims.width}×${dims.height}`;
        }
    }

    /**
     * Handle canvas change
     * @private
     */
    function handleChange() {
        if (onChangeCallback) {
            onChangeCallback();
        }

        // Update UI
        updateSizeDisplay();
    }

    /**
     * Set change callback
     * @param {Function} callback - Callback function
     */
    function setChangeCallback(callback) {
        onChangeCallback = callback;
        if (events) {
            events.setChangeCallback(callback);
        }
    }

    /**
     * Destroy canvas and cleanup
     */
    function destroy() {
        if (events) {
            events.destroy();
        }

        if (selectionOverlay) {
            selectionOverlay.destroy();
        }

        if (renderer) {
            renderer.clear();
        }

        logger.info?.('PixelCanvas destroyed');
    }

    // Public API (maintains backward compatibility)
    return {
        init,
        render,
        clear,
        resize,
        exportToString,
        importFromString,
        getPixelData,
        getDimensions,
        clearSelectionOverlay,
        getStats,
        setChangeCallback,
        destroy
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.PixelCanvas = PixelCanvas;
}
