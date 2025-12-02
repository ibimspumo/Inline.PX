/**
 * Canvas Module - Professional Drawing Canvas
 *
 * Handles the pixel art canvas with professional tool support.
 * Integrates with Tools module for Photoshop-style drawing.
 *
 * Features:
 * - Tool-based drawing system
 * - Base64 color encoding
 * - Touch support for mobile
 * - Pixel grid visualization
 * - Export/Import with Base64 format
 */

const PixelCanvas = (function() {
    'use strict';

    let canvas = null;
    let ctx = null;
    let width = 16;
    let height = 16;
    let pixelSize = 30;
    let pixelData = []; // 2D array storing color indices (Base64)
    let onChangeCallback = null;
    let selectionOverlay = null; // Canvas overlay for selection visualization

    /**
     * Initialize the canvas
     * @param {string} canvasId - ID of the canvas element
     * @param {number} w - Canvas width in pixels
     * @param {number} h - Canvas height in pixels
     * @param {Function} onChange - Callback when canvas changes
     */
    function init(canvasId, w = 16, h = 16, onChange = null) {
        onChangeCallback = onChange;
        canvas = document.getElementById(canvasId);

        if (!canvas) {
            console.error('Canvas element not found:', canvasId);
            return;
        }

        ctx = canvas.getContext('2d');
        width = w;
        height = h;

        initializePixelData();
        calculatePixelSize();
        updateCanvasSize();
        createSelectionOverlay();
        setupEventListeners();
        render();
        updateSizeDisplay();
    }

    /**
     * Create selection overlay canvas
     */
    function createSelectionOverlay() {
        // Remove old overlay if exists
        if (selectionOverlay) {
            selectionOverlay.remove();
        }

        // Create new overlay canvas
        selectionOverlay = document.createElement('canvas');
        selectionOverlay.style.position = 'absolute';
        selectionOverlay.style.top = '0';
        selectionOverlay.style.left = '0';
        selectionOverlay.style.pointerEvents = 'none';
        selectionOverlay.style.zIndex = '10';

        // Insert after main canvas
        canvas.parentElement.style.position = 'relative';
        canvas.parentElement.appendChild(selectionOverlay);

        updateSelectionOverlaySize();
    }

    /**
     * Update selection overlay size
     */
    function updateSelectionOverlaySize() {
        if (selectionOverlay) {
            selectionOverlay.width = canvas.width;
            selectionOverlay.height = canvas.height;
            selectionOverlay.style.width = canvas.style.width;
            selectionOverlay.style.height = canvas.style.height;
        }
    }

    /**
     * Initialize pixel data array
     */
    function initializePixelData() {
        pixelData = [];
        for (let y = 0; y < height; y++) {
            pixelData[y] = [];
            for (let x = 0; x < width; x++) {
                pixelData[y][x] = 0; // 0 = transparent
            }
        }
    }

    /**
     * Calculate optimal pixel size
     */
    function calculatePixelSize() {
        const container = canvas.parentElement;
        const maxWidth = Math.min(container.clientWidth - 40, 800);
        const maxHeight = Math.min(window.innerHeight * 0.5, 800);

        const pixelSizeW = Math.floor(maxWidth / width);
        const pixelSizeH = Math.floor(maxHeight / height);

        pixelSize = Math.max(8, Math.min(pixelSizeW, pixelSizeH, 50));
    }

    /**
     * Update canvas dimensions
     */
    function updateCanvasSize() {
        canvas.width = width * pixelSize;
        canvas.height = height * pixelSize;
        ctx.imageSmoothingEnabled = false;
        updateSelectionOverlaySize();
    }

    /**
     * Setup event listeners for drawing
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
        canvas.addEventListener('touchend', handleMouseUp);
        canvas.addEventListener('touchcancel', handleMouseUp);

        // Prevent context menu
        canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    }

    /**
     * Handle mouse down
     */
    function handleMouseDown(e) {
        const coords = getCanvasCoordinates(e);
        if (!coords) return;

        const colorCode = ColorPalette.getCurrentColorCode();
        Tools.startDrawing(coords.x, coords.y, pixelData);

        // Immediate draw for brush/pencil/eraser
        const tool = Tools.getCurrentTool();
        if ([Tools.TOOL_TYPES.BRUSH, Tools.TOOL_TYPES.PENCIL, Tools.TOOL_TYPES.ERASER].includes(tool)) {
            if (Tools.continueDrawing(coords.x, coords.y, pixelData, colorCode)) {
                render();
                triggerChange();
            }
        }
    }

    /**
     * Handle mouse move
     */
    function handleMouseMove(e) {
        const coords = getCanvasCoordinates(e);
        if (!coords) return;

        const colorCode = ColorPalette.getCurrentColorCode();
        if (Tools.continueDrawing(coords.x, coords.y, pixelData, colorCode)) {
            render();
            triggerChange();
        }

        // Update selection visualization for select tool
        if (Tools.getCurrentTool() === Tools.TOOL_TYPES.SELECT) {
            renderSelectionPreview(coords.x, coords.y);
        }
    }

    /**
     * Handle mouse up
     */
    function handleMouseUp(e) {
        const coords = getCanvasCoordinates(e);
        const colorCode = ColorPalette.getCurrentColorCode();

        let modified = false;
        if (coords) {
            modified = Tools.endDrawing(coords.x, coords.y, pixelData, colorCode);
        } else {
            modified = Tools.endDrawing(-1, -1, pixelData, colorCode);
        }

        if (modified) {
            render();
            triggerChange();
        }

        // Update selection visualization after drawing ends
        if (Tools.getCurrentTool() === Tools.TOOL_TYPES.SELECT) {
            renderSelectionPreview();
        }
    }

    /**
     * Handle touch start
     */
    function handleTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        handleMouseDown(mouseEvent);
    }

    /**
     * Handle touch move
     */
    function handleTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousemove', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        handleMouseMove(mouseEvent);
    }

    /**
     * Get canvas coordinates from mouse event
     * @param {MouseEvent} e - Mouse event
     * @returns {Object|null} {x, y} coordinates or null
     */
    function getCanvasCoordinates(e) {
        const canvasWrapper = canvas.parentElement;
        const rect = canvas.getBoundingClientRect();

        // Account for viewport zoom and pan
        let zoom = 1.0;
        if (Viewport) {
            zoom = Viewport.getZoom();
        }

        // Calculate pixel coordinates accounting for zoom
        const x = Math.floor((e.clientX - rect.left) / (pixelSize * zoom));
        const y = Math.floor((e.clientY - rect.top) / (pixelSize * zoom));

        if (x >= 0 && x < width && y >= 0 && y < height) {
            return { x, y };
        }
        return null;
    }

    /**
     * Render the canvas
     */
    function render() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw pixels
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const colorIndex = pixelData[y][x];
                const color = ColorPalette.getColor(colorIndex);

                if (colorIndex === 0) {
                    drawCheckerboard(x, y);
                } else {
                    ctx.fillStyle = color;
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
        }

        // Draw grid
        drawGrid();

        // Re-render selection if active
        if (Tools && Tools.getCurrentTool() === Tools.TOOL_TYPES.SELECT && Tools.hasSelection()) {
            renderSelectionPreview();
        }
    }

    /**
     * Draw checkerboard pattern for transparent pixels
     */
    function drawCheckerboard(x, y) {
        const size = Math.max(2, Math.floor(pixelSize / 4));

        for (let dy = 0; dy < pixelSize; dy += size) {
            for (let dx = 0; dx < pixelSize; dx += size) {
                const isEven = ((Math.floor(dx / size) + Math.floor(dy / size)) % 2) === 0;
                ctx.fillStyle = isEven ? '#2a2a2a' : '#1a1a1a';
                ctx.fillRect(
                    x * pixelSize + dx,
                    y * pixelSize + dy,
                    size,
                    size
                );
            }
        }
    }

    /**
     * Draw grid lines
     */
    function drawGrid() {
        ctx.strokeStyle = '#404040';
        ctx.lineWidth = 1;

        // Vertical lines
        for (let x = 0; x <= width; x++) {
            ctx.beginPath();
            ctx.moveTo(x * pixelSize, 0);
            ctx.lineTo(x * pixelSize, height * pixelSize);
            ctx.stroke();
        }

        // Horizontal lines
        for (let y = 0; y <= height; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * pixelSize);
            ctx.lineTo(width * pixelSize, y * pixelSize);
            ctx.stroke();
        }
    }

    /**
     * Clear canvas
     */
    function clear() {
        initializePixelData();
        render();
        triggerChange();
    }

    /**
     * Resize canvas
     * @param {number} newWidth - New width
     * @param {number} newHeight - New height
     * @returns {boolean} Success
     */
    function resize(newWidth, newHeight) {
        if (newWidth < 2 || newWidth > 128 || newHeight < 2 || newHeight > 128) {
            console.error('Invalid dimensions');
            return false;
        }

        const oldData = pixelData;
        const oldWidth = width;
        const oldHeight = height;

        width = newWidth;
        height = newHeight;

        initializePixelData();

        // Copy old data
        for (let y = 0; y < Math.min(oldHeight, height); y++) {
            for (let x = 0; x < Math.min(oldWidth, width); x++) {
                pixelData[y][x] = oldData[y][x];
            }
        }

        calculatePixelSize();
        updateCanvasSize();
        render();
        updateSizeDisplay();
        triggerChange();

        return true;
    }

    /**
     * Export to Base64 string format
     * Format: "WxH:BASE64DATA"
     * @returns {string} Export string
     */
    function exportToString() {
        let dataString = '';

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                dataString += ColorPalette.getBase64Char(pixelData[y][x]);
            }
        }

        return `${width}x${height}:${dataString}`;
    }

    /**
     * Import from Base64 string
     * @param {string} str - Import string in format "WxH:BASE64DATA" or "WxH:RLE:DATA"
     * @returns {boolean} Success
     */
    function importFromString(str) {
        try {
            // Check if compressed, decompress if needed
            let decompressedString = str;
            if (Compression && Compression.isCompressed(str)) {
                decompressedString = Compression.decompress(str);
            }

            const parts = decompressedString.split(':');
            if (parts.length !== 2) {
                throw new Error('Invalid format. Expected "WxH:DATA"');
            }

            const dimensions = parts[0].split('x');
            if (dimensions.length !== 2) {
                throw new Error('Invalid dimensions format');
            }

            const newWidth = parseInt(dimensions[0]);
            const newHeight = parseInt(dimensions[1]);
            const dataString = parts[1];

            if (isNaN(newWidth) || isNaN(newHeight)) {
                throw new Error('Invalid width or height');
            }

            if (newWidth < 2 || newWidth > 128 || newHeight < 2 || newHeight > 128) {
                throw new Error('Width and height must be between 2 and 128');
            }

            if (dataString.length !== newWidth * newHeight) {
                throw new Error(`Expected ${newWidth * newHeight} characters, got ${dataString.length}`);
            }

            // Validate Base64 characters
            for (let i = 0; i < dataString.length; i++) {
                const char = dataString[i];
                if (ColorPalette.getIndexFromChar(char) === -1) {
                    throw new Error(`Invalid character in data: ${char}`);
                }
            }

            // Update dimensions
            width = newWidth;
            height = newHeight;

            // Parse pixel data
            initializePixelData();
            let index = 0;
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    pixelData[y][x] = ColorPalette.getIndexFromChar(dataString[index]);
                    index++;
                }
            }

            calculatePixelSize();
            updateCanvasSize();
            render();
            updateSizeDisplay();
            triggerChange();

            return true;
        } catch (error) {
            console.error('Import error:', error.message);
            if (Dialogs) {
                Dialogs.alert('Import Failed', 'Import failed: ' + error.message, 'error');
            } else {
                alert('Import failed: ' + error.message);
            }
            return false;
        }
    }

    /**
     * Get pixel data
     * @returns {Array} 2D array of color indices
     */
    function getPixelData() {
        return pixelData;
    }

    /**
     * Get dimensions
     * @returns {Object} {width, height}
     */
    function getDimensions() {
        return { width, height };
    }

    /**
     * Update size display
     */
    function updateSizeDisplay() {
        const sizeDisplay = document.getElementById('canvasSizeDisplay');
        const charCount = document.getElementById('characterCount');

        if (sizeDisplay) {
            sizeDisplay.textContent = `${width}×${height}`;
        }

        if (charCount) {
            charCount.textContent = width * height;
        }
    }

    /**
     * Render selection preview on overlay
     * @param {number} x - Current X coordinate (optional during drawing)
     * @param {number} y - Current Y coordinate (optional during drawing)
     */
    function renderSelectionPreview(x, y) {
        if (!selectionOverlay) return;

        const overlayCtx = selectionOverlay.getContext('2d');
        overlayCtx.clearRect(0, 0, selectionOverlay.width, selectionOverlay.height);

        // Get selection data from Tools module
        const selectionData = Tools.getSelectionData();
        if (!selectionData || !selectionData.active) return;

        let startX, startY, endX, endY;

        if (selectionData.isDrawing && x !== undefined && y !== undefined) {
            // During drawing - use current mouse position
            startX = Math.min(selectionData.startX, x);
            startY = Math.min(selectionData.startY, y);
            endX = Math.max(selectionData.startX, x);
            endY = Math.max(selectionData.startY, y);
        } else if (!selectionData.isDrawing && selectionData.endX !== undefined) {
            // After drawing - use final bounds
            startX = selectionData.startX;
            startY = selectionData.startY;
            endX = selectionData.endX;
            endY = selectionData.endY;
        } else {
            return;
        }

        // Calculate pixel-aligned positions
        const rectX = Math.floor(startX * pixelSize);
        const rectY = Math.floor(startY * pixelSize);
        const rectWidth = Math.floor((endX - startX + 1) * pixelSize);
        const rectHeight = Math.floor((endY - startY + 1) * pixelSize);

        // Draw selection rectangle (pixel-perfect aligned)
        overlayCtx.strokeStyle = '#00BFFF';
        overlayCtx.lineWidth = 2;
        overlayCtx.setLineDash([4, 4]);
        overlayCtx.strokeRect(rectX, rectY, rectWidth, rectHeight);

        // Draw semi-transparent fill
        overlayCtx.fillStyle = 'rgba(0, 191, 255, 0.1)';
        overlayCtx.fillRect(rectX, rectY, rectWidth, rectHeight);
    }

    /**
     * Clear selection overlay
     */
    function clearSelectionOverlay() {
        if (selectionOverlay) {
            const overlayCtx = selectionOverlay.getContext('2d');
            overlayCtx.clearRect(0, 0, selectionOverlay.width, selectionOverlay.height);
        }
    }

    /**
     * Trigger change callback
     */
    function triggerChange() {
        if (onChangeCallback) {
            onChangeCallback();
        }
    }

    // Public API
    return {
        init,
        clear,
        resize,
        render,
        exportToString,
        importFromString,
        getPixelData,
        getDimensions,
        clearSelectionOverlay
    };
})();
