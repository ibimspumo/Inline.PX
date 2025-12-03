/**
 * Viewport Module - Canvas zoom and pan functionality
 *
 * Features:
 * - Zoom in/out with mouse wheel
 * - Zoom controls (buttons)
 * - Pan/drag canvas with Hand tool or Space key
 * - Zoom presets (25%, 50%, 100%, 200%, 400%)
 * - Fit to screen
 * - Reset zoom and pan
 */

const Viewport = (function() {
    'use strict';

    let zoom = 1.0;
    let panX = 0;
    let panY = 0;
    let isPanning = false;
    let lastPanX = 0;
    let lastPanY = 0;
    let canvasContainer = null;

    const MIN_ZOOM = 0.1;
    const MAX_ZOOM = 10.0;
    const ZOOM_STEP = 0.1;

    /**
     * Initialize viewport system
     */
    function init() {
        canvasContainer = document.querySelector('.canvas-container');
        if (!canvasContainer) return;

        createZoomControls();
        setupEventListeners();
        updateViewport();

        console.log('Viewport initialized');
    }

    /**
     * Create zoom control UI
     */
    function createZoomControls() {
        const infoBar = document.querySelector('.info-bar');
        if (!infoBar) return;

        const zoomControls = document.createElement('div');
        zoomControls.className = 'zoom-controls';
        zoomControls.innerHTML = `
            <div class="info-group">
                <button class="zoom-btn" id="zoomOutBtn" title="Zoom Out (-)">−</button>
                <select class="zoom-select" id="zoomSelect">
                    <option value="0.25">25%</option>
                    <option value="0.5">50%</option>
                    <option value="1" selected>100%</option>
                    <option value="2">200%</option>
                    <option value="4">400%</option>
                    <option value="fit">Fit</option>
                </select>
                <button class="zoom-btn" id="zoomInBtn" title="Zoom In (+)">+</button>
                <button class="zoom-btn" id="zoomResetBtn" title="Reset View (Ctrl+0)">⟲</button>
            </div>
        `;

        // Insert before the spacer
        const spacer = infoBar.querySelector('.info-spacer');
        if (spacer) {
            infoBar.insertBefore(zoomControls, spacer);
        } else {
            infoBar.appendChild(zoomControls);
        }

        // Setup button listeners
        document.getElementById('zoomInBtn').addEventListener('click', zoomIn);
        document.getElementById('zoomOutBtn').addEventListener('click', zoomOut);
        document.getElementById('zoomResetBtn').addEventListener('click', resetView);
        document.getElementById('zoomSelect').addEventListener('change', (e) => {
            const value = e.target.value;
            if (value === 'fit') {
                fitToScreen();
            } else {
                setZoom(parseFloat(value));
            }
        });
    }

    /**
     * Setup event listeners
     */
    function setupEventListeners() {
        if (!canvasContainer) return;

        // Mouse wheel zoom
        canvasContainer.addEventListener('wheel', handleWheel, { passive: false });

        // Pan with mouse (when holding Space or using Hand tool)
        canvasContainer.addEventListener('mousedown', handlePanStart);
        canvasContainer.addEventListener('mousemove', handlePanMove);
        canvasContainer.addEventListener('mouseup', handlePanEnd);
        canvasContainer.addEventListener('mouseleave', handlePanEnd);

        // Keyboard shortcuts
        document.addEventListener('keydown', handleKeyboard);
    }

    /**
     * Handle mouse wheel for zooming
     */
    function handleWheel(e) {
        // Only zoom if Ctrl/Cmd is held or if using Hand tool
        const shouldZoom = e.ctrlKey || e.metaKey;
        if (!shouldZoom) return;

        e.preventDefault();

        const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP;
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, zoom + delta));

        setZoom(newZoom);
    }

    /**
     * Handle pan start
     */
    function handlePanStart(e) {
        // Only pan with middle mouse button, or Space key, or Hand tool
        const isHandTool = Tools && Tools.getCurrentTool() === Tools.TOOL_TYPES.HAND;
        const isSpaceKey = e.buttons === 1 && spaceKeyPressed;
        const isMiddleMouse = e.button === 1;

        if (isHandTool || isSpaceKey || isMiddleMouse) {
            e.preventDefault();
            isPanning = true;
            lastPanX = e.clientX;
            lastPanY = e.clientY;
            canvasContainer.style.cursor = 'grabbing';
        }
    }

    /**
     * Handle pan move
     */
    function handlePanMove(e) {
        if (!isPanning) return;

        e.preventDefault();

        const deltaX = e.clientX - lastPanX;
        const deltaY = e.clientY - lastPanY;

        panX += deltaX;
        panY += deltaY;

        lastPanX = e.clientX;
        lastPanY = e.clientY;

        updateViewport();
    }

    /**
     * Handle pan end
     */
    function handlePanEnd(e) {
        if (isPanning) {
            isPanning = false;

            // Restore cursor
            const isHandTool = Tools && Tools.getCurrentTool() === Tools.TOOL_TYPES.HAND;
            if (isHandTool) {
                canvasContainer.style.cursor = 'grab';
            } else {
                canvasContainer.style.cursor = '';
            }
        }
    }

    let spaceKeyPressed = false;

    /**
     * Handle keyboard shortcuts
     */
    function handleKeyboard(e) {
        // Track space key for pan
        if (e.code === 'Space' && !e.repeat) {
            if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                spaceKeyPressed = true;
                if (canvasContainer) {
                    canvasContainer.style.cursor = 'grab';
                }
            }
        }

        // Ignore if typing in input
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }

        // Zoom shortcuts
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case '+':
                case '=':
                    e.preventDefault();
                    zoomIn();
                    break;
                case '-':
                case '_':
                    e.preventDefault();
                    zoomOut();
                    break;
                case '0':
                    e.preventDefault();
                    resetView();
                    break;
            }
        }
    }

    // Track space key release
    document.addEventListener('keyup', (e) => {
        if (e.code === 'Space') {
            spaceKeyPressed = false;
            if (canvasContainer && !isPanning) {
                const isHandTool = Tools && Tools.getCurrentTool() === Tools.TOOL_TYPES.HAND;
                if (!isHandTool) {
                    canvasContainer.style.cursor = '';
                }
            }
        }
    });

    /**
     * Zoom in
     */
    function zoomIn() {
        const newZoom = Math.min(MAX_ZOOM, zoom + ZOOM_STEP);
        setZoom(newZoom);
    }

    /**
     * Zoom out
     */
    function zoomOut() {
        const newZoom = Math.max(MIN_ZOOM, zoom - ZOOM_STEP);
        setZoom(newZoom);
    }

    /**
     * Set zoom level
     * @param {number} newZoom - New zoom level
     */
    function setZoom(newZoom) {
        zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, newZoom));
        updateViewport();
        updateZoomUI();
    }

    /**
     * Reset view to default
     */
    function resetView() {
        zoom = 1.0;
        panX = 0;
        panY = 0;
        updateViewport();
        updateZoomUI();
    }

    /**
     * Fit canvas to screen
     */
    function fitToScreen() {
        if (!canvasContainer) return;

        const canvas = document.getElementById('pixelCanvas');
        if (!canvas) return;

        const containerWidth = canvasContainer.clientWidth - 100;
        const containerHeight = canvasContainer.clientHeight - 100;

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const scaleX = containerWidth / canvasWidth;
        const scaleY = containerHeight / canvasHeight;

        zoom = Math.min(scaleX, scaleY, 1.0);
        panX = 0;
        panY = 0;

        updateViewport();
        updateZoomUI();
    }

    /**
     * Update viewport transformation
     */
    function updateViewport() {
        const canvasWrapper = document.querySelector('.canvas-wrapper');
        if (!canvasWrapper) return;

        canvasWrapper.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
        canvasWrapper.style.transformOrigin = 'center center';
    }

    /**
     * Update zoom UI
     */
    function updateZoomUI() {
        const select = document.getElementById('zoomSelect');
        if (!select) return;

        const percentage = Math.round(zoom * 100);

        // Try to find matching preset
        const matchingOption = Array.from(select.options).find(
            opt => opt.value !== 'fit' && Math.abs(parseFloat(opt.value) - zoom) < 0.01
        );

        if (matchingOption) {
            select.value = matchingOption.value;
        } else {
            // Create custom option
            let customOption = select.querySelector('option[data-custom="true"]');
            if (!customOption) {
                customOption = document.createElement('option');
                customOption.dataset.custom = 'true';
                select.insertBefore(customOption, select.options[select.options.length - 1]);
            }
            customOption.value = zoom;
            customOption.textContent = `${percentage}%`;
            select.value = zoom;
        }
    }

    /**
     * Get current zoom level
     * @returns {number} Current zoom
     */
    function getZoom() {
        return zoom;
    }

    /**
     * Get current pan offset
     * @returns {Object} {x, y} pan offset
     */
    function getPan() {
        return { x: panX, y: panY };
    }

    /**
     * Update when canvas size changes
     */
    function updateCanvasSize() {
        // Recalculate if in fit mode
        const select = document.getElementById('zoomSelect');
        if (select && select.value === 'fit') {
            fitToScreen();
        }
    }

    // Public API
    return {
        init,
        zoomIn,
        zoomOut,
        setZoom,
        resetView,
        fitToScreen,
        getZoom,
        getPan,
        updateCanvasSize
    };
})();

if (typeof window !== 'undefined') {
    window.Viewport = Viewport;
}
