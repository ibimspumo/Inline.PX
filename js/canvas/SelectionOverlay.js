/**
 * SelectionOverlay - Selection Visualization
 *
 * Manages the selection overlay canvas:
 * - Marching ants animation
 * - Selection bounds visualization
 * - Pixel-perfect alignment
 * - Independent rendering layer
 *
 * @module SelectionOverlay
 */

const SelectionOverlay = (function() {
    'use strict';

    let overlayCanvas = null;
    let overlayCtx = null;
    let mainCanvas = null;
    let renderer = null;
    let toolRegistry = null;

    let selectionBounds = null;
    let animationFrame = null;
    let dashOffset = 0;

    const logger = window.Logger || console;

    /**
     * Initialize selection overlay
     * @param {HTMLCanvasElement} mainCanvasElement - Main canvas element
     * @param {Object} dependencies - Module dependencies
     */
    function init(mainCanvasElement, dependencies = {}) {
        mainCanvas = mainCanvasElement;
        renderer = dependencies.renderer || window.CanvasRenderer;
        toolRegistry = dependencies.toolRegistry || window.ToolRegistry;

        createOverlay();
        logger.debug?.('SelectionOverlay initialized');
    }

    /**
     * Create overlay canvas
     * @private
     */
    function createOverlay() {
        // Remove old overlay if exists
        if (overlayCanvas) {
            overlayCanvas.remove();
        }

        // Create new overlay
        overlayCanvas = document.createElement('canvas');
        overlayCanvas.className = 'selection-overlay';
        overlayCanvas.style.position = 'absolute';
        overlayCanvas.style.top = '0';
        overlayCanvas.style.left = '0';
        overlayCanvas.style.pointerEvents = 'none';
        overlayCanvas.style.zIndex = '10';

        overlayCtx = overlayCanvas.getContext('2d');

        // Insert after main canvas
        const container = mainCanvas.parentElement;
        if (container) {
            container.style.position = 'relative';
            container.appendChild(overlayCanvas);
        }

        updateSize();
    }

    /**
     * Update overlay size to match main canvas
     */
    function updateSize() {
        if (!overlayCanvas || !mainCanvas) return;

        overlayCanvas.width = mainCanvas.width;
        overlayCanvas.height = mainCanvas.height;
        overlayCanvas.style.width = mainCanvas.style.width;
        overlayCanvas.style.height = mainCanvas.style.height;

        logger.debug?.(`SelectionOverlay size updated: ${overlayCanvas.width}×${overlayCanvas.height}`);
    }

    /**
     * Set selection bounds
     * @param {Object} bounds - Selection bounds {x1, y1, x2, y2}
     */
    function setSelection(bounds) {
        selectionBounds = bounds;
    }

    /**
     * Clear selection
     */
    function clearSelection() {
        selectionBounds = null;
        clear();
        stopAnimation();
    }

    /**
     * Render selection preview
     * @param {number} currentX - Current mouse X (optional, during drag)
     * @param {number} currentY - Current mouse Y (optional, during drag)
     */
    function renderPreview(currentX, currentY) {
        if (!overlayCanvas || !overlayCtx || !renderer) return;

        clear();

        // Get selection data from tool
        let bounds = null;

        if (toolRegistry) {
            const tool = toolRegistry.getCurrentTool();
            if (tool && tool.getSelectionData) {
                const selectionData = tool.getSelectionData();
                if (selectionData && selectionData.active) {
                    if (selectionData.isDrawing && currentX !== undefined && currentY !== undefined) {
                        // During drawing
                        bounds = {
                            x1: Math.min(selectionData.x1, currentX),
                            y1: Math.min(selectionData.y1, currentY),
                            x2: Math.max(selectionData.x1, currentX),
                            y2: Math.max(selectionData.y1, currentY)
                        };
                    } else if (!selectionData.isDrawing && selectionData.x2 !== undefined) {
                        // Finalized
                        bounds = {
                            x1: selectionData.x1,
                            y1: selectionData.y1,
                            x2: selectionData.x2,
                            y2: selectionData.y2
                        };
                    }
                }
            }
        }

        // Use stored bounds if no tool data
        if (!bounds && selectionBounds) {
            bounds = selectionBounds;
        }

        if (!bounds) return;

        drawSelection(bounds);
        startAnimation();
    }

    /**
     * Draw selection rectangle
     * @private
     * @param {Object} bounds - Selection bounds
     */
    function drawSelection(bounds) {
        if (!renderer) return;

        const pixelSize = renderer.getPixelSize();

        // Calculate pixel-aligned positions
        const rectX = Math.floor(bounds.x1 * pixelSize);
        const rectY = Math.floor(bounds.y1 * pixelSize);
        const rectWidth = Math.floor((bounds.x2 - bounds.x1 + 1) * pixelSize);
        const rectHeight = Math.floor((bounds.y2 - bounds.y1 + 1) * pixelSize);

        // Draw marching ants border
        overlayCtx.strokeStyle = '#00BFFF';
        overlayCtx.lineWidth = 2;
        overlayCtx.setLineDash([4, 4]);
        overlayCtx.lineDashOffset = -dashOffset;
        overlayCtx.strokeRect(rectX, rectY, rectWidth, rectHeight);

        // Draw semi-transparent fill
        overlayCtx.fillStyle = 'rgba(0, 191, 255, 0.1)';
        overlayCtx.fillRect(rectX, rectY, rectWidth, rectHeight);
    }

    /**
     * Start marching ants animation
     * @private
     */
    function startAnimation() {
        if (animationFrame) return;

        function animate() {
            dashOffset = (dashOffset + 0.5) % 8;

            if (selectionBounds) {
                clear();
                drawSelection(selectionBounds);
            }

            animationFrame = requestAnimationFrame(animate);
        }

        animate();
    }

    /**
     * Stop marching ants animation
     * @private
     */
    function stopAnimation() {
        if (animationFrame) {
            cancelAnimationFrame(animationFrame);
            animationFrame = null;
        }
        dashOffset = 0;
    }

    /**
     * Clear overlay
     */
    function clear() {
        if (overlayCanvas && overlayCtx) {
            overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);
        }
    }

    /**
     * Destroy overlay
     */
    function destroy() {
        stopAnimation();

        if (overlayCanvas) {
            overlayCanvas.remove();
            overlayCanvas = null;
            overlayCtx = null;
        }

        logger.debug?.('SelectionOverlay destroyed');
    }

    // Public API
    return {
        init,
        updateSize,
        setSelection,
        clearSelection,
        renderPreview,
        clear,
        destroy
    };
})();

if (typeof window !== 'undefined') {
    window.SelectionOverlay = SelectionOverlay;
}
