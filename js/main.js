/**
 * Main Application Controller
 *
 * This module initializes the entire application, loads all necessary modules,
 * and sets up the core event listeners and UI. It serves as the main entry
 * point for the application when using an ES module-based architecture.
 *
 * @module App
 */

// Core Modules
import logger from './core/Logger.js';
import eventBus from './core/EventBus.js';
import configLoader from './core/ConfigLoader.js';

// Utility Modules
import validationUtils from './utils/ValidationUtils.js';
import formatUtils from './utils/FormatUtils.js';
import clipboardUtils from './utils/ClipboardUtils.js';

// UI and System Modules
import Dialogs from './dialogs.js';
import ColorPalette from './colorPalette.js';
import PixelCanvas from './canvas/PixelCanvas.js';
import CanvasRenderer from './canvas/CanvasRenderer.js';
import ToolRegistry from './tools/ToolRegistry.js';
import TabManager from './tabManager.js';
import FileManager from './fileManager.js';
import Autosave from './autosave.js';
import Viewport from './viewport.js';
import History from './history.js';
import Compression from './compression.js';
import PNGExport from './pngExport.js';
import ContextMenu from './contextMenu.js';

// Tool Implementations
import BrushTool from './tools/implementations/BrushTool.js';
import PencilTool from './tools/implementations/PencilTool.js';
import EraserTool from './tools/implementations/EraserTool.js';
import LineTool from './tools/implementations/LineTool.js';
import RectangleTool from './tools/implementations/RectangleTool.js';
import EllipseTool from './tools/implementations/EllipseTool.js';
import FillTool from './tools/implementations/FillTool.js';
import SelectTool from './tools/implementations/SelectTool.js';
import MagicWandTool from './tools/implementations/MagicWandTool.js';
import MoveTool from './tools/implementations/MoveTool.js';
import HandTool from './tools/implementations/HandTool.js';

// Application state
let initialized = false;
let constants = null;
let historyDebounceTimer = null;

/**
 * Initialize the application.
 * @returns {Promise<void>}
 */
async function init() {
    if (initialized) {
        logger.warn('Application already initialized.');
        return;
    }

    try {
        logger.info('Inline.px initializing...');

        constants = await configLoader.loadConstants();
        validationUtils.init(constants);

        await initializeCoreSystems();
        initializeUI();
        setupKeyboardShortcuts();
        setupEventListeners();

        initialized = true;
        logger.info('Inline.px ready!');
        eventBus.emit('app:ready');

    } catch (error) {
        logger.error('Application initialization failed', error);
        eventBus.emit('app:error', error);
        alert(`Critical error during initialization: ${error.message}. The app may not function correctly.`);
    }
}

/**
 * Initialize core systems like canvas, tools, and other managers.
 * @private
 */
async function initializeCoreSystems() {
    Dialogs.init();
    await ColorPalette.init('colorPalette', onColorChange);

    const { defaultWidth, defaultHeight } = constants.canvas;
    await PixelCanvas.init('pixelCanvas', defaultWidth, defaultHeight, onCanvasChange);

    await initializeTools();

    TabManager.init(false); // Don't auto-restore tabs - show welcome screen instead
    Autosave.init();
    Viewport.init();
    History.init({ onHistoryChange: updateHistoryUI });
    ContextMenu.init();

    logger.info('Core systems initialized');
}

/**
 * Register all available tools with the ToolRegistry.
 * @private
 */
async function initializeTools() {
    const toolClasses = [
        BrushTool, PencilTool, EraserTool, LineTool, RectangleTool,
        EllipseTool, FillTool, SelectTool, MagicWandTool, MoveTool, HandTool
    ];

    ToolRegistry.init({
        onToolChange,
        onToolOptionChange,
        sharedOptions: {
            brushSize: constants.tools.defaultBrushSize,
            shapeMode: constants.tools.defaultShapeMode,
            colorCode: 1
        }
    });

    const registered = ToolRegistry.registerTools(toolClasses);
    logger.info(`Registered ${registered} tools`);
    ToolRegistry.setCurrentTool('brush');
}

/**
 * Initialize main UI elements and event listeners.
 * @private
 */
function initializeUI() {
    setupToolbox();
    setupMenuBar();
    setupPropertiesPanel();
    setupWelcomeScreen();
    setupContextMenus();
    updateLiveExportPreview();
    updateSizePresetHighlight();
}

/**
 * Dynamically generate tool buttons in the toolbox.
 * @private
 */
function setupToolbox() {
    const toolbox = document.getElementById('toolbox');
    if (!toolbox) return;

    toolbox.innerHTML = '';
    const tools = ToolRegistry.getAllTools();
    tools.forEach(toolConfig => {
        const btn = document.createElement('button');
        btn.className = 'tool-btn';
        btn.dataset.tool = toolConfig.id;
        btn.title = `${toolConfig.name} (${toolConfig.shortcut})`;

        if (toolConfig.id === ToolRegistry.getCurrentToolId()) {
            btn.classList.add('active');
        }

        btn.innerHTML = `<span class="material-symbols-outlined tool-icon">${toolConfig.icon}</span><span class="tool-label">${toolConfig.name}</span><span class="tool-shortcut">${toolConfig.shortcut}</span>`;
        btn.addEventListener('click', () => ToolRegistry.setCurrentTool(toolConfig.id));
        toolbox.appendChild(btn);
    });

    logger.debug('Toolbox setup complete');
}

/**
 * Bind event listeners for the main menu bar.
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
 * Bind event listeners for the properties panel.
 * @private
 */
function setupPropertiesPanel() {
    document.querySelectorAll('.tool-size-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const size = parseInt(btn.dataset.size);
            ToolRegistry.setToolOption('brushSize', size);
            document.querySelectorAll('.tool-size-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    document.querySelectorAll('.tool-mode-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            ToolRegistry.setToolOption('shapeMode', mode);
            document.querySelectorAll('.tool-mode-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const size = parseInt(btn.dataset.size);
            document.getElementById('canvasWidth').value = size;
            document.getElementById('canvasHeight').value = size;
            handleResize();
        });
    });

    bindEvent('resizeBtn', handleResize);
    ['canvasWidth', 'canvasHeight'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('keypress', (e) => e.key === 'Enter' && handleResize());
            input.addEventListener('input', updateSizePresetHighlight);
        }
    });

    // Grid toggle
    bindEvent('gridToggleBtn', handleGridToggle);
}

/**
 * Setup welcome screen and its event handlers
 * @private
 */
function setupWelcomeScreen() {
    // Welcome screen "Create New" button
    bindEvent('welcomeNewBtn', showNewFileDialog);

    // Welcome screen "Open File" button
    bindEvent('welcomeLoadBtn', showOpenFileDialog);

    // New File Modal handlers
    bindEvent('closeNewFileModal', closeNewFileModal);
    bindEvent('cancelNewFileBtn', closeNewFileModal);
    bindEvent('confirmNewFileBtn', handleCreateNewFile);

    // File Modal close handler
    bindEvent('closeModal', () => {
        document.getElementById('fileModal').style.display = 'none';
    });

    // New File Modal preset buttons
    document.querySelectorAll('.preset-btn-modal').forEach(btn => {
        btn.addEventListener('click', () => {
            const size = parseInt(btn.dataset.size);
            document.getElementById('newFileWidth').value = size;
            document.getElementById('newFileHeight').value = size;
            document.querySelectorAll('.preset-btn-modal').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });

    // Sync preset buttons with manual input
    ['newFileWidth', 'newFileHeight'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', () => {
                const width = parseInt(document.getElementById('newFileWidth').value);
                const height = parseInt(document.getElementById('newFileHeight').value);
                document.querySelectorAll('.preset-btn-modal').forEach(btn => {
                    const size = parseInt(btn.dataset.size);
                    btn.classList.toggle('active', width === size && height === size);
                });
            });
        }
    });

    logger.debug('Welcome screen setup complete');
}

/**
 * Setup context menus for different UI areas
 * @private
 */
function setupContextMenus() {
    // Use event delegation on document for all context menus
    document.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        logger.info?.('Context menu triggered at:', e.clientX, e.clientY);

        // Check if clicked on canvas
        const canvasContainer = e.target.closest('#canvasContainer');
        if (canvasContainer) {
            const context = {
                canUndo: History?.canUndo() || false,
                canRedo: History?.canRedo() || false,
                hasSelection: false, // TODO: Implement selection detection
                hasClipboard: false // TODO: Implement clipboard check
            };
            ContextMenu.show(e.clientX, e.clientY, ContextMenu.getCanvasMenuItems(context), context);
            return;
        }

        // Check if clicked on color palette
        const colorSwatch = e.target.closest('.color-swatch');
        if (colorSwatch) {
            const colorIndex = parseInt(colorSwatch.dataset.index);
            const color = ColorPalette.getColor(colorIndex);

            const context = {
                colorIndex: colorIndex,
                color: colorSwatch.dataset.char || '0',
                hex: color || '#000000'
            };
            ContextMenu.show(e.clientX, e.clientY, ContextMenu.getPaletteMenuItems(context), context);
            return;
        }

        // Check if clicked on tab
        const tab = e.target.closest('.tab');
        if (tab) {
            const tabId = tab.dataset.tabId;
            const allTabs = TabManager?.getAllTabs() || [];

            const context = {
                tabId: tabId,
                hasMultipleTabs: allTabs.length > 1
            };
            ContextMenu.show(e.clientX, e.clientY, ContextMenu.getTabMenuItems(context), context);
            return;
        }

        // Check if clicked on file item
        const fileItem = e.target.closest('.file-grid-item');
        if (fileItem) {
            logger.info?.('File item detected:', fileItem);
            const fileName = fileItem.querySelector('.file-grid-name')?.textContent || 'Unknown';

            const context = {
                fileName: fileName,
                fileElement: fileItem
            };
            ContextMenu.show(e.clientX, e.clientY, ContextMenu.getFileMenuItems(context), context);
            return;
        }

        // Fallback: Show generic menu
        logger.info?.('No specific target, showing generic menu');
        ContextMenu.show(e.clientX, e.clientY, [
            {
                id: 'about',
                label: 'About Inline.px',
                icon: 'info',
                action: () => console.log('About')
            }
        ], {});
    });

    logger.debug('Context menus setup complete');
}

/**
 * Setup global keyboard shortcuts.
 * @private
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        const key = e.key.toLowerCase();
        if (e.key === 'Escape') {
            e.preventDefault();
            ToolRegistry.clearSelection();
            return;
        }
        // Grid toggle (G key)
        if (key === 'g' && !e.ctrlKey && !e.metaKey && !e.shiftKey && !e.altKey) {
            e.preventDefault();
            handleGridToggle();
            return;
        }
        if (ToolRegistry && /^[a-z]$/.test(key)) {
            const tool = ToolRegistry.getToolByShortcut(key.toUpperCase());
            if (tool) {
                e.preventDefault();
                ToolRegistry.setCurrentTool(tool.getId());
                return;
            }
        }
        if (e.ctrlKey || e.metaKey) {
            const shortcuts = { 'z': handleUndo, 'y': handleRedo, 'n': handleNew, 's': handleSave, 'o': handleLoad };
            if (shortcuts[key]) {
                e.preventDefault();
                if (key === 'z' && e.shiftKey) {
                    handleRedo();
                } else {
                    shortcuts[key]();
                }
            }
        }
    });
}

/**
 * Setup EventBus listeners for cross-module communication
 * @private
 */
function setupEventListeners() {
    // Listen for FILE_LOADED event to update UI when tabs are switched or files loaded
    eventBus.on(eventBus.Events.FILE_LOADED, () => {
        updateCanvasSizeInputs();
        updateLiveExportPreview();
    });
}

// ==================== EVENT HANDLERS ====================

function onToolChange(toolId, toolConfig) {
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tool === toolId));
    document.getElementById('currentToolName').textContent = toolConfig.name;
    document.querySelector('.canvas-container').style.cursor = toolConfig.cursor; // Dynamic cursor per tool

    // Toggle visibility with CSS classes
    const brushSizeOption = document.getElementById('brushSizeOption');
    const shapeModeOption = document.getElementById('shapeModeOption');
    brushSizeOption.classList.toggle('hidden', !toolConfig.hasSizeOption);
    shapeModeOption.classList.toggle('hidden', !toolConfig.hasShapeOption);

    logger.debug(`Tool changed to: ${toolConfig.name}`);
}

function onToolOptionChange(key, value) {
    logger.debug(`Tool option changed: ${key} = ${value}`);
}

function onColorChange(index, color) {
    document.getElementById('currentColorDisplay').style.backgroundColor = color;
    ToolRegistry.setToolOption('colorCode', index);
}

function onCanvasChange() {
    updateLiveExportPreview();
    TabManager.markCurrentTabDirty();
    clearTimeout(historyDebounceTimer);
    historyDebounceTimer = setTimeout(() => {
        const currentState = PixelCanvas.exportToString();
        History.pushState(currentState, 'Paint');
    }, constants.history.debounceTime);
}

function updateHistoryUI({ canUndo, canRedo, undoCount, redoCount }) {
    const undoBtn = document.getElementById('undoBtn');
    const redoBtn = document.getElementById('redoBtn');
    undoBtn.disabled = !canUndo;
    undoBtn.title = canUndo ? `Undo (${undoCount} available)` : 'Undo';
    redoBtn.disabled = !canRedo;
    redoBtn.title = canRedo ? `Redo (${redoCount} available)` : 'Redo';
}

// ==================== UI/MENU HANDLERS ====================

function updateLiveExportPreview() {
    const dataString = PixelCanvas.exportToString();
    document.getElementById('liveExportString').textContent = formatUtils.formatDataString(dataString, 50);
    document.getElementById('stringLength').textContent = dataString.length;
}

function updateSizePresetHighlight() {
    const width = parseInt(document.getElementById('canvasWidth')?.value);
    const height = parseInt(document.getElementById('canvasHeight')?.value);
    document.querySelectorAll('.preset-btn').forEach(btn => {
        btn.classList.toggle('active', width === parseInt(btn.dataset.size) && height === parseInt(btn.dataset.size));
    });
}

// ==================== WELCOME SCREEN HANDLERS ====================

/**
 * Show welcome screen
 */
function showWelcomeScreen() {
    document.getElementById('welcomeScreen').style.display = 'flex';
    document.getElementById('canvasContainer').style.display = 'none';
}

// Make showWelcomeScreen globally accessible for tabManager
window.showWelcomeScreen = showWelcomeScreen;

/**
 * Hide welcome screen and show canvas
 */
function hideWelcomeScreen() {
    document.getElementById('welcomeScreen').style.display = 'none';
    document.getElementById('canvasContainer').style.display = 'flex';
}

/**
 * Show new file dialog
 */
function showNewFileDialog() {
    const modal = document.getElementById('newFileModal');
    modal.style.display = 'flex';

    // Reset form to defaults
    document.getElementById('newFileName').value = '';
    document.getElementById('newFileWidth').value = '8';
    document.getElementById('newFileHeight').value = '8';
    document.querySelectorAll('.preset-btn-modal').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.size === '8');
    });

    // Focus on name input
    setTimeout(() => document.getElementById('newFileName').focus(), 100);
}

/**
 * Close new file modal
 */
function closeNewFileModal() {
    document.getElementById('newFileModal').style.display = 'none';
}

/**
 * Handle creation of new file from welcome screen dialog
 */
function handleCreateNewFile() {
    const name = document.getElementById('newFileName').value.trim() || 'Untitled';
    const width = parseInt(document.getElementById('newFileWidth').value);
    const height = parseInt(document.getElementById('newFileHeight').value);

    // Validate dimensions
    if (width < constants.canvas.minSize || width > constants.canvas.maxSize ||
        height < constants.canvas.minSize || height > constants.canvas.maxSize) {
        alert(`Canvas size must be between ${constants.canvas.minSize}×${constants.canvas.minSize} and ${constants.canvas.maxSize}×${constants.canvas.maxSize}`);
        return;
    }

    closeNewFileModal();
    hideWelcomeScreen();

    // Create new tab
    TabManager.createNewTab(name, width, height);

    logger.info(`Created new file: ${name} (${width}×${height})`);
}

/**
 * Show open file dialog with file grid and previews
 */
async function showOpenFileDialog() {
    const files = FileManager.getAllFiles();

    if (files.length === 0) {
        await Dialogs.alert('No Files', 'No saved files found. Create a new file to get started.', 'info');
        return;
    }

    const modal = document.getElementById('fileModal');
    const fileList = document.getElementById('fileList');
    const noFilesMessage = document.getElementById('noFilesMessage');

    // Clear previous content
    fileList.innerHTML = '';

    // Create file grid items with previews
    files.forEach(file => {
        const item = createFileGridItem(file);
        item.addEventListener('click', () => {
            loadFileFromWelcomeScreen(file);
            modal.style.display = 'none';
        });
        fileList.appendChild(item);
    });

    noFilesMessage.style.display = files.length === 0 ? 'block' : 'none';
    modal.style.display = 'flex';
}

/**
 * Create file grid item with preview
 * @param {Object} file - File object
 * @returns {HTMLElement}
 */
function createFileGridItem(file) {
    const item = document.createElement('div');
    item.className = 'file-grid-item';

    // Generate preview canvas and convert to image
    const previewCanvas = generateFilePreview(file.data);
    const previewDataURL = previewCanvas.toDataURL('image/png');

    // Format date
    const date = new Date(file.timestamp);
    const dateStr = date.toLocaleDateString();

    // Get dimensions from file object (already parsed in SavedFile)
    const dimensions = file.width && file.height ? `${file.width}×${file.height}` : 'Unknown';

    item.innerHTML = `
        <div class="file-grid-preview">
            <img src="${previewDataURL}" alt="${file.name}" />
        </div>
        <div class="file-grid-details">
            <div class="file-grid-name">${file.name}</div>
            <div class="file-grid-meta">
                <span class="file-grid-info">${dimensions}</span>
                <span class="file-grid-date">${dateStr}</span>
            </div>
        </div>
    `;

    return item;
}

/**
 * Generate preview canvas for a file
 * @param {string} dataString - Pixel data string (WxH:DATA)
 * @returns {HTMLCanvasElement}
 */
function generateFilePreview(dataString) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    try {
        // Parse data string
        let parsedData = dataString;

        // Check if compressed, decompress if needed
        if (Compression && Compression.isCompressed(dataString)) {
            parsedData = Compression.decompress(dataString);
            logger.debug?.('Preview: Decompressed data');
        }

        const match = parsedData.match(/^(\d+)x(\d+):(.+)$/);
        if (!match) {
            logger.warn?.('Preview: Invalid data format:', parsedData.substring(0, 50));
            // Fallback for invalid data
            canvas.width = 64;
            canvas.height = 64;
            ctx.fillStyle = '#333';
            ctx.fillRect(0, 0, 64, 64);
            return canvas;
        }

        const width = parseInt(match[1]);
        const height = parseInt(match[2]);
        const data = match[3];

        logger.debug?.(`Preview: Rendering ${width}×${height}, data length: ${data.length}`);

        // Calculate scale to fit in 64x64
        const scale = Math.min(64 / width, 64 / height);
        canvas.width = Math.floor(width * scale);
        canvas.height = Math.floor(height * scale);

        // Draw pixels
        ctx.imageSmoothingEnabled = false;

        let pixelsDrawn = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = y * width + x;
                if (index < data.length) {
                    const char = data[index];
                    const colorIndex = ColorPalette.getIndexFromChar(char);

                    // Skip transparent pixels (0)
                    if (colorIndex === 0) continue;

                    const color = ColorPalette.getColor(colorIndex);
                    if (color) {
                        ctx.fillStyle = color;
                        ctx.fillRect(x * scale, y * scale, scale, scale);
                        pixelsDrawn++;
                    }
                }
            }
        }

        logger.debug?.(`Preview: Drew ${pixelsDrawn} pixels`);

    } catch (error) {
        logger.error?.('Preview generation failed:', error);
        canvas.width = 64;
        canvas.height = 64;
        ctx.fillStyle = '#f00';
        ctx.fillRect(0, 0, 64, 64);
    }

    return canvas;
}

/**
 * Load file from welcome screen
 * @param {Object} file - File object
 */
function loadFileFromWelcomeScreen(file) {
    hideWelcomeScreen();

    // Create tab with file data
    const match = file.data.match(/^(\d+)x(\d+):/);
    const width = match ? parseInt(match[1]) : 16;
    const height = match ? parseInt(match[2]) : 16;

    TabManager.createNewTab(file.name, width, height, file.data);
    FileManager.setCurrentFileName(file.name);
    TabManager.markCurrentTabClean();

    logger.info(`Loaded file: ${file.name}`);
}

function handleNew() {
    hideWelcomeScreen();
    TabManager.createNewTab();
}

async function handleSave() {
    let currentName = TabManager.getCurrentTab()?.name || FileManager.getCurrentFileName();
    const dataString = PixelCanvas.exportToString();
    const success = await FileManager.save(dataString, currentName);
    if (success) {
        logger.info('Saved successfully');
        TabManager.markCurrentTabClean();
        Autosave.forceSave();
    }
}

function handleLoad() {
    FileManager.showLoadDialog((file) => {
        if (PixelCanvas.importFromString(file.data)) {
            hideWelcomeScreen();
            TabManager.setCurrentTabName(file.name);
            FileManager.setCurrentFileName(file.name);
            TabManager.markCurrentTabClean();
            updateCanvasSizeInputs();
            updateLiveExportPreview();
        }
    });
}

async function handleExportFile() {
    let dataString = PixelCanvas.exportToString();
    const filename = FileManager.getCurrentFileName() || 'pixelart';
    const options = await Dialogs.exportDialog(dataString);
    if (!options) return;

    if (options.compress) {
        dataString = Compression.smartCompress(dataString).data;
    }

    switch (options.format) {
        case 'copy-string':
            await clipboardUtils.copyWithFeedback(dataString);
            await Dialogs.alert('Copied!', 'Pixel art string copied to clipboard.', 'success');
            break;
        case 'download-txt':
            FileManager.exportAsFile(dataString, filename);
            break;
        case 'download-png': {
            const pngFilename = filename.replace(/\.txt$/, '') + '.png';
            PNGExport.exportToPNG(options.scale, pngFilename);
            await Dialogs.alert('PNG Exported!', `Exported as ${pngFilename} at ${options.scale}× scale.`, 'success');
            break;
        }
    }
}

function handleImportString() {
    const modal = document.getElementById('importModal');
    const textarea = document.getElementById('importTextarea');
    if (modal && textarea) {
        textarea.value = '';
        modal.classList.add('flex');
        modal.classList.remove('hidden');
        textarea.focus();
    }
}

async function handleClear() {
    const confirmed = await Dialogs.confirm(
        'Clear Canvas',
        'Are you sure you want to clear the canvas? This cannot be undone.',
        { confirmText: 'Clear', type: 'warning', dangerous: true }
    );
    if (confirmed) {
        PixelCanvas.clear();
        updateLiveExportPreview();
    }
}

async function handleCopyLiveString() {
    const dataString = PixelCanvas.exportToString();
    const btn = document.getElementById('copyLiveStringBtn');
    await clipboardUtils.copyWithFeedback(dataString, btn);
}

function handleGridToggle() {
    const currentState = CanvasRenderer.getGridVisible();
    const newState = !currentState;

    CanvasRenderer.setGridVisible(newState);

    // Update button icon
    const btn = document.getElementById('gridToggleBtn');
    if (btn) {
        const icon = btn.querySelector('.material-symbols-outlined');
        if (icon) {
            icon.textContent = newState ? 'grid_on' : 'grid_off';
        }
    }

    logger.info?.(`Grid ${newState ? 'enabled' : 'disabled'}`);
}

async function handleResize() {
    const width = parseInt(document.getElementById('canvasWidth')?.value);
    const height = parseInt(document.getElementById('canvasHeight')?.value);

    const validation = validationUtils.validateCanvasDimensions(width, height);
    if (!validation.valid) {
        await Dialogs.alert('Invalid Size', validation.error, 'warning');
        return;
    }

    if (PixelCanvas.hasContent()) {
        const confirmed = await Dialogs.confirm(
            'Resize Canvas',
            'Resizing may crop or add empty space to your artwork. Continue?',
            { confirmText: 'Resize', type: 'warning' }
        );
        if (!confirmed) return;
    }

    if (PixelCanvas.resize(width, height)) {
        updateLiveExportPreview();
        updateSizePresetHighlight();
        if (Viewport) Viewport.updateCanvasSize();
    }
}

function handleUndo() {
    if (!History.canUndo()) return logger.debug('Nothing to undo');
    const currentState = PixelCanvas.exportToString();
    const previousState = History.undo(currentState);
    if (previousState) {
        PixelCanvas.importFromString(previousState);
        updateCanvasSizeInputs();
        updateLiveExportPreview();
        logger.info('Undo performed');
    }
}

function handleRedo() {
    if (!History.canRedo()) return logger.debug('Nothing to redo');
    const currentState = PixelCanvas.exportToString();
    const nextState = History.redo(currentState);
    if (nextState) {
        PixelCanvas.importFromString(nextState);
        updateCanvasSizeInputs();
        updateLiveExportPreview();
        logger.info('Redo performed');
    }
}

function updateCanvasSizeInputs() {
    const { width, height } = PixelCanvas.getDimensions();
    document.getElementById('canvasWidth').value = width;
    document.getElementById('canvasHeight').value = height;
    updateSizePresetHighlight();
}

function bindEvent(elementId, handler) {
    const element = document.getElementById(elementId);
    if (element) {
        element.addEventListener('click', handler);
    }
}

// Start the application
init();
