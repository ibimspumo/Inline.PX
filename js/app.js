/**
 * App Module - Main Application Controller (Refactored)
 *
 * Modern architecture with:
 * - Modular tool system with dynamic loading
 * - Event-driven communication via EventBus
 * - JSON-based configuration
 * - Comprehensive error handling
 * - Clean separation of concerns
 *
 * @module App
 */

const App = (function() {
    'use strict';

    // Application state
    let initialized = false;
    let constants = null;

    // Module references (accessed via window to ensure they're loaded)
    const logger = window.Logger;
    const eventBus = window.EventBus;
    const configLoader = window.ConfigLoader;
    const validationUtils = window.ValidationUtils;
    const formatUtils = window.FormatUtils;

    /**
     * Initialize the application
     * @returns {Promise<void>}
     */
    async function init() {
        try {
            logger.info('Inline.px initializing...');

            // Load constants
            constants = await configLoader.loadConstants();
            validationUtils.init(constants);

            // Initialize core systems
            await initializeCoreSystems();

            // Initialize UI
            initializeUI();

            // Setup keyboard shortcuts
            setupKeyboardShortcuts();

            // Mark as initialized
            initialized = true;

            logger.info('Inline.px ready!');
            eventBus.emit(eventBus.Events.APP_READY);

        } catch (error) {
            logger.error('Application initialization failed', error);
            eventBus.emit(eventBus.Events.APP_ERROR, error);

            if (window.Dialogs) {
                await window.Dialogs.alert('Initialization Error', `Failed to initialize application: ${error.message}`, 'error');
            } else {
                alert(`Initialization failed: ${error.message}`);
            }
        }
    }

    /**
     * Initialize core systems
     * @private
     */
    async function initializeCoreSystems() {
        // Initialize dialogs
        if (window.Dialogs) {
            window.Dialogs.init();
        }

        // Initialize color palette
        if (window.ColorPalette) {
            await window.ColorPalette.init('colorPalette', onColorChange);
        } else {
            throw new Error('ColorPalette module not available');
        }

        // Initialize canvas
        if (window.PixelCanvas) {
            const defaultWidth = constants?.canvas?.defaultWidth || 16;
            const defaultHeight = constants?.canvas?.defaultHeight || 16;
            await window.PixelCanvas.init('pixelCanvas', defaultWidth, defaultHeight, onCanvasChange);
        } else {
            throw new Error('PixelCanvas module not available');
        }

        // Register and initialize tools
        await initializeTools();

        // Initialize other modules
        if (window.TabManager) {
            window.TabManager.init();
        }

        if (window.Autosave) {
            window.Autosave.init();
        }

        if (window.Viewport) {
            window.Viewport.init();
        }

        if (window.History) {
            window.History.init({
                onHistoryChange: updateHistoryUI
            });
        }

        logger.info('Core systems initialized');
    }

    /**
     * Initialize and register all tools
     * @private
     */
    async function initializeTools() {
        if (!window.ToolRegistry) {
            throw new Error('ToolRegistry not available');
        }

        // Initialize tool registry
        window.ToolRegistry.init({
            onToolChange,
            onToolOptionChange: onToolOptionChange,
            sharedOptions: {
                brushSize: constants?.tools?.defaultBrushSize || 1,
                shapeMode: constants?.tools?.defaultShapeMode || 'fill',
                colorCode: 1
            }
        });

        // Register all tools
        const toolClasses = [
            window.BrushTool,
            window.PencilTool,
            window.EraserTool,
            window.LineTool,
            window.RectangleTool,
            window.EllipseTool,
            window.FillTool,
            window.SelectTool,
            window.MagicWandTool,
            window.MoveTool,
            window.HandTool
        ];

        const registered = window.ToolRegistry.registerTools(toolClasses.filter(Boolean));
        logger.info(`Registered ${registered} tools`);

        // Set default tool (brush)
        window.ToolRegistry.setCurrentTool('brush');
    }

    /**
     * Initialize UI elements
     * @private
     */
    function initializeUI() {
        setupToolbox();
        setupMenuBar();
        setupPropertiesPanel();
        updateLiveExportPreview();
        updateSizePresetHighlight();
    }

    /**
     * Setup toolbox with dynamic tool loading
     * @private
     */
    function setupToolbox() {
        const toolbox = document.getElementById('toolbox');
        if (!toolbox || !window.ToolRegistry) return;

        toolbox.innerHTML = '';

        const tools = window.ToolRegistry.getAllTools();

        tools.forEach(toolConfig => {
            const btn = document.createElement('button');
            btn.className = 'tool-btn';
            btn.dataset.tool = toolConfig.id;
            btn.title = `${toolConfig.name} (${toolConfig.shortcut})`;

            if (toolConfig.id === window.ToolRegistry.getCurrentToolId()) {
                btn.classList.add('active');
            }

            btn.innerHTML = `
                <span class="material-symbols-outlined tool-icon">${toolConfig.icon}</span>
                <span class="tool-label">${toolConfig.name}</span>
                <span class="tool-shortcut">${toolConfig.shortcut}</span>
            `;

            btn.addEventListener('click', () => {
                window.ToolRegistry.setCurrentTool(toolConfig.id);
            });

            toolbox.appendChild(btn);
        });

        logger.debug('Toolbox setup complete');
    }

    /**
     * Setup menu bar events
     * @private
     */
    function setupMenuBar() {
        bindEvent('newBtn', handleNew);
        bindEvent('saveBtn', handleSave);
        bindEvent('loadBtn', handleLoad);
        bindEvent('undoBtn', handleUndo);
        bindEvent('redoBtn', handleRedo);
        bindEvent('exportFileBtn', handleExportFile);
        bindEvent('importStringBtn', handleImportString);
        bindEvent('clearBtn', handleClear);
        bindEvent('copyLiveStringBtn', handleCopyLiveString);
    }

    /**
     * Setup properties panel
     * @private
     */
    function setupPropertiesPanel() {
        // Brush size buttons
        document.querySelectorAll('.tool-size-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const size = parseInt(btn.dataset.size);
                if (window.ToolRegistry) {
                    window.ToolRegistry.setToolOption('brushSize', size);
                }

                document.querySelectorAll('.tool-size-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Shape mode buttons
        document.querySelectorAll('.tool-mode-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const mode = btn.dataset.mode;
                if (window.ToolRegistry) {
                    window.ToolRegistry.setToolOption('shapeMode', mode);
                }

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
        bindEvent('resizeBtn', handleResize);

        // Enter key on inputs
        ['canvasWidth', 'canvasHeight'].forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') handleResize();
                });
                input.addEventListener('input', updateSizePresetHighlight);
            }
        });
    }

    /**
     * Setup keyboard shortcuts
     * @private
     */
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ignore if typing in input
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                return;
            }

            const key = e.key.toLowerCase();

            // Escape key - clear selection
            if (e.key === 'Escape') {
                e.preventDefault();
                if (window.ToolRegistry) {
                    window.ToolRegistry.clearSelection();
                }
                if (window.PixelCanvas) {
                    window.PixelCanvas.clearSelectionOverlay();
                }
                return;
            }

            // Tool shortcuts
            if (window.ToolRegistry && /^[a-z]$/.test(key)) {
                const tool = window.ToolRegistry.getToolByShortcut(key.toUpperCase());
                if (tool) {
                    e.preventDefault();
                    window.ToolRegistry.setCurrentTool(tool.getId());
                    return;
                }
            }

            // Keyboard shortcuts with Ctrl/Cmd
            if (e.ctrlKey || e.metaKey) {
                switch (key) {
                    case 'z':
                        e.preventDefault();
                        if (e.shiftKey) {
                            handleRedo();
                        } else {
                            handleUndo();
                        }
                        break;
                    case 'y':
                        e.preventDefault();
                        handleRedo();
                        break;
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

    // ==================== EVENT HANDLERS ====================

    /**
     * Handle tool change
     * @private
     */
    function onToolChange(toolId, toolConfig) {
        // Update tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tool === toolId);
        });

        // Update current tool display
        const toolName = document.getElementById('currentToolName');
        if (toolName) {
            toolName.textContent = toolConfig.name;
        }

        // Update canvas cursor
        const canvasContainer = document.querySelector('.canvas-container');
        if (canvasContainer) {
            canvasContainer.style.cursor = toolConfig.cursor;
        }

        // Show/hide tool options
        const brushSizeOption = document.getElementById('brushSizeOption');
        const shapeModeOption = document.getElementById('shapeModeOption');

        if (brushSizeOption) {
            brushSizeOption.style.display = toolConfig.hasSizeOption ? 'flex' : 'none';
        }

        if (shapeModeOption) {
            shapeModeOption.style.display = toolConfig.hasShapeOption ? 'flex' : 'none';
        }

        logger.debug(`Tool changed to: ${toolConfig.name}`);
    }

    /**
     * Handle tool option change
     * @private
     */
    function onToolOptionChange(key, value, oldValue) {
        logger.debug(`Tool option changed: ${key} = ${value}`);
    }

    /**
     * Handle color change
     * @private
     */
    function onColorChange(index, color) {
        const colorDisplay = document.getElementById('currentColorDisplay');
        if (colorDisplay) {
            colorDisplay.style.backgroundColor = color;
        }

        // Update tool registry color
        if (window.ToolRegistry) {
            window.ToolRegistry.setToolOption('colorCode', index);
        }
    }

    /**
     * Handle canvas change
     * @private
     */
    function onCanvasChange() {
        updateLiveExportPreview();

        // Mark tab as dirty
        if (window.TabManager) {
            window.TabManager.markCurrentTabDirty();
        }

        // Save state to history (debounced)
        const debounceTime = constants?.history?.debounceTime || 500;
        clearTimeout(window.historyDebounceTimer);
        window.historyDebounceTimer = setTimeout(() => {
            if (pixelCanvas && window.History) {
                const currentState = window.PixelCanvas.exportToString();
                window.History.pushState(currentState, 'Paint');
            }
        }, debounceTime);
    }

    /**
     * Update live export preview
     * @private
     */
    function updateLiveExportPreview() {
        if (!window.PixelCanvas) return;

        const dataString = window.PixelCanvas.exportToString();
        const liveExport = document.getElementById('liveExportString');
        const stringLength = document.getElementById('stringLength');

        if (liveExport && formatUtils) {
            liveExport.textContent = formatUtils.formatDataString(dataString, 50);
        } else if (liveExport) {
            liveExport.textContent = dataString;
        }

        if (stringLength) {
            stringLength.textContent = dataString.length;
        }
    }

    /**
     * Update size preset highlighting
     * @private
     */
    function updateSizePresetHighlight() {
        const width = parseInt(document.getElementById('canvasWidth')?.value);
        const height = parseInt(document.getElementById('canvasHeight')?.value);

        document.querySelectorAll('.preset-btn').forEach(btn => {
            const size = parseInt(btn.dataset.size);
            btn.classList.toggle('active', width === size && height === size);
        });
    }

    // ==================== MENU HANDLERS ====================

    async function handleNew() {
        if (window.TabManager) {
            window.TabManager.createNewTab();
        } else {
            const confirmed = await window.Dialogs.confirm(
                'Create New',
                'Create a new pixel art? Unsaved changes will be lost.',
                { confirmText: 'Create', type: 'warning' }
            );

            if (confirmed && pixelCanvas) {
                window.PixelCanvas.clear();
                if (window.FileManager) {
                    window.FileManager.clearCurrentFileName();
                }
                updateLiveExportPreview();
            }
        }
    }

    async function handleSave() {
        if (!window.PixelCanvas || !window.FileManager) return;

        const dataString = window.PixelCanvas.exportToString();
        let currentName = window.FileManager.getCurrentFileName();

        if (window.TabManager) {
            const tab = window.TabManager.getCurrentTab();
            if (tab) currentName = tab.name;
        }

        const success = await window.FileManager.save(dataString, currentName);

        if (success) {
            logger.info('Saved successfully');

            if (window.TabManager) {
                window.TabManager.markCurrentTabClean();
            }

            if (window.Autosave) {
                window.Autosave.forceSave();
            }
        }
    }

    function handleLoad() {
        if (!window.PixelCanvas || !window.FileManager) return;

        window.FileManager.showLoadDialog((file) => {
            if (window.PixelCanvas.importFromString(file.data)) {
                window.FileManager.setCurrentFileName(file.name);

                if (window.TabManager) {
                    window.TabManager.setCurrentTabName(file.name);
                    window.TabManager.markCurrentTabClean();
                }

                updateCanvasSizeInputs();
                updateLiveExportPreview();
            }
        });
    }

    async function handleExportFile() {
        if (!window.PixelCanvas || !window.FileManager || !window.Dialogs) return;

        let dataString = window.PixelCanvas.exportToString();
        const filename = window.FileManager.getCurrentFileName() || 'pixelart';

        const options = await window.Dialogs.exportDialog(dataString);
        if (!options) return;

        // Apply compression if requested
        if (options.compress && window.Compression) {
            const result = window.Compression.smartCompress(dataString);
            dataString = result.data;
        }

        // Handle export format
        switch (options.format) {
            case 'copy-string':
                await window.ClipboardUtils.copyWithFeedback(dataString);
                await window.Dialogs.alert('Copied!', 'Pixel art string copied to clipboard.', 'success');
                break;

            case 'download-txt':
                window.FileManager.exportAsFile(dataString, filename);
                break;

            case 'download-png':
                if (window.PNGExport) {
                    const scale = options.scale || 1;
                    const pngFilename = filename.replace(/\.txt$/, '') + '.png';
                    window.PNGExport.exportToPNG(scale, pngFilename);
                    await window.Dialogs.alert('PNG Exported!', `Exported as ${pngFilename} at ${scale}× scale.`, 'success');
                }
                break;
        }
    }

    function handleImportString() {
        const modal = document.getElementById('importModal');
        const textarea = document.getElementById('importTextarea');

        if (modal && textarea) {
            textarea.value = '';
            modal.style.display = 'flex';
            textarea.focus();
        }
    }

    async function handleClear() {
        if (!window.PixelCanvas || !window.Dialogs) return;

        const confirmed = await window.Dialogs.confirm(
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
            window.PixelCanvas.clear();
            updateLiveExportPreview();
        }
    }

    async function handleCopyLiveString() {
        if (!window.PixelCanvas) return;

        const dataString = window.PixelCanvas.exportToString();
        const btn = document.getElementById('copyLiveStringBtn');

        await window.ClipboardUtils.copyWithFeedback(dataString, btn);
    }

    async function handleResize() {
        if (!window.PixelCanvas || !window.Dialogs || !validationUtils) return;

        const width = parseInt(document.getElementById('canvasWidth')?.value);
        const height = parseInt(document.getElementById('canvasHeight')?.value);

        const validation = validationUtils.validateCanvasDimensions(width, height);
        if (!validation.valid) {
            await window.Dialogs.alert('Invalid Size', validation.error, 'warning');
            return;
        }

        const dataString = window.PixelCanvas.exportToString();
        const hasContent = !dataString.split(':')[1].split('').every(c => c === '0');

        if (hasContent) {
            const confirmed = await window.Dialogs.confirm(
                'Resize Canvas',
                'Resizing may crop or add empty space to your artwork. Continue?',
                { confirmText: 'Resize', type: 'warning' }
            );

            if (!confirmed) return;
        }

        if (window.PixelCanvas.resize(width, height)) {
            updateLiveExportPreview();
            updateSizePresetHighlight();

            if (window.Viewport) {
                window.Viewport.updateCanvasSize();
            }
        }
    }

    function handleUndo() {
        if (!window.History || !window.PixelCanvas) return;

        if (!window.History.canUndo()) {
            logger.debug('Nothing to undo');
            return;
        }

        const currentState = window.PixelCanvas.exportToString();
        const previousState = window.History.undo(currentState);

        if (previousState) {
            window.PixelCanvas.importFromString(previousState);
            updateCanvasSizeInputs();
            updateLiveExportPreview();
            logger.info('Undo performed');
        }
    }

    function handleRedo() {
        if (!window.History || !window.PixelCanvas) return;

        if (!window.History.canRedo()) {
            logger.debug('Nothing to redo');
            return;
        }

        const currentState = window.PixelCanvas.exportToString();
        const nextState = window.History.redo(currentState);

        if (nextState) {
            window.PixelCanvas.importFromString(nextState);
            updateCanvasSizeInputs();
            updateLiveExportPreview();
            logger.info('Redo performed');
        }
    }

    function updateHistoryUI(state) {
        const undoBtn = document.getElementById('undoBtn');
        const redoBtn = document.getElementById('redoBtn');

        if (undoBtn) {
            undoBtn.disabled = !state.canUndo;
            undoBtn.title = state.canUndo
                ? `Undo (Ctrl+Z) - ${state.undoCount} states available`
                : 'Undo (Ctrl+Z)';
        }

        if (redoBtn) {
            redoBtn.disabled = !state.canRedo;
            redoBtn.title = state.canRedo
                ? `Redo (Ctrl+Y) - ${state.redoCount} states available`
                : 'Redo (Ctrl+Y)';
        }
    }

    function updateCanvasSizeInputs() {
        if (!window.PixelCanvas) return;

        const dimensions = window.PixelCanvas.getDimensions();
        const widthInput = document.getElementById('canvasWidth');
        const heightInput = document.getElementById('canvasHeight');

        if (widthInput) widthInput.value = dimensions.width;
        if (heightInput) heightInput.value = dimensions.height;

        updateSizePresetHighlight();
    }

    // ==================== UTILITY FUNCTIONS ====================

    function bindEvent(elementId, handler) {
        const element = document.getElementById(elementId);
        if (element) {
            element.addEventListener('click', handler);
        }
    }

    // ==================== PUBLIC API ====================

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    return {
        init,
        updateLiveExportPreview
    };
})();

// Make available globally
if (typeof window !== 'undefined') {
    window.App = App;
}
