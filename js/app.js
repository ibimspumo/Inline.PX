/**
 * App Module - Main Application Controller
 *
 * Coordinates all modules and handles user interactions.
 * This is the main entry point for the application.
 *
 * Features:
 * - Initialize all modules
 * - Handle toolbar actions
 * - Manage import/export dialogs
 * - Live export string preview
 * - Coordinate between modules
 */

const App = (function() {
    'use strict';

    /**
     * Initialize the application
     */
    function init() {
        console.log('PixelCreator initializing...');

        // Initialize color palette
        ColorPalette.init('colorPalette', onColorChange);

        // Initialize canvas with live preview callback
        PixelCanvas.init('pixelCanvas', 8, 8, updateLiveExportPreview);

        // Setup toolbar event listeners
        setupToolbarEvents();

        // Setup control events
        setupControlEvents();

        // Setup modal events
        setupModalEvents();

        // Initial live preview update
        updateLiveExportPreview();

        console.log('PixelCreator ready!');
    }

    /**
     * Setup toolbar button event listeners
     */
    function setupToolbarEvents() {
        // New button
        document.getElementById('newBtn').addEventListener('click', handleNew);

        // Save button
        document.getElementById('saveBtn').addEventListener('click', handleSave);

        // Load button
        document.getElementById('loadBtn').addEventListener('click', handleLoad);

        // Export file button
        document.getElementById('exportFileBtn').addEventListener('click', handleExportFile);

        // Import string button
        document.getElementById('importStringBtn').addEventListener('click', handleImportString);

        // Clear button
        document.getElementById('clearBtn').addEventListener('click', handleClear);

        // Copy live string button
        document.getElementById('copyLiveStringBtn').addEventListener('click', handleCopyLiveString);
    }

    /**
     * Setup control panel event listeners
     */
    function setupControlEvents() {
        // Resize button
        document.getElementById('resizeBtn').addEventListener('click', handleResize);

        // Size presets
        document.querySelectorAll('.size-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const size = parseInt(btn.dataset.size);
                handlePresetSize(size);
            });
        });

        // Allow Enter key on input fields to trigger resize
        document.getElementById('canvasWidth').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleResize();
        });

        document.getElementById('canvasHeight').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleResize();
        });

        // Update input fields when typing
        document.getElementById('canvasWidth').addEventListener('input', updateSizePresetHighlight);
        document.getElementById('canvasHeight').addEventListener('input', updateSizePresetHighlight);
    }

    /**
     * Setup modal event listeners
     */
    function setupModalEvents() {
        // Import modal
        const importModal = document.getElementById('importModal');
        const closeImportBtn = document.getElementById('closeImportModal');
        const cancelImportBtn = document.getElementById('cancelImportBtn');
        const confirmImportBtn = document.getElementById('confirmImportBtn');

        closeImportBtn.addEventListener('click', () => {
            importModal.style.display = 'none';
        });

        cancelImportBtn.addEventListener('click', () => {
            importModal.style.display = 'none';
        });

        confirmImportBtn.addEventListener('click', handleImportFromString);

        // Close on outside click
        importModal.addEventListener('click', (e) => {
            if (e.target === importModal) {
                importModal.style.display = 'none';
            }
        });
    }

    /**
     * Handle color change event
     * @param {number} code - Color code
     * @param {string} color - Color hex value
     */
    function onColorChange(code, color) {
        // Update top bar display
        const preview = document.getElementById('currentColorDisplay');
        if (preview) {
            preview.style.backgroundColor = color;
        }
    }

    /**
     * Update live export string preview
     */
    function updateLiveExportPreview() {
        const dataString = PixelCanvas.exportToString();
        const liveExportElement = document.getElementById('liveExportString');
        const stringLengthElement = document.getElementById('stringLength');

        if (liveExportElement) {
            liveExportElement.textContent = dataString;
        }

        if (stringLengthElement) {
            stringLengthElement.textContent = dataString.length;
        }
    }

    /**
     * Handle preset size button click
     * @param {number} size - Preset size (8, 16, 32, 64)
     */
    function handlePresetSize(size) {
        document.getElementById('canvasWidth').value = size;
        document.getElementById('canvasHeight').value = size;
        handleResize();
    }

    /**
     * Update size preset button highlighting
     */
    function updateSizePresetHighlight() {
        const width = parseInt(document.getElementById('canvasWidth').value);
        const height = parseInt(document.getElementById('canvasHeight').value);

        document.querySelectorAll('.size-preset').forEach(btn => {
            const size = parseInt(btn.dataset.size);
            if (width === size && height === size) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    /**
     * Handle New button click
     */
    function handleNew() {
        if (confirm('Create a new pixel art? Unsaved changes will be lost.')) {
            PixelCanvas.clear();
            FileManager.clearCurrentFileName();
            updateLiveExportPreview();
            console.log('New canvas created');
        }
    }

    /**
     * Handle Save button click
     */
    function handleSave() {
        const dataString = PixelCanvas.exportToString();
        const currentName = FileManager.getCurrentFileName();

        if (FileManager.save(dataString, currentName)) {
            console.log('Saved successfully');
        }
    }

    /**
     * Handle Load button click
     */
    function handleLoad() {
        FileManager.showLoadDialog((file) => {
            console.log('Loading file:', file.name);

            if (PixelCanvas.importFromString(file.data)) {
                FileManager.setCurrentFileName(file.name);
                updateCanvasSizeInputs();
                updateLiveExportPreview();
                console.log('Loaded successfully');
            }
        });
    }

    /**
     * Handle Export File button click
     */
    function handleExportFile() {
        const dataString = PixelCanvas.exportToString();
        const filename = FileManager.getCurrentFileName() || 'pixelart';

        FileManager.exportAsFile(dataString, filename);
        console.log('Exported as file');
    }

    /**
     * Handle Import String button click
     */
    function handleImportString() {
        const modal = document.getElementById('importModal');
        const textarea = document.getElementById('importTextarea');

        textarea.value = '';
        modal.style.display = 'flex';
        textarea.focus();
    }

    /**
     * Handle Import from String button click (in modal)
     */
    function handleImportFromString() {
        const textarea = document.getElementById('importTextarea');
        const dataString = textarea.value.trim();

        if (!dataString) {
            alert('Please paste a pixel art string first');
            return;
        }

        if (PixelCanvas.importFromString(dataString)) {
            document.getElementById('importModal').style.display = 'none';
            updateCanvasSizeInputs();
            updateLiveExportPreview();
            FileManager.clearCurrentFileName();
            console.log('Imported successfully');
        }
    }

    /**
     * Handle Copy Live String button click
     */
    function handleCopyLiveString() {
        const dataString = PixelCanvas.exportToString();

        // Modern clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(dataString).then(() => {
                showCopyFeedback();
            }).catch(() => {
                fallbackCopyToClipboard(dataString);
            });
        } else {
            fallbackCopyToClipboard(dataString);
        }
    }

    /**
     * Fallback copy method for older browsers
     * @param {string} text - Text to copy
     */
    function fallbackCopyToClipboard(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            showCopyFeedback();
        } catch (err) {
            alert('Failed to copy. Please copy manually.');
        }

        document.body.removeChild(textarea);
    }

    /**
     * Show visual feedback when copying
     */
    function showCopyFeedback() {
        const btn = document.getElementById('copyLiveStringBtn');
        const originalText = btn.textContent;

        btn.textContent = '✓';
        btn.style.backgroundColor = 'var(--success-color)';

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
        }, 1000);
    }

    /**
     * Handle Clear button click
     */
    function handleClear() {
        if (confirm('Clear the canvas? This cannot be undone.')) {
            PixelCanvas.clear();
            updateLiveExportPreview();
            console.log('Canvas cleared');
        }
    }

    /**
     * Handle Resize button click
     */
    function handleResize() {
        const widthInput = document.getElementById('canvasWidth');
        const heightInput = document.getElementById('canvasHeight');

        const newWidth = parseInt(widthInput.value);
        const newHeight = parseInt(heightInput.value);

        // Validate
        if (isNaN(newWidth) || isNaN(newHeight)) {
            alert('Please enter valid numbers for width and height');
            return;
        }

        if (newWidth < 2 || newWidth > 64 || newHeight < 2 || newHeight > 64) {
            alert('Width and height must be between 2 and 64');
            return;
        }

        // Confirm if canvas has content
        const dataString = PixelCanvas.exportToString();
        const hasContent = !dataString.split(':')[1].split('').every(c => c === '0');

        if (hasContent) {
            if (!confirm('Resizing may crop or add space to your artwork. Continue?')) {
                return;
            }
        }

        // Resize
        if (PixelCanvas.resize(newWidth, newHeight)) {
            updateLiveExportPreview();
            updateSizePresetHighlight();
            console.log(`Canvas resized to ${newWidth}x${newHeight}`);
        }
    }

    /**
     * Update canvas size input fields based on current canvas dimensions
     */
    function updateCanvasSizeInputs() {
        const dimensions = PixelCanvas.getDimensions();
        document.getElementById('canvasWidth').value = dimensions.width;
        document.getElementById('canvasHeight').value = dimensions.height;
        updateSizePresetHighlight();
    }

    /**
     * Handle window resize for responsive canvas
     */
    function handleWindowResize() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const dimensions = PixelCanvas.getDimensions();
                PixelCanvas.resize(dimensions.width, dimensions.height);
                updateLiveExportPreview();
            }, 250);
        });
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            init();
            handleWindowResize();
        });
    } else {
        init();
        handleWindowResize();
    }

    // Public API
    return {
        init,
        updateLiveExportPreview
    };
})();
