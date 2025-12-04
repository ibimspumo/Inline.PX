/**
 * LayerUI - Layer Panel UI Manager
 *
 * Renders and manages the layer list interface:
 * - Layer items with preview thumbnails
 * - Drag and drop reordering
 * - Visibility toggle
 * - Layer selection
 * - Layer renaming
 * - Add/delete operations
 *
 * @module LayerUI
 */

import LayerManager from './layerManager.js';
import logger from './core/Logger.js';
import eventBus from './core/EventBus.js';
import Dialogs from './dialogs.js';
import ColorPalette from './colorPalette.js';

let layersListElement = null;
let addLayerBtn = null;
let draggedLayerId = null;

/**
 * Initialize layer UI
 */
function init() {
    layersListElement = document.getElementById('layersList');
    addLayerBtn = document.getElementById('addLayerBtn');

    if (!layersListElement || !addLayerBtn) {
        logger.error?.('Layer UI elements not found');
        return;
    }

    // Add layer button
    addLayerBtn.addEventListener('click', handleAddLayer);

    // Listen to layer events
    eventBus.on('layer:created', render);
    eventBus.on('layer:deleted', render);
    eventBus.on('layer:renamed', render);
    eventBus.on('layer:visibilityChanged', render);
    eventBus.on('layer:activeChanged', render);
    eventBus.on('layer:moved', render);

    // Initial render
    render();

    logger.info?.('LayerUI initialized');
}

/**
 * Render the layer list
 */
function render() {
    if (!layersListElement) return;

    const layers = LayerManager.getLayers();
    const activeLayer = LayerManager.getActiveLayer();

    layersListElement.innerHTML = '';

    layers.forEach(layer => {
        const layerItem = createLayerItem(layer, layer.id === activeLayer?.id);
        layersListElement.appendChild(layerItem);
    });
}

/**
 * Create a single layer item element
 * @param {Object} layer - Layer data
 * @param {boolean} isActive - Is this the active layer
 * @returns {HTMLElement} Layer item element
 */
function createLayerItem(layer, isActive) {
    const item = document.createElement('div');
    item.className = 'layer-item' + (isActive ? ' active' : '');
    item.dataset.layerId = layer.id;
    item.draggable = true;

    // Preview thumbnail
    const preview = document.createElement('div');
    preview.className = 'layer-preview';
    const previewCanvas = createLayerPreview(layer);
    preview.appendChild(previewCanvas);

    // Layer info
    const info = document.createElement('div');
    info.className = 'layer-info';

    const name = document.createElement('div');
    name.className = 'layer-name';
    name.textContent = layer.name;

    const meta = document.createElement('div');
    meta.className = 'layer-meta';
    const width = layer.data[0]?.length || 0;
    const height = layer.data.length || 0;
    meta.textContent = `${width}×${height}`;

    info.appendChild(name);
    info.appendChild(meta);

    // Controls
    const controls = document.createElement('div');
    controls.className = 'layer-controls';

    // Visibility button
    const visibilityBtn = document.createElement('button');
    visibilityBtn.className = 'layer-btn layer-btn-visibility' + (layer.visible ? ' active' : '');
    visibilityBtn.title = layer.visible ? 'Hide Layer' : 'Show Layer';
    visibilityBtn.innerHTML = '<span class="material-symbols-outlined"></span>';
    visibilityBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleToggleVisibility(layer.id);
    });

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'layer-btn layer-btn-delete';
    deleteBtn.title = 'Delete Layer';
    deleteBtn.innerHTML = '<span class="material-symbols-outlined">delete</span>';
    deleteBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        handleDeleteLayer(layer.id);
    });

    controls.appendChild(visibilityBtn);
    controls.appendChild(deleteBtn);

    // Assemble
    item.appendChild(preview);
    item.appendChild(info);
    item.appendChild(controls);

    // Events
    item.addEventListener('click', () => handleLayerClick(layer.id));
    item.addEventListener('dblclick', () => handleLayerRename(layer.id, name));

    // Drag and drop
    item.addEventListener('dragstart', handleDragStart);
    item.addEventListener('dragover', handleDragOver);
    item.addEventListener('drop', handleDrop);
    item.addEventListener('dragend', handleDragEnd);

    return item;
}

/**
 * Create a preview canvas for a layer
 * @param {Object} layer - Layer data
 * @returns {HTMLCanvasElement} Preview canvas
 */
function createLayerPreview(layer) {
    const canvas = document.createElement('canvas');
    const width = layer.data[0]?.length || 0;
    const height = layer.data.length || 0;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    // Draw layer pixels
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const colorIndex = layer.data[y][x];
            if (colorIndex !== 0) {
                const color = ColorPalette.getColor(colorIndex);
                ctx.fillStyle = color;
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    return canvas;
}

/**
 * Handle add layer button click
 */
async function handleAddLayer() {
    const layerCount = LayerManager.getLayers().length;
    const newLayer = LayerManager.createLayer(`Layer ${layerCount + 1}`);
    LayerManager.setActiveLayer(newLayer.id);

    logger.info?.(`Layer added: ${newLayer.name}`);
}

/**
 * Handle layer click (select)
 * @param {string} layerId - Layer ID
 */
function handleLayerClick(layerId) {
    LayerManager.setActiveLayer(layerId);
}

/**
 * Handle layer rename (double-click)
 * @param {string} layerId - Layer ID
 * @param {HTMLElement} nameElement - Name element
 */
async function handleLayerRename(layerId, nameElement) {
    const layer = LayerManager.getLayer(layerId);
    if (!layer) return;

    const newName = await Dialogs.prompt(
        'Rename Layer',
        'Enter new layer name:',
        layer.name
    );

    if (newName && newName !== layer.name) {
        LayerManager.renameLayer(layerId, newName);
    }
}

/**
 * Handle toggle visibility
 * @param {string} layerId - Layer ID
 */
function handleToggleVisibility(layerId) {
    LayerManager.toggleVisibility(layerId);
    eventBus.emit('canvas:changed'); // Trigger re-render
}

/**
 * Handle delete layer
 * @param {string} layerId - Layer ID
 */
async function handleDeleteLayer(layerId) {
    const layer = LayerManager.getLayer(layerId);
    if (!layer) return;

    // Confirm if only one layer
    if (LayerManager.getLayers().length === 1) {
        await Dialogs.alert('Cannot Delete', 'Cannot delete the only layer.', 'warning');
        return;
    }

    const confirmed = await Dialogs.confirm(
        'Delete Layer',
        `Delete layer "${layer.name}"? This cannot be undone.`,
        'Delete',
        'Cancel'
    );

    if (confirmed) {
        LayerManager.deleteLayer(layerId);
        eventBus.emit('canvas:changed'); // Trigger re-render
    }
}

/**
 * Handle drag start
 * @param {DragEvent} e - Drag event
 */
function handleDragStart(e) {
    draggedLayerId = e.currentTarget.dataset.layerId;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

/**
 * Handle drag over
 * @param {DragEvent} e - Drag event
 */
function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const target = e.currentTarget;
    if (target.dataset.layerId !== draggedLayerId) {
        target.classList.add('drag-over');
    }
}

/**
 * Handle drop
 * @param {DragEvent} e - Drag event
 */
function handleDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');

    const targetLayerId = e.currentTarget.dataset.layerId;
    if (draggedLayerId && targetLayerId && draggedLayerId !== targetLayerId) {
        // Get target layer's new index
        const layers = LayerManager.getLayers();
        const targetIndex = layers.findIndex(l => l.id === targetLayerId);

        if (targetIndex !== -1) {
            LayerManager.moveLayer(draggedLayerId, targetIndex);
            eventBus.emit('canvas:changed'); // Trigger re-render
        }
    }
}

/**
 * Handle drag end
 * @param {DragEvent} e - Drag event
 */
function handleDragEnd(e) {
    e.currentTarget.classList.remove('dragging');
    document.querySelectorAll('.layer-item').forEach(item => {
        item.classList.remove('drag-over');
    });
    draggedLayerId = null;
}

const LayerUI = {
    init,
    render
};

export default LayerUI;
