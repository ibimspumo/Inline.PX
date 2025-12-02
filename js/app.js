/**
 * App Module - Main Application Controller
 * Coordinates all modules for PixelCreator Pro
 *
 * Features:
 * - Tool system coordination
 * - Keyboard shortcuts
 * - UI state management
 * - File operations
 */

const App = (function() {
    'use strict';

    /**
     * Initialize the application
     */
    function init() {
        console.log('PixelCreator Pro initializing...');

        // Initialize dialog system first
        Dialogs.init();

        // Initialize core modules
        Tools.init(onToolChange);
        ColorPalette.init('colorPalette', onColorChange);
        PixelCanvas.init('pixelCanvas', 16, 16, onCanvasChange);

        // Initialize new modules
        TabManager.init();
        Autosave.init();
        Viewport.init();

        // Setup UI
        setupToolbox();
        setupMenuBar();
        setupPropertiesPanel();
        setupModals();
        setupKeyboardShortcuts();

        // Initial updates
        updateLiveExportPreview();
        updateSizePresetHighlight();

        console.log('PixelCreator Pro ready!');
    }

    /**
     * Handle canvas change (drawing, resizing, etc.)
     */
    function onCanvasChange() {
        updateLiveExportPreview();

        // Mark tab as dirty and trigger autosave
        if (TabManager) {
            TabManager.markCurrentTabDirty();
        }
    }

    /**
     * Setup toolbox with all tools
     */
    function setupToolbox() {
        const toolbox = document.getElementById('toolbox');
        if (!toolbox) return;

        toolbox.innerHTML = '';

        // Create tool buttons
        Object.values(Tools.TOOL_TYPES).forEach(toolType => {
            const info = Tools.getToolInfo(toolType);
            if (!info) return;

            const btn = document.createElement('button');
            btn.className = 'tool-btn';
            btn.dataset.tool = toolType;
            btn.title = `${info.name} (${info.shortcut})`;

            if (toolType === Tools.getCurrentTool()) {
                btn.classList.add('active');
            }

            btn.innerHTML = `
                <span class="tool-icon">${info.icon}</span>
                <span class="tool-label">${info.name}</span>
                <span class="tool-shortcut">${info.shortcut}</span>
            `;

            btn.addEventListener('click', () => {
                Tools.setTool(toolType);
            });

            toolbox.appendChild(btn);
        });
    }

    /**
     * Setup menu bar events
     */
    function setupMenuBar() {
        document.getElementById('newBtn').addEventListener('click', handleNew);
        document.getElementById('saveBtn').addEventListener('click', handleSave);
        document.getElementById('loadBtn').addEventListener('click', handleLoad);
        document.getElementById('exportFileBtn').addEventListener('click', handleExportFile);
        document.getElementById('importStringBtn').addEventListener('click', handleImportString);
        document.getElementById('clearBtn').addEventListener('click', handleClear);
        document.getElementById('copyLiveStringBtn').addEventListener('click', handleCopyLiveString);
    }

    /**
     * Setup properties panel
     */
    function setupPropertiesPanel() {
        // Brush size buttons (in info bar)
        document.querySelectorAll('.tool-size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const size = parseInt(btn.dataset.size);
                Tools.setBrushSize(size);

                document.querySelectorAll('.tool-size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Shape mode buttons (in info bar)
        document.querySelectorAll('.tool-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                Tools.setShapeMode(mode);

                document.querySelectorAll('.tool-mode-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Canvas size presets
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const size = parseInt(btn.dataset.size);
                document.getElementById('canvasWidth').value = size;
                document.getElementById('canvasHeight').value = size;
                handleResize();
            });
        });

        // Resize button
        document.getElementById('resizeBtn').addEventListener('click', handleResize);

        // Enter key on inputs
        ['canvasWidth', 'canvasHeight'].forEach(id => {
            document.getElementById(id).addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleResize();
            });

            document.getElementById(id).addEventListener('input', updateSizePresetHighlight);
        });
    }

    /**
     * Setup modal dialogs
     */
    function setupModals() {
        // Import modal
        const importModal = document.getElementById('importModal');
        document.getElementById('closeImportModal').addEventListener('click', () => {
            importModal.style.display = 'none';
        });
        document.getElementById('cancelImportBtn').addEventListener('click', () => {
            importModal.style.display = 'none';
        });
        document.getElementById('confirmImportBtn').addEventListener('click', handleImportFromString);

        importModal.addEventListener('click', (e) => {
            if (e.target === importModal) {
                importModal.style.display = 'none';
            }
        });

        // File modal
        const fileModal = document.getElementById('fileModal');
        document.getElementById('closeModal').addEventListener('click', () => {
            fileModal.style.display = 'none';
        });

        fileModal.addEventListener('click', (e) => {
            if (e.target === fileModal) {
                fileModal.style.display = 'none';
            }
        });
    }

    /**
     * Setup keyboard shortcuts
     */
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            // Tool shortcuts
            const toolShortcuts = {
                'b': Tools.TOOL_TYPES.BRUSH,
                'p': Tools.TOOL_TYPES.PENCIL,
                'e': Tools.TOOL_TYPES.ERASER,
                'l': Tools.TOOL_TYPES.LINE,
                'r': Tools.TOOL_TYPES.RECTANGLE,
                'o': Tools.TOOL_TYPES.ELLIPSE,
                'f': Tools.TOOL_TYPES.FILL,
                'm': Tools.TOOL_TYPES.SELECT,
                'w': Tools.TOOL_TYPES.MAGIC_WAND,
                'v': Tools.TOOL_TYPES.MOVE,
                'h': Tools.TOOL_TYPES.HAND
            };

            const key = e.key.toLowerCase();

            if (toolShortcuts[key]) {
                e.preventDefault();
                Tools.setTool(toolShortcuts[key]);
                return;
            }

            // File shortcuts
            if (e.ctrlKey || e.metaKey) {
                switch (key) {
                    case 'n':
                        e.preventDefault();
                        handleNew();
                        break;
                    case 's':
                        e.preventDefault();
                        handleSave();
                        break;
                    case 'o':
                        e.preventDefault();
                        handleLoad();
                        break;
                }
            }
        });
    }

    /**
     * Handle tool change
     * @param {string} toolType - New tool type
     * @param {Object} toolInfo - Tool info
     */
    function onToolChange(toolType, toolInfo) {
        // Update tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === toolType);
        });

        // Update current tool display
        const toolName = document.getElementById('currentToolName');
        if (toolName) {
            toolName.textContent = toolInfo.name;
        }

        // Update canvas cursor
        const canvasContainer = document.querySelector('.canvas-container');
        if (canvasContainer) {
            canvasContainer.style.cursor = toolInfo.cursor;
        }

        // Show/hide tool options
        const brushSizeOption = document.getElementById('brushSizeOption');
        const shapeModeOption = document.getElementById('shapeModeOption');

        if (brushSizeOption) {
            brushSizeOption.style.display = toolInfo.hasSizeOption ? 'flex' : 'none';
        }

        if (shapeModeOption) {
            shapeModeOption.style.display = toolInfo.hasShapeOption ? 'flex' : 'none';
        }
    }

    /**
     * Handle color change
     * @param {number} index - Color index
     * @param {string} color - Color hex
     */
    function onColorChange(index, color) {
        const colorDisplay = document.getElementById('currentColorDisplay');
        if (colorDisplay) {
            colorDisplay.style.backgroundColor = color;
        }
    }

    /**
     * Update live export preview
     */
    function updateLiveExportPreview() {
        const dataString = PixelCanvas.exportToString();
        const liveExport = document.getElementById('liveExportString');
        const stringLength = document.getElementById('stringLength');

        if (liveExport) {
            liveExport.textContent = dataString;
        }

        if (stringLength) {
            stringLength.textContent = dataString.length;
        }
    }

    /**
     * Update size preset highlighting
     */
    function updateSizePresetHighlight() {
        const width = parseInt(document.getElementById('canvasWidth').value);
        const height = parseInt(document.getElementById('canvasHeight').value);

        document.querySelectorAll('.preset-btn').forEach(btn => {
            const size = parseInt(btn.dataset.size);
            btn.classList.toggle('active', width === size && height === size);
        });
    }

    /**
     * Handle New
     */
    function handleNew() {
        // Create new tab instead of clearing current
        if (TabManager) {
            TabManager.createNewTab();
        } else {
            // Fallback to old behavior
            if (confirm('Create a new pixel art? Unsaved changes will be lost.')) {
                PixelCanvas.clear();
                FileManager.clearCurrentFileName();
                updateLiveExportPreview();
            }
        }
    }

    /**
     * Handle Save
     */
    async function handleSave() {
        const dataString = PixelCanvas.exportToString();

        // Get name from TabManager if available
        let currentName = FileManager.getCurrentFileName();
        if (TabManager) {
            const tab = TabManager.getCurrentTab();
            if (tab) {
                currentName = tab.name;
            }
        }

        const success = await FileManager.save(dataString, currentName);

        if (success) {
            console.log('Saved successfully');

            // Mark tab as clean
            if (TabManager) {
                TabManager.markCurrentTabClean();
            }

            // Force autosave update
            if (Autosave) {
                Autosave.forceSave();
            }
        }
    }

    /**
     * Handle Load
     */
    function handleLoad() {
        FileManager.showLoadDialog((file) => {
            if (PixelCanvas.importFromString(file.data)) {
                FileManager.setCurrentFileName(file.name);

                // Update tab name
                if (TabManager) {
                    TabManager.setCurrentTabName(file.name);
                    TabManager.markCurrentTabClean();
                }

                updateCanvasSizeInputs();
                updateLiveExportPreview();
            }
        });
    }

    /**
     * Handle Export File
     */
    async function handleExportFile() {
        let dataString = PixelCanvas.exportToString();
        const filename = FileManager.getCurrentFileName() || 'pixelart';

        // Show export dialog with options
        const options = await Dialogs.exportDialog(dataString);

        if (!options) return; // User cancelled

        // Apply compression if requested
        if (options.compress && Compression) {
            const result = Compression.smartCompress(dataString);
            dataString = result.data;
        }

        // Handle different export formats
        switch (options.format) {
            case 'copy-string':
                // Copy to clipboard
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(dataString).then(() => {
                        Dialogs.alert('Copied!', 'Pixel art string copied to clipboard.', 'success');
                    }).catch(() => {
                        fallbackCopyString(dataString);
                    });
                } else {
                    fallbackCopyString(dataString);
                }
                break;

            case 'download-txt':
                // Download as text file
                FileManager.exportAsFile(dataString, filename);
                break;

            case 'download-png':
                // Export as PNG
                if (PNGExport) {
                    const scale = options.scale || 1;
                    const pngFilename = filename.replace(/\.txt$/, '') + '.png';
                    PNGExport.exportToPNG(scale, pngFilename);
                    await Dialogs.alert('PNG Exported!', `Exported as ${pngFilename} at ${scale}× scale.`, 'success');
                } else {
                    await Dialogs.alert('Error', 'PNG export not available.', 'error');
                }
                break;
        }
    }

    /**
     * Fallback copy method
     */
    function fallbackCopyString(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            Dialogs.alert('Copied!', 'Pixel art string copied to clipboard.', 'success');
        } catch (err) {
            Dialogs.alert('Copy Failed', 'Failed to copy to clipboard. Please copy manually.', 'error');
        }

        document.body.removeChild(textarea);
    }

    /**
     * Handle Import String
     */
    function handleImportString() {
        const modal = document.getElementById('importModal');
        const textarea = document.getElementById('importTextarea');

        textarea.value = '';
        modal.style.display = 'flex';
        textarea.focus();
    }

    /**
     * Handle Import from String
     */
    async function handleImportFromString() {
        const textarea = document.getElementById('importTextarea');
        const dataString = textarea.value.trim();

        if (!dataString) {
            await Dialogs.alert('Missing Data', 'Please paste a pixel art string first.', 'warning');
            return;
        }

        if (PixelCanvas.importFromString(dataString)) {
            document.getElementById('importModal').style.display = 'none';
            updateCanvasSizeInputs();
            updateLiveExportPreview();
            FileManager.clearCurrentFileName();
        }
    }

    /**
     * Handle Copy Live String
     */
    function handleCopyLiveString() {
        const dataString = PixelCanvas.exportToString();

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(dataString).then(() => {
                showCopyFeedback();
            }).catch(() => {
                fallbackCopy(dataString);
            });
        } else {
            fallbackCopy(dataString);
        }
    }

    /**
     * Fallback copy method
     */
    function fallbackCopy(text) {
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
            alert('Failed to copy');
        }

        document.body.removeChild(textarea);
    }

    /**
     * Show copy feedback
     */
    function showCopyFeedback() {
        const btn = document.getElementById('copyLiveStringBtn');
        const originalText = btn.textContent;

        btn.textContent = '✓';
        btn.style.background = 'var(--success-color)';

        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 1000);
    }

    /**
     * Handle Clear
     */
    async function handleClear() {
        const confirmed = await Dialogs.confirm(
            'Clear Canvas',
            'Are you sure you want to clear the canvas? This cannot be undone.',
            {
                confirmText: 'Clear',
                cancelText: 'Cancel',
                type: 'warning',
                dangerous: true
            }
        );

        if (confirmed) {
            PixelCanvas.clear();
            updateLiveExportPreview();
        }
    }

    /**
     * Handle Resize
     */
    async function handleResize() {
        const width = parseInt(document.getElementById('canvasWidth').value);
        const height = parseInt(document.getElementById('canvasHeight').value);

        if (isNaN(width) || isNaN(height)) {
            await Dialogs.alert('Invalid Input', 'Please enter valid numbers for width and height.', 'warning');
            return;
        }

        if (width < 2 || width > 128 || height < 2 || height > 128) {
            await Dialogs.alert('Invalid Size', 'Canvas size must be between 2×2 and 128×128 pixels.', 'warning');
            return;
        }

        const dataString = PixelCanvas.exportToString();
        const hasContent = !dataString.split(':')[1].split('').every(c => c === '0');

        if (hasContent) {
            const confirmed = await Dialogs.confirm(
                'Resize Canvas',
                'Resizing may crop or add empty space to your artwork. Continue?',
                {
                    confirmText: 'Resize',
                    cancelText: 'Cancel',
                    type: 'warning'
                }
            );

            if (!confirmed) {
                return;
            }
        }

        if (PixelCanvas.resize(width, height)) {
            updateLiveExportPreview();
            updateSizePresetHighlight();

            // Update viewport if canvas size changed
            if (Viewport) {
                Viewport.updateCanvasSize();
            }
        }
    }

    /**
     * Update canvas size inputs
     */
    function updateCanvasSizeInputs() {
        const dimensions = PixelCanvas.getDimensions();
        document.getElementById('canvasWidth').value = dimensions.width;
        document.getElementById('canvasHeight').value = dimensions.height;
        updateSizePresetHighlight();
    }

    /**
     * Handle window resize
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
