/**
 * ColorPalette Module - Base64 Color System (Refactored)
 *
 * Modern color palette management with:
 * - JSON-based configuration (colors.json)
 * - 64-color Base64 encoding
 * - Event-driven architecture
 * - Category filtering
 * - Custom palette support
 *
 * @module ColorPalette
 *
 * @typedef {import('./types.js').PaletteColor} PaletteColor
 */

import logger from './core/Logger.js';
import eventBus from './core/EventBus.js';
import configLoader from './core/ConfigLoader.js';
import validationUtils from './utils/ValidationUtils.js';
import ToolRegistry from './tools/ToolRegistry.js'; // Added import for ToolRegistry

// Configuration
let config = null;
let base64Chars = '';
let palette = [];
let colorsByIndex = [];
let colorsByChar = {};
let namesByIndex = [];

// Current state
let currentColorIndex = 1; // Default to black
let onColorChangeCallback = null;
let customPalette = null; // For user customization

/**
 * Initialize the color palette
 * @param {string} containerId - ID of the container element
 * @param {Function} onColorChange - Callback when color changes
 * @returns {Promise<void>}
 */
async function init(containerId, onColorChange = null) {
    try {
        logger.info?.('ColorPalette initializing...');

        onColorChangeCallback = onColorChange;

        // Load color configuration
        config = await configLoader.loadColors();

        // Parse configuration
        parseConfig();

        // Render UI
        const container = document.getElementById(containerId);
        if (container) {
            renderPalette(container);
            updateColorDisplay();
        } else {
            logger.warn?.(`Container "${containerId}" not found`);
        }

        logger.info?.('ColorPalette initialized successfully');

    } catch (error) {
        logger.error?.('ColorPalette initialization failed', error);
        throw error;
    }
}

/**
 * Parse color configuration
 * @private
 */
function parseConfig() {
    base64Chars = config.base64Chars;
    palette = config.palette;

    // Build lookup structures
    colorsByIndex = [];
    colorsByChar = {};
    namesByIndex = [];

    palette.forEach(item => {
        colorsByIndex[item.index] = item.color;
        colorsByChar[item.char] = item.color;
        namesByIndex[item.index] = item.name;
    });

    logger.debug?.(`Parsed ${palette.length} colors from configuration`);
}

/**
 * Render the color palette
 * @private
 */
function renderPalette(container) {
    container.innerHTML = '';

    palette.forEach(item => {
        const btn = document.createElement('button');
        btn.className = 'color-swatch';
        btn.dataset.code = item.char;
        btn.dataset.index = item.index;
        btn.dataset.category = item.category;
        btn.style.backgroundColor = item.color;
        btn.title = `${item.name} (${item.char})`;

        if (item.index === currentColorIndex) {
            btn.classList.add('active');
        }

        btn.addEventListener('click', () => selectColor(item.index));
        container.appendChild(btn);
    });

    logger.debug?.(`Rendered ${palette.length} color swatches`);
}

/**
 * Select a color by index
 * @param {number} index - Color index (0-63)
 */
function selectColor(index) {
    // Validate index
    if (!validationUtils.validateColorIndex(index)) {
        logger.error?.(`Invalid color index: ${index}`);
        return;
    }

    const oldIndex = currentColorIndex;
    currentColorIndex = index;

    // Update UI
    document.querySelectorAll('.color-swatch').forEach(btn => {
        btn.classList.toggle('active', parseInt(btn.dataset.index) === index);
    });

    updateColorDisplay();

    // Trigger callback
    if (onColorChangeCallback) {
        onColorChangeCallback(index, colorsByIndex[index]);
    }

    // Emit event
    if (eventBus) {
        eventBus.emit(eventBus.Events.COLOR_CHANGED, {
            index,
            color: colorsByIndex[index],
            char: base64Chars[index],
            name: namesByIndex[index],
            oldIndex
        });
    }

    // Update tool registry color
    if (ToolRegistry) {
        ToolRegistry.setToolOption('colorCode', index);
    }

    logger.debug?.(`Color selected: ${namesByIndex[index]} (${index})`);
}

/**
 * Update the current color display
 * @private
 */
function updateColorDisplay() {
    const colorDisplay = document.getElementById('currentColorDisplay');
    const colorCode = document.getElementById('currentColorCode');

    if (colorDisplay) {
        colorDisplay.style.backgroundColor = colorsByIndex[currentColorIndex];
    }

    if (colorCode) {
        colorCode.textContent = base64Chars[currentColorIndex];
    }
}

/**
 * Get color by index
 * @param {number} index - Color index
 * @returns {string} Hex color or 'transparent'
 */
function getColor(index) {
    return colorsByIndex[index] || colorsByIndex[0];
}

/**
 * Get color by Base64 character
 * @param {string} char - Base64 character
 * @returns {string} Hex color or 'transparent'
 */
function getColorByChar(char) {
    return colorsByChar[char] || colorsByIndex[0];
}

/**
 * Get current selected color index
 * @returns {number} Current color index
 */
function getCurrentColorIndex() {
    return currentColorIndex;
}

/**
 * Get current selected color
 * @returns {string} Current color hex or 'transparent'
 */
function getCurrentColor() {
    return colorsByIndex[currentColorIndex];
}

/**
 * Get Base64 character for index
 * @param {number} index - Color index
 * @returns {string} Base64 character
 */
function getBase64Char(index) {
    return base64Chars[index] || '0';
}

/**
 * Get index from Base64 character
 * @param {string} char - Base64 character
 * @returns {number} Color index
 */
function getIndexFromChar(char) {
    return base64Chars.indexOf(char);
}

/**
 * Get all colors
 * @returns {Array} Array of color objects
 */
function getAllColors() {
    return [...palette];
}

/**
 * Get colors by category
 * @param {string} category - Category name
 * @returns {Array} Filtered color objects
 */
function getColorsByCategory(category) {
    return palette.filter(item => item.category === category);
}

/**
 * Get all categories
 * @returns {Array<string>} Category names
 */
function getCategories() {
    const categories = new Set();
    palette.forEach(item => categories.add(item.category));
    return Array.from(categories);
}

/**
 * Convert color index to RGBA values for canvas
 * @param {number} index - Color index
 * @returns {Object} RGBA values {r, g, b, a}
 */
function indexToRGBA(index) {
    const color = colorsByIndex[index];

    if (color === 'transparent') {
        return { r: 0, g: 0, b: 0, a: 0 };
    }

    // Convert hex to RGB
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b, a: 255 };
}

/**
 * Get color name by index
 * @param {number} index - Color index
 * @returns {string} Color name
 */
function getColorName(index) {
    return namesByIndex[index] || 'Unknown';
}

/**
 * Get color info by index
 * @param {number} index - Color index
 * @returns {Object|null} Color info object
 */
function getColorInfo(index) {
    return palette.find(item => item.index === index) || null;
}

/**
 * Set custom color at index (runtime override)
 * @param {number} index - Color index
 * @param {string} hexColor - Hex color code
 */
function setCustomColor(index, hexColor) {
    if (index >= 0 && index < colorsByIndex.length) {
        if (!customPalette) {
            customPalette = [...colorsByIndex];
        }
        customPalette[index] = hexColor;
        colorsByIndex[index] = hexColor;

        // Re-render if needed
        const swatch = document.querySelector(`.color-swatch[data-index="${index}"]`);
        if (swatch) {
            swatch.style.backgroundColor = hexColor;
        }

        logger.info?.(`Custom color set at index ${index}: ${hexColor}`);
    }
}

/**
 * Reset to default palette
 */
function resetToDefault() {
    if (config) {
        parseConfig();
        const container = document.querySelector('.color-grid');
        if (container) {
            renderPalette(container);
        }
        customPalette = null;
        logger.info?.('Palette reset to default');
    }
}

/**
 * Export custom palette
 * @returns {Object} Custom palette configuration
 */
function exportCustomPalette() {
    return {
        base64Chars,
        palette: palette.map((item, index) => ({
            ...item,
            color: customPalette ? customPalette[index] : item.color
        }))
    };
}

/**
 * Import custom palette
 * @param {Object} paletteConfig - Palette configuration
 */
function importCustomPalette(paletteConfig) {
    try {
        config = paletteConfig;
        parseConfig();

        const container = document.querySelector('.color-grid');
        if (container) {
            renderPalette(container);
        }

        logger.info?.('Custom palette imported');
    } catch (error) {
        logger.error?.('Failed to import custom palette', error);
    }
}

const ColorPalette = {
    init,
    selectColor,
    getColor,
    getColorByChar,
    getCurrentColorIndex,
    getCurrentColor,
    getBase64Char,
    getIndexFromChar,
    getAllColors,
    getColorsByCategory,
    getCategories,
    indexToRGBA,
    getColorName,
    getColorInfo,
    setCustomColor,
    resetToDefault,
    exportCustomPalette,
    importCustomPalette,

    // Expose for compatibility
    get BASE64_CHARS() { return base64Chars; },
    get COLORS() { return colorsByIndex; }
};

export default ColorPalette;
