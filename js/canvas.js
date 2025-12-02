/**
 * Canvas Module
 *
 * Handles the pixel art canvas drawing and interaction.
 * Manages the pixel grid, drawing operations, and canvas rendering.
 *
 * Features:
 * - Click and drag drawing
 * - Touch support for mobile devices
 * - Pixel grid visualization
 * - Export to text string format (compact storage)
 * - Import from text string
 */

const PixelCanvas = (function() {
    'use strict';

    let canvas = null;
    let ctx = null;
    let width = 8;
    let height = 8;
    let pixelSize = 30;
    let isDrawing = false;
    let pixelData = []; // 2D array storing color codes
    let onChangeCallback = null; // Callback for when canvas changes

    /**
     * Initialize the canvas
     * @param {string} canvasId - ID of the canvas element
     * @param {number} w - Canvas width in pixels
     * @param {number} h - Canvas height in pixels
     * @param {Function} onChange - Callback when canvas changes (for live preview)
     */
    function init(canvasId, w = 8, h = 8, onChange = null) {
        onChangeCallback = onChange;
        canvas = document.getElementById(canvasId);

        if (!canvas) {
            console.error('Canvas element not found:', canvasId);
            return;
        }

        ctx = canvas.getContext('2d');
        width = w;
        height = h;

        // Initialize pixel data (all transparent by default)
        initializePixelData();

        // Calculate pixel size based on screen
        calculatePixelSize();

        // Set canvas size
        updateCanvasSize();

        // Setup event listeners
        setupEventListeners();

        // Initial render
        render();

        // Update size display
        updateSizeDisplay();
    }

    /**
     * Initialize pixel data array with transparent pixels
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
     * Calculate optimal pixel size based on screen size
     */
    function calculatePixelSize() {
        const container = canvas.parentElement;
        const maxWidth = Math.min(container.clientWidth - 40, 600);
        const maxHeight = Math.min(window.innerHeight * 0.5, 600);

        const pixelSizeW = Math.floor(maxWidth / width);
        const pixelSizeH = Math.floor(maxHeight / height);

        pixelSize = Math.max(10, Math.min(pixelSizeW, pixelSizeH, 50));
    }

    /**
     * Update canvas dimensions
     */
    function updateCanvasSize() {
        canvas.width = width * pixelSize;
        canvas.height = height * pixelSize;

        // Disable image smoothing for crisp pixels
        ctx.imageSmoothingEnabled = false;
    }

    /**
     * Setup mouse and touch event listeners
     */
    function setupEventListeners() {
        // Mouse events
        canvas.addEventListener('mousedown', handleDrawStart);
        canvas.addEventListener('mousemove', handleDrawMove);
        canvas.addEventListener('mouseup', handleDrawEnd);
        canvas.addEventListener('mouseleave', handleDrawEnd);

        // Touch events for mobile
        canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
        canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
        canvas.addEventListener('touchend', handleDrawEnd);
        canvas.addEventListener('touchcancel', handleDrawEnd);
    }

    /**
     * Handle drawing start (mouse down)
     * @param {MouseEvent} e - Mouse event
     */
    function handleDrawStart(e) {
        isDrawing = true;
        drawPixel(e);
    }

    /**
     * Handle drawing move (mouse move while drawing)
     * @param {MouseEvent} e - Mouse event
     */
    function handleDrawMove(e) {
        if (isDrawing) {
            drawPixel(e);
        }
    }

    /**
     * Handle drawing end
     */
    function handleDrawEnd() {
        isDrawing = false;
    }

    /**
     * Handle touch start
     * @param {TouchEvent} e - Touch event
     */
    function handleTouchStart(e) {
        e.preventDefault();
        isDrawing = true;
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent('mousedown', {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        drawPixel(mouseEvent);
    }

    /**
     * Handle touch move
     * @param {TouchEvent} e - Touch event
     */
    function handleTouchMove(e) {
        e.preventDefault();
        if (isDrawing) {
            const touch = e.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            drawPixel(mouseEvent);
        }
    }

    /**
     * Draw a pixel at the mouse/touch position
     * @param {MouseEvent} e - Mouse event
     */
    function drawPixel(e) {
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / pixelSize);
        const y = Math.floor((e.clientY - rect.top) / pixelSize);

        if (x >= 0 && x < width && y >= 0 && y < height) {
            const colorCode = ColorPalette.getCurrentColorCode();
            pixelData[y][x] = colorCode;
            render();

            // Trigger onChange callback for live preview
            if (onChangeCallback) {
                onChangeCallback();
            }
        }
    }

    /**
     * Render the entire canvas
     */
    function render() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Draw each pixel
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const colorCode = pixelData[y][x];
                const color = ColorPalette.getColor(colorCode);

                // Draw pixel background (checkerboard for transparent)
                if (colorCode === 0) {
                    drawCheckerboard(x, y);
                } else {
                    ctx.fillStyle = color;
                    ctx.fillRect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
                }
            }
        }

        // Draw grid
        drawGrid();
    }

    /**
     * Draw checkerboard pattern for transparent pixels
     * @param {number} x - X position
     * @param {number} y - Y position
     */
    function drawCheckerboard(x, y) {
        const size = Math.max(2, Math.floor(pixelSize / 4));

        for (let dy = 0; dy < pixelSize; dy += size) {
            for (let dx = 0; dx < pixelSize; dx += size) {
                const isEven = ((Math.floor(dx / size) + Math.floor(dy / size)) % 2) === 0;
                ctx.fillStyle = isEven ? '#CCCCCC' : '#FFFFFF';
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
        ctx.strokeStyle = '#444444';
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
     * Clear the entire canvas (set all pixels to transparent)
     */
    function clear() {
        initializePixelData();
        render();
    }

    /**
     * Resize the canvas
     * @param {number} newWidth - New width in pixels
     * @param {number} newHeight - New height in pixels
     */
    function resize(newWidth, newHeight) {
        // Validate dimensions
        if (newWidth < 2 || newWidth > 64 || newHeight < 2 || newHeight > 64) {
            console.error('Invalid canvas dimensions. Must be between 2 and 64.');
            return false;
        }

        // Save old data
        const oldData = pixelData;
        const oldWidth = width;
        const oldHeight = height;

        // Update dimensions
        width = newWidth;
        height = newHeight;

        // Initialize new pixel data
        initializePixelData();

        // Copy old data (if it fits)
        for (let y = 0; y < Math.min(oldHeight, height); y++) {
            for (let x = 0; x < Math.min(oldWidth, width); x++) {
                pixelData[y][x] = oldData[y][x];
            }
        }

        // Recalculate and update
        calculatePixelSize();
        updateCanvasSize();
        render();
        updateSizeDisplay();

        return true;
    }

    /**
     * Export canvas to compact text string format
     * Format: "WIDTHxHEIGHT:PIXELDATA"
     * Example: "8x8:0000000000111111000000000000000000000000000000000000000000000000"
     * @returns {string} Compact text representation
     */
    function exportToString() {
        let dataString = '';

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                dataString += pixelData[y][x];
            }
        }

        return `${width}x${height}:${dataString}`;
    }

    /**
     * Import canvas from text string
     * @param {string} str - Text string in format "WIDTHxHEIGHT:PIXELDATA"
     * @returns {boolean} Success status
     */
    function importFromString(str) {
        try {
            // Parse format: "WIDTHxHEIGHT:PIXELDATA"
            const parts = str.split(':');
            if (parts.length !== 2) {
                throw new Error('Invalid format. Expected "WIDTHxHEIGHT:PIXELDATA"');
            }

            const dimensions = parts[0].split('x');
            if (dimensions.length !== 2) {
                throw new Error('Invalid dimensions format');
            }

            const newWidth = parseInt(dimensions[0]);
            const newHeight = parseInt(dimensions[1]);
            const dataString = parts[1];

            // Validate
            if (isNaN(newWidth) || isNaN(newHeight)) {
                throw new Error('Invalid width or height');
            }

            if (newWidth < 2 || newWidth > 64 || newHeight < 2 || newHeight > 64) {
                throw new Error('Width and height must be between 2 and 64');
            }

            if (dataString.length !== newWidth * newHeight) {
                throw new Error(`Expected ${newWidth * newHeight} characters, got ${dataString.length}`);
            }

            // Validate characters (only 0-9)
            if (!/^[0-9]+$/.test(dataString)) {
                throw new Error('Invalid characters in pixel data. Only 0-9 allowed');
            }

            // Update dimensions
            width = newWidth;
            height = newHeight;

            // Parse pixel data
            initializePixelData();
            let index = 0;
            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    pixelData[y][x] = parseInt(dataString[index]);
                    index++;
                }
            }

            // Update canvas
            calculatePixelSize();
            updateCanvasSize();
            render();
            updateSizeDisplay();

            return true;
        } catch (error) {
            console.error('Import error:', error.message);
            alert('Import failed: ' + error.message);
            return false;
        }
    }

    /**
     * Get current pixel data
     * @returns {Array} 2D array of color codes
     */
    function getPixelData() {
        return pixelData;
    }

    /**
     * Get canvas dimensions
     * @returns {Object} {width, height}
     */
    function getDimensions() {
        return { width, height };
    }

    /**
     * Update size display in UI
     */
    function updateSizeDisplay() {
        const sizeDisplay = document.getElementById('canvasSizeDisplay');
        const charCount = document.getElementById('characterCount');

        if (sizeDisplay) {
            sizeDisplay.textContent = `${width}x${height}`;
        }

        if (charCount) {
            charCount.textContent = width * height;
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
        getDimensions
    };
})();
