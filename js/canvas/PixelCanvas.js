/**
 * PixelCanvas - Main Canvas Controller (Refactored)
 *
 * Orchestrates all canvas sub-modules and runs the main render loop.
 * - PixelData: Data management
 * - CanvasRenderer: Rendering
 * - CanvasEvents: User interaction
 * - SelectionOverlay: Selection visualization
 *
 * @module PixelCanvas
 */

const PixelCanvas = (function() {
    'use strict';

    let canvasElement = null;
    let onChangeCallback = null;
    let constants = null;
    let toolRegistry = null;

    let renderLoopId = null;
    let dashOffset = 0;

    const logger = window.Logger || console;
    const eventBus = window.EventBus || null;

    // Sub-modules
    const pixelData = window.PixelData;
    const renderer = window.CanvasRenderer;
    const events = window.CanvasEvents;
    const selectionOverlay = window.SelectionOverlay;

    async function init(canvasId, width = 16, height = 16, onChange = null) {
        try {
            logger.info?.('PixelCanvas initializing...');
            onChangeCallback = onChange;
            canvasElement = document.getElementById(canvasId);
            toolRegistry = window.ToolRegistry;

            if (!canvasElement) throw new Error(`Canvas element "${canvasId}" not found`);

            constants = window.ConfigLoader ? await window.ConfigLoader.loadConstants() : {};

            if (!pixelData) throw new Error('PixelData module not available');
            pixelData.init(width, height);

            if (!renderer) throw new Error('CanvasRenderer module not available');
            renderer.init(canvasElement, constants);
            renderer.updateCanvasSize(width, height);

            if (selectionOverlay) {
                selectionOverlay.init(canvasElement, { renderer });
            }

            if (!events) throw new Error('CanvasEvents module not available');
            events.init(canvasElement, {
                renderer,
                pixelData,
                toolRegistry,
                onChange: handleChange
            });
            
            updateSizeDisplay();
            startRenderLoop(); // Start the main render loop

            logger.info?.(`PixelCanvas initialized: ${width}×${height}`);
            if (eventBus) eventBus.emit(eventBus.Events.CANVAS_RESIZED, { width, height });

        } catch (error) {
            logger.error?.('PixelCanvas initialization failed', error);
            throw error;
        }
    }

    function startRenderLoop() {
        if (renderLoopId) return;

        function loop() {
            // Render main canvas
            renderer.render(pixelData.getData());

            // Update and render selection overlay
            if (selectionOverlay && toolRegistry) {
                dashOffset = (dashOffset + 0.25) % 16;
                const activeTool = toolRegistry.getCurrentTool();
                
                const selectionState = {
                    bounds: null,
                    previewBounds: null,
                    movePreview: null,
                };

                if (activeTool) {
                    selectionState.bounds = activeTool.selectionActive ? activeTool.selectionBounds : null;

                    // Handle SelectTool preview
                    if (activeTool.constructor.CONFIG.id === 'select' && activeTool.isDrawing) {
                        selectionState.bounds = null; // Hide old selection while drawing new one
                        selectionState.previewBounds = {
                            x1: Math.min(activeTool.startX, activeTool.lastX),
                            y1: Math.min(activeTool.startY, activeTool.lastY),
                            x2: Math.max(activeTool.startX, activeTool.lastX),
                            y2: Math.max(activeTool.startY, activeTool.lastY)
                        };
                    }
                    
                    // Handle MoveTool preview
                    if (activeTool.constructor.CONFIG.id === 'move' && activeTool.isMoving) {
                        selectionState.movePreview = activeTool.getPreviewData();
                        selectionState.bounds = null; // Hide the original selection bounds during move
                    }
                }

                selectionOverlay.render(selectionState, dashOffset);
            }

            renderLoopId = requestAnimationFrame(loop);
        }
        loop();
        logger.info?.('PixelCanvas render loop started.');
    }

    function stopRenderLoop() {
        if (renderLoopId) {
            cancelAnimationFrame(renderLoopId);
            renderLoopId = null;
            logger.info?.('PixelCanvas render loop stopped.');
        }
    }

    function clear() {
        if (pixelData) {
            pixelData.clear();
            handleChange();
            if (eventBus) eventBus.emit(eventBus.Events.CANVAS_CLEARED);
        }
    }

    function resize(newWidth, newHeight) {
        if (!pixelData || !renderer) return false;

        if (pixelData.resize(newWidth, newHeight)) {
            renderer.updateCanvasSize(newWidth, newHeight);
            if (selectionOverlay) selectionOverlay.updateSize();
            
            updateSizeDisplay();
            handleChange();
            if (eventBus) eventBus.emit(eventBus.Events.CANVAS_RESIZED, { width: newWidth, height: newHeight });
            return true;
        }
        return false;
    }

    function exportToString(compress = false) {
        return pixelData ? pixelData.exportToString(compress) : '';
    }

    function importFromString(str) {
        if (!pixelData || !renderer) return false;

        const result = pixelData.importFromString(str);
        if (result.success) {
            const dims = pixelData.getDimensions();
            renderer.updateCanvasSize(dims.width, dims.height);

            if (selectionOverlay) {
                selectionOverlay.updateSize();
            }
            if (toolRegistry) {
                 const activeTool = toolRegistry.getCurrentTool();
                 if(activeTool) activeTool.clearSelection();
            }

            updateSizeDisplay();
            handleChange();
            if (eventBus) eventBus.emit(eventBus.Events.FILE_LOADED, { width: dims.width, height: dims.height });
            return true;
        } else {
            if (window.Dialogs) window.Dialogs.alert('Import Failed', result.error, 'error');
            else alert('Import failed: ' + result.error);
            return false;
        }
    }

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

    function handleChange() {
        if (onChangeCallback) onChangeCallback();
        updateSizeDisplay();
    }

    function destroy() {
        stopRenderLoop();
        if (events) events.destroy();
        if (selectionOverlay) selectionOverlay.destroy();
        logger.info?.('PixelCanvas destroyed');
    }
    
    function getPixelData() { return pixelData ? pixelData.getData() : []; }
    function getDimensions() { return pixelData ? pixelData.getDimensions() : { width: 0, height: 0 }; }
    function getStats() { return pixelData ? pixelData.getStats() : {}; }
    function setChangeCallback(callback) {
        onChangeCallback = callback;
        if (events) events.setChangeCallback(callback);
    }

    return {
        init,
        clear,
        resize,
        exportToString,
        importFromString,
        getPixelData,
        getDimensions,
        getStats,
        setChangeCallback,
        destroy
    };
})();

if (typeof window !== 'undefined') {
    window.PixelCanvas = PixelCanvas;
}
