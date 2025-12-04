/**
 * LayerManager - Layer System for Pixel Art
 *
 * Features:
 * - Multiple layers with independent pixel data
 * - Layer visibility toggle
 * - Layer reordering (z-index)
 * - Layer naming
 * - Active layer selection
 * - Layer preview thumbnails
 *
 * @module LayerManager
 *
 * @typedef {Object} Layer
 * @property {string} id - Unique layer ID
 * @property {string} name - Layer name
 * @property {boolean} visible - Visibility flag
 * @property {number} opacity - Layer opacity (0-1)
 * @property {Array<Array<number>>} data - 2D pixel array
 * @property {number} zIndex - Render order (higher = on top)
 * @property {number} created - Creation timestamp
 */

import logger from './core/Logger.js';
import eventBus from './core/EventBus.js';

let layers = [];
let activeLayerId = null;
let nextLayerId = 1;
let canvasWidth = 16;
let canvasHeight = 16;

/**
 * Initialize layer system
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 */
function init(width, height) {
    canvasWidth = width;
    canvasHeight = height;
    layers = [];
    nextLayerId = 1;

    // Create default layer
    const defaultLayer = createLayer('Background', width, height);
    activeLayerId = defaultLayer.id;

    logger.info?.('LayerManager initialized');
}

/**
 * Create a new layer
 * @param {string} name - Layer name
 * @param {number} width - Layer width
 * @param {number} height - Layer height
 * @param {Array<Array<number>>} initialData - Optional initial pixel data
 * @returns {Layer} Created layer
 */
function createLayer(name = 'Layer', width = canvasWidth, height = canvasHeight, initialData = null) {
    const layer = {
        id: `layer_${nextLayerId++}`,
        name: name,
        visible: true,
        opacity: 1.0,
        data: initialData || createEmptyData(width, height),
        zIndex: layers.length,
        created: Date.now()
    };

    layers.push(layer);

    logger.info?.(`Layer created: ${layer.name} (${layer.id})`);
    eventBus.emit('layer:created', layer);

    return layer;
}

/**
 * Create empty pixel data (all transparent)
 * @param {number} width - Width
 * @param {number} height - Height
 * @returns {Array<Array<number>>} Empty 2D array
 */
function createEmptyData(width, height) {
    const data = [];
    for (let y = 0; y < height; y++) {
        data[y] = [];
        for (let x = 0; x < width; x++) {
            data[y][x] = 0; // Transparent
        }
    }
    return data;
}

/**
 * Delete a layer
 * @param {string} layerId - Layer ID
 * @returns {boolean} Success
 */
function deleteLayer(layerId) {
    // Can't delete if it's the only layer
    if (layers.length === 1) {
        logger.warn?.('Cannot delete the only layer');
        return false;
    }

    const index = layers.findIndex(l => l.id === layerId);
    if (index === -1) {
        logger.warn?.(`Layer not found: ${layerId}`);
        return false;
    }

    const layer = layers[index];
    layers.splice(index, 1);

    // If deleted layer was active, select another
    if (activeLayerId === layerId) {
        activeLayerId = layers[Math.max(0, index - 1)].id;
        eventBus.emit('layer:activeChanged', getActiveLayer());
    }

    // Re-index remaining layers
    layers.forEach((l, i) => l.zIndex = i);

    logger.info?.(`Layer deleted: ${layer.name}`);
    eventBus.emit('layer:deleted', { layerId, layer });

    return true;
}

/**
 * Get layer by ID
 * @param {string} layerId - Layer ID
 * @returns {Layer|null} Layer or null
 */
function getLayer(layerId) {
    return layers.find(l => l.id === layerId) || null;
}

/**
 * Get active layer
 * @returns {Layer|null} Active layer
 */
function getActiveLayer() {
    return getLayer(activeLayerId);
}

/**
 * Set active layer
 * @param {string} layerId - Layer ID
 * @returns {boolean} Success
 */
function setActiveLayer(layerId) {
    const layer = getLayer(layerId);
    if (!layer) {
        logger.warn?.(`Cannot set active layer: ${layerId} not found`);
        return false;
    }

    activeLayerId = layerId;
    logger.info?.(`Active layer: ${layer.name}`);
    eventBus.emit('layer:activeChanged', layer);

    return true;
}

/**
 * Get all layers (sorted by z-index)
 * @returns {Array<Layer>} Layers array
 */
function getLayers() {
    return [...layers].sort((a, b) => a.zIndex - b.zIndex);
}

/**
 * Toggle layer visibility
 * @param {string} layerId - Layer ID
 * @returns {boolean} New visibility state
 */
function toggleVisibility(layerId) {
    const layer = getLayer(layerId);
    if (!layer) return false;

    layer.visible = !layer.visible;
    logger.info?.(`Layer ${layer.name} visibility: ${layer.visible}`);
    eventBus.emit('layer:visibilityChanged', { layerId, visible: layer.visible });

    return layer.visible;
}

/**
 * Rename layer
 * @param {string} layerId - Layer ID
 * @param {string} newName - New name
 * @returns {boolean} Success
 */
function renameLayer(layerId, newName) {
    const layer = getLayer(layerId);
    if (!layer) return false;

    const oldName = layer.name;
    layer.name = newName.trim() || `Layer ${layerId}`;

    logger.info?.(`Layer renamed: ${oldName} → ${layer.name}`);
    eventBus.emit('layer:renamed', { layerId, oldName, newName: layer.name });

    return true;
}

/**
 * Move layer (reorder z-index)
 * @param {string} layerId - Layer ID
 * @param {number} newIndex - New z-index
 * @returns {boolean} Success
 */
function moveLayer(layerId, newIndex) {
    const layer = getLayer(layerId);
    if (!layer) return false;

    const oldIndex = layer.zIndex;
    if (newIndex < 0 || newIndex >= layers.length || newIndex === oldIndex) {
        return false;
    }

    // Remove layer from array
    layers = layers.filter(l => l.id !== layerId);

    // Insert at new position
    layers.splice(newIndex, 0, layer);

    // Re-index all layers
    layers.forEach((l, i) => l.zIndex = i);

    logger.info?.(`Layer ${layer.name} moved: ${oldIndex} → ${newIndex}`);
    eventBus.emit('layer:moved', { layerId, oldIndex, newIndex });

    return true;
}

/**
 * Resize all layers
 * @param {number} newWidth - New width
 * @param {number} newHeight - New height
 */
function resizeLayers(newWidth, newHeight) {
    layers.forEach(layer => {
        const oldData = layer.data;
        const newData = createEmptyData(newWidth, newHeight);

        // Copy old data (top-left aligned)
        const copyWidth = Math.min(oldData[0].length, newWidth);
        const copyHeight = Math.min(oldData.length, newHeight);

        for (let y = 0; y < copyHeight; y++) {
            for (let x = 0; x < copyWidth; x++) {
                newData[y][x] = oldData[y][x];
            }
        }

        layer.data = newData;
    });

    canvasWidth = newWidth;
    canvasHeight = newHeight;

    logger.info?.(`All layers resized to ${newWidth}×${newHeight}`);
    eventBus.emit('layer:resized', { width: newWidth, height: newHeight });
}

/**
 * Composite all visible layers into single pixel data
 * @returns {Array<Array<number>>} Composited pixel data
 */
function compositeAllLayers() {
    const result = createEmptyData(canvasWidth, canvasHeight);
    const sortedLayers = getLayers(); // Bottom to top

    sortedLayers.forEach(layer => {
        if (!layer.visible) return;

        for (let y = 0; y < canvasHeight; y++) {
            for (let x = 0; x < canvasWidth; x++) {
                const pixel = layer.data[y][x];
                // Simple alpha blending (0 = transparent, skip)
                if (pixel !== 0) {
                    result[y][x] = pixel;
                }
            }
        }
    });

    return result;
}

/**
 * Export layer data for saving
 * @returns {Object} Serializable layer data
 */
function exportLayerData() {
    return {
        layers: layers.map(l => ({
            id: l.id,
            name: l.name,
            visible: l.visible,
            opacity: l.opacity,
            data: l.data,
            zIndex: l.zIndex,
            created: l.created
        })),
        activeLayerId,
        canvasWidth,
        canvasHeight
    };
}

/**
 * Import layer data (for loading)
 * @param {Object} layerData - Exported layer data
 */
function importLayerData(layerData) {
    layers = layerData.layers || [];
    activeLayerId = layerData.activeLayerId || (layers[0]?.id || null);
    canvasWidth = layerData.canvasWidth || 16;
    canvasHeight = layerData.canvasHeight || 16;

    // Ensure unique IDs
    nextLayerId = Math.max(...layers.map(l => parseInt(l.id.split('_')[1]) || 0), 0) + 1;

    logger.info?.(`Imported ${layers.length} layers`);
    eventBus.emit('layer:imported', { layerCount: layers.length });
}

const LayerManager = {
    init,
    createLayer,
    deleteLayer,
    getLayer,
    getActiveLayer,
    setActiveLayer,
    getLayers,
    toggleVisibility,
    renameLayer,
    moveLayer,
    resizeLayers,
    compositeAllLayers,
    exportLayerData,
    importLayerData
};

export default LayerManager;
