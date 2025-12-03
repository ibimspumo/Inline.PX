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
 *
 * @typedef {import('../types.js').DrawingContext} DrawingContext
 * @typedef {import('../types.js').SelectionBounds} SelectionBounds
 */

import logger from '../core/Logger.js';
import eventBus from '../core/EventBus.js';
import configLoader from '../core/ConfigLoader.js';
import PixelData from './PixelData.js';
import formatUtils from '../utils/FormatUtils.js';
import ToolRegistry from '../tools/ToolRegistry.js';
import CanvasRenderer from './CanvasRenderer.js';
import SelectionOverlay from './SelectionOverlay.js';
import CanvasEvents from './CanvasEvents.js'; // Added import for CanvasEvents

let canvasElement = null;
let onChangeCallback = null;
let constants = null;
let toolRegistry = null;

let renderLoopId = null;
let dashOffset = 0;

async function init(canvasId, width = 16, height = 16, onChange = null) {
    try {
        logger.info?.('PixelCanvas initializing...');
        onChangeCallback = onChange;
        canvasElement = document.getElementById(canvasId);
        toolRegistry = ToolRegistry;

        if (!canvasElement) throw new Error(`Canvas element "${canvasId}" not found`);

        constants = await configLoader.loadConstants();

        // Use imported PixelData
        if (!PixelData) throw new Error('PixelData module not available');
        PixelData.init(width, height);

        if (!CanvasRenderer) throw new Error('CanvasRenderer module not available');
        CanvasRenderer.init(canvasElement, constants);
        CanvasRenderer.updateCanvasSize(width, height);

        if (SelectionOverlay) {
            SelectionOverlay.init(canvasElement, { renderer: CanvasRenderer });
        }

        // Use imported CanvasEvents
        if (!CanvasEvents) throw new Error('CanvasEvents module not available');
        CanvasEvents.init(canvasElement, {
            renderer: CanvasRenderer,
            pixelData: PixelData,
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
        CanvasRenderer.render(PixelData.getData());

        // Update and render selection overlay
        if (SelectionOverlay && toolRegistry) {
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

            SelectionOverlay.render(selectionState, dashOffset);
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
    if (PixelData) {
        PixelData.clear();
        handleChange();
        if (eventBus) eventBus.emit(eventBus.Events.CANVAS_CLEARED);
    }
}

function hasContent() {
    if (!PixelData) return false;
    const data = PixelData.getData();
    // Check if any pixel is not transparent (index 0)
    return data.some(row => row.some(pixel => pixel !== 0));
}

function resize(newWidth, newHeight) {
    if (!PixelData || !CanvasRenderer) return false;

    if (PixelData.resize(newWidth, newHeight)) {
        // Preserve current pixelSize to maintain zoom level
        const currentPixelSize = CanvasRenderer.getPixelSize();
        CanvasRenderer.updateCanvasSize(newWidth, newHeight, currentPixelSize);
        if (SelectionOverlay) SelectionOverlay.updateSize();

        updateSizeDisplay();
        handleChange();
        if (eventBus) eventBus.emit(eventBus.Events.CANVAS_RESIZED, { width: newWidth, height: newHeight });
        return true;
    }
    return false;
}

function exportToString(compress = false) {
    return PixelData ? PixelData.exportToString(compress) : '';
}

function importFromString(str) {
    if (!PixelData || !CanvasRenderer) return false;

    const result = PixelData.importFromString(str);
    if (result.success) {
        const dims = PixelData.getDimensions();

        // Preserve current pixelSize to maintain zoom level
        const currentPixelSize = CanvasRenderer.getPixelSize();
        CanvasRenderer.updateCanvasSize(dims.width, dims.height, currentPixelSize);

        if (SelectionOverlay) {
            SelectionOverlay.updateSize();
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
        if (window.Dialogs) window.Dialogs.alert('Import Failed', result.error, 'error'); // TEMPORARY
        else alert('Import failed: ' + result.error);
        return false;
    }
}

function updateSizeDisplay() {
    if (!PixelData) return;

    const dims = PixelData.getDimensions();
    const sizeDisplay = document.getElementById('canvasSizeDisplay');

    if (sizeDisplay && formatUtils) {
        sizeDisplay.textContent = formatUtils.formatDimensions(dims.width, dims.height);
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
    if (CanvasEvents) CanvasEvents.destroy();
    if (SelectionOverlay) SelectionOverlay.destroy();
    logger.info?.('PixelCanvas destroyed');
}

function getPixelData() { return PixelData ? PixelData.getData() : []; }
function getDimensions() { return PixelData ? PixelData.getDimensions() : { width: 0, height: 0 }; }
function getStats() { return PixelData ? PixelData.getStats() : {}; }
function setChangeCallback(callback) {
    onChangeCallback = callback;
    if (events) events.setChangeCallback(callback);
}

const PixelCanvas = {
    init,
    clear,
    hasContent,
    resize,
    exportToString,
    importFromString,
    getPixelData,
    getDimensions,
    getStats,
    setChangeCallback,
    destroy
};

export default PixelCanvas;
