/**
 * SelectionOverlay - Stateless Selection Visualizer
 *
 * This module is responsible for drawing selection-related visuals onto a dedicated
 * overlay canvas. It is designed to be stateless, meaning it relies on external
 * components to pass it the necessary information on every frame.
 *
 * It can render:
 * - A "marching ants" border for a finalized selection.
 * - A live preview of a new selection being drawn.
 * - The pixel content of a selection being moved.
 *
 * @module SelectionOverlay
 */

import logger from '../core/Logger.js';
import CanvasRenderer from './CanvasRenderer.js';

let overlayCanvas = null;
let overlayCtx = null;
let mainCanvas = null;
let renderer = null; // Reference to CanvasRenderer for pixel size etc.

/**
 * Initialize the selection overlay.
 * @param {HTMLCanvasElement} mainCanvasElement - The main canvas element.
 * @param {Object} dependencies - Module dependencies like the renderer.
 */
function init(mainCanvasElement, dependencies = {}) {
    mainCanvas = mainCanvasElement;
    renderer = dependencies.renderer || CanvasRenderer;

    createOverlay();
    logger.debug?.('SelectionOverlay initialized (stateless)');
}

/**
 * Create and configure the overlay canvas element.
 * @private
 */
function createOverlay() {
    if (overlayCanvas) overlayCanvas.remove();

    overlayCanvas = document.createElement('canvas');
    overlayCanvas.className = 'selection-overlay';
    Object.assign(overlayCanvas.style, {
        position: 'absolute',
        top: '0',
        left: '0',
        pointerEvents: 'none',
        zIndex: '10'
    });

    overlayCtx = overlayCanvas.getContext('2d');
    mainCanvas.parentElement.appendChild(overlayCanvas);
    updateSize();
}

/**
 * Resize the overlay to match the main canvas dimensions.
 */
function updateSize() {
    if (!overlayCanvas || !mainCanvas) return;
    overlayCanvas.width = mainCanvas.width;
    overlayCanvas.height = mainCanvas.height;
    Object.assign(overlayCanvas.style, {
        width: mainCanvas.style.width,
        height: mainCanvas.style.height
    });
}

/**
 * The main rendering function, called from an external render loop.
 * @param {Object} selectionState - The current state of the selection.
 * @param {Object} selectionState.bounds - The bounds of a finalized selection.
 * @param {Object} selectionState.previewBounds - The bounds of a selection being drawn.
 * @param {Object} selectionState.movePreview - Data for rendering a move preview.
 * @param {number} dashOffset - The offset for the "marching ants" animation.
 */
function render(selectionState, dashOffset = 0) {
    if (!overlayCanvas || !overlayCtx || !renderer) return;

    clear();

    const { bounds, previewBounds, movePreview } = selectionState;

    // 1. Render content being moved (highest priority)
    if (movePreview && movePreview.pixelData) {
        renderMovePreview(movePreview);
        // Also draw a border around the moving content
        const moveBounds = {
            x1: movePreview.x,
            y1: movePreview.y,
            x2: movePreview.x + movePreview.pixelData[0].length - 1,
            y2: movePreview.y + movePreview.pixelData.length - 1,
        };
        drawMarchingAnts(moveBounds, dashOffset);
    }
    // 2. Render a finalized selection border
    else if (bounds) {
        drawMarchingAnts(bounds, dashOffset);
    }
    // 3. Render a live selection drawing preview
    else if (previewBounds) {
        drawSelectionPreview(previewBounds);
    }
}

/**
 * Renders the pixel data for a MoveTool preview.
 * @param {Object} movePreview - The data from MoveTool.getPreviewData().
 */
function renderMovePreview(movePreview) {
    const { pixelData, x, y } = movePreview;
    const pixelSize = renderer.getPixelSize();
    const colors = renderer.getColors();

    for (let j = 0; j < pixelData.length; j++) {
        for (let i = 0; i < pixelData[j].length; i++) {
            const colorIndex = pixelData[j][i];
            if (colorIndex !== 0) { // Assuming 0 is transparent
                overlayCtx.fillStyle = colors[colorIndex];
                overlayCtx.fillRect(
                    Math.floor((x + i) * pixelSize),
                    Math.floor((y + j) * pixelSize),
                    pixelSize,
                    pixelSize
                );
            }
        }
    }
}

/**
 * Draws the "marching ants" animated border for a finalized selection.
 * @param {Object} bounds - The selection bounds {x1, y1, x2, y2}.
 * @param {number} dashOffset - The animation offset.
 */
function drawMarchingAnts(bounds, dashOffset) {
    const pixelSize = renderer.getPixelSize();
    const rect = {
        x: Math.floor(bounds.x1 * pixelSize),
        y: Math.floor(bounds.y1 * pixelSize),
        w: Math.floor((bounds.x2 - bounds.x1 + 1) * pixelSize),
        h: Math.floor((bounds.y2 - bounds.y1 + 1) * pixelSize)
    };

    overlayCtx.strokeStyle = '#FFFFFF';
    overlayCtx.lineWidth = 1;
    overlayCtx.setLineDash([4, 4]);
    overlayCtx.lineDashOffset = dashOffset;
    overlayCtx.strokeRect(rect.x - 1, rect.y - 1, rect.w + 2, rect.h + 2);
    
    overlayCtx.strokeStyle = '#000000';
    overlayCtx.lineDashOffset = dashOffset + 4;
    overlayCtx.strokeRect(rect.x - 1, rect.y - 1, rect.w + 2, rect.h + 2);
}

/**
 * Draws a simple dashed-line preview for a selection in progress.
 * @param {Object} bounds - The preview bounds {x1, y1, x2, y2}.
 */
function drawSelectionPreview(bounds) {
    const pixelSize = renderer.getPixelSize();
    const rect = {
        x: Math.floor(bounds.x1 * pixelSize),
        y: Math.floor(bounds.y1 * pixelSize),
        w: Math.floor((bounds.x2 - bounds.x1 + 1) * pixelSize),
        h: Math.floor((bounds.y2 - bounds.y1 + 1) * pixelSize)
    };

    overlayCtx.strokeStyle = 'rgba(0, 191, 255, 0.8)';
    overlayCtx.lineWidth = 1;
    overlayCtx.setLineDash([3, 3]);
    overlayCtx.strokeRect(rect.x, rect.y, rect.w, rect.h);
}

/**
 * Clear the entire overlay canvas.
 */
function clear() {
    if (overlayCanvas && overlayCtx) {
        overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
    }
}

/**
 * Clean up and remove the overlay.
 */
function destroy() {
    if (overlayCanvas) {
        overlayCanvas.remove();
        overlayCanvas = null;
        overlayCtx = null;
    }
    logger.debug?.('SelectionOverlay destroyed');
}

const SelectionOverlay = {
    init,
    updateSize,
    render,
    clear,
    destroy
};

export default SelectionOverlay;
