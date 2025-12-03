/**
 * HandTool - Pan Canvas (Viewport Navigation)
 *
 * Professional hand/pan tool:
 * - Pan canvas viewport
 * - Works with Viewport module
 * - Smooth dragging experience
 * - Does not modify pixel data
 *
 * @extends BaseTool
 *
 * @typedef {import('../../types.js').DrawingContext} DrawingContext
 */

import BaseTool from '../BaseTool.js';
// We will need to refactor Viewport module first
// import Viewport from '../../viewport.js'; 

class HandTool extends BaseTool {
    static CONFIG = {
        id: 'hand',
        name: 'Hand',
        icon: 'pan_tool',
        shortcut: 'H',
        cursor: 'grab',
        hasSizeOption: false,
        hasShapeOption: false,
        description: 'Pan canvas',
        category: 'navigation'
    };

    constructor() {
        super();
        this.viewportModule = null; // Will be assigned on init once Viewport is imported
    }

    init() {
        super.init();
        // Get reference to Viewport module if available
        // This will be handled by the app's overall module system
        // For now, assume it's set up in the main app
        // this.viewportModule = Viewport; // This will be assigned when Viewport is refactored
    }

    activate() {
        super.activate();
        // Change cursor to grab
        this.updateCursor('grab');
    }

    respectsSelection() {
        return false; // Hand tool ignores selection
    }

    onDrawStart(x, y, pixelData, context) {
        // Change cursor to grabbing
        this.updateCursor('grabbing');

        // Pan viewport if available
        // Need to ensure Viewport is available and initialized.
        // For now, rely on context providing it, or pass it directly.
        // Or assume it's already set on this.viewportModule in init.
        if (this.viewportModule && this.viewportModule.startPan) {
            this.viewportModule.startPan(x, y);
        }

        return false; // Never modifies pixel data
    }

    onDrawContinue(x, y, pixelData, context) {
        // Continue panning
        if (this.viewportModule && this.viewportModule.continuePan) {
            this.viewportModule.continuePan(x, y);
        }

        return false;
    }

    onDrawEnd(x, y, pixelData, context) {
        // Change cursor back to grab
        this.updateCursor('grab');

        // End panning
        if (this.viewportModule && this.viewportModule.endPan) {
            this.viewportModule.endPan();
        }

        return false;
    }

    onDrawCancel() {
        this.updateCursor('grab');
    }

    /**
     * Update cursor style
     * @private
     */
    updateCursor(cursorStyle) {
        const canvasContainer = document.querySelector('.canvas-container');
        if (canvasContainer) {
            canvasContainer.style.cursor = cursorStyle;
        }
    }

    /**
     * Override getCursor to return dynamic cursor
     */
    getCursor() {
        return this.isDrawing ? 'grabbing' : 'grab';
    }
}

export default HandTool;
