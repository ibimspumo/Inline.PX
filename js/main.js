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
import ToolRegistry from './tools/ToolRegistry.js';
import TabManager from './tabManager.js';
import FileManager from './fileManager.js';
import Autosave from './autosave.js';
import Viewport from './viewport.js';
import History from './history.js';
import Compression from './compression.js';
import PNGExport from './pngExport.js';

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

    TabManager.init();
    Autosave.init();
    Viewport.init();
    History.init({ onHistoryChange: updateHistoryUI });

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

// ==================== EVENT HANDLERS ====================

function onToolChange(toolId, toolConfig) {
    document.querySelectorAll('.tool-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.tool === toolId));
    document.getElementById('currentToolName').textContent = toolConfig.name;
    document.querySelector('.canvas-container').style.cursor = toolConfig.cursor;
    document.getElementById('brushSizeOption').style.display = toolConfig.hasSizeOption ? 'flex' : 'none';
    document.getElementById('shapeModeOption').style.display = toolConfig.hasShapeOption ? 'flex' : 'none';
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

function handleNew() {
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
        modal.style.display = 'flex';
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
