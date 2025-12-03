/**
 * PixelData - Pixel Data Management
 *
 * Manages the 2D array of pixel color indices:
 * - Initialization and clearing
 * - Export/Import with Base64 format
 * - Data validation
 * - RLE compression support
 *
 * @module PixelData
 *
 * @typedef {import('../types.js').PixelData} PixelData
 * @typedef {import('../types.js').CompressionStats} CompressionStats
 */

import logger from '../core/Logger.js';
import Compression from '../compression.js';
import ValidationUtils from '../utils/ValidationUtils.js';
import ColorPalette from '../colorPalette.js';

let width = 16;
let height = 16;
let data = []; // 2D array of color indices (0-63)

/**
 * Initialize pixel data
 * @param {number} w - Width
 * @param {number} h - Height
 */
function init(w, h) {
    width = w;
    height = h;
    clear();
    logger.debug?.(`PixelData initialized: ${width}×${height}`);
}

/**
 * Clear all pixels to transparent
 */
function clear() {
    data = [];
    for (let y = 0; y < height; y++) {
        data[y] = [];
        for (let x = 0; x < width; x++) {
            data[y][x] = 0; // 0 = transparent
        }
    }
}

/**
 * Get pixel data array
 * @returns {Array<Array<number>>} 2D array of color indices
 */
function getData() {
    return data;
}

/**
 * Set pixel data array
 * @param {Array<Array<number>>} newData - New pixel data
 */
function setData(newData) {
    if (!newData || newData.length === 0) {
        logger.error?.('Invalid pixel data');
        return false;
    }

    height = newData.length;
    width = newData[0].length;
    data = newData.map(row => [...row]);
    return true;
}

/**
 * Get dimensions
 * @returns {Object} {width, height}
 */
function getDimensions() {
    return { width, height };
}

/**
 * Get pixel value
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {number|null} Color index or null if out of bounds
 */
function getPixel(x, y) {
    if (x >= 0 && x < width && y >= 0 && y < height) {
        return data[y][x];
    }
    return null;
}

/**
 * Set pixel value
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} colorIndex - Color index
 * @returns {boolean} True if pixel was set
 */
function setPixel(x, y, colorIndex) {
    if (x >= 0 && x < width && y >= 0 && y < height) {
        data[y][x] = colorIndex;
        return true;
    }
    return false;
}

/**
 * Resize pixel data
 * @param {number} newWidth - New width
 * @param {number} newHeight - New height
 * @returns {boolean} Success
 */
function resize(newWidth, newHeight) {
    // Validate
    const validation = ValidationUtils.validateCanvasDimensions(newWidth, newHeight);
    if (!validation.valid) {
        logger.error?.('Invalid dimensions:', validation.error);
        return false;
    }

    const oldData = data;
    const oldWidth = width;
    const oldHeight = height;

    width = newWidth;
    height = newHeight;

    clear();

    // Copy old data (crop or extend)
    for (let y = 0; y < Math.min(oldHeight, height); y++) {
        for (let x = 0; x < Math.min(oldWidth, width); x++) {
            data[y][x] = oldData[y][x];
        }
    }

    logger.info?.(`Pixel data resized: ${oldWidth}×${oldHeight} → ${width}×${height}`);
    return true;
}

/**
 * Export to Base64 string format
 * @param {boolean} compress - Apply RLE compression if beneficial
 * @returns {string} Export string (WxH:DATA or WxH:RLE:DATA)
 */
function exportToString(compress = false) {
    let dataString = '';

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            dataString += ColorPalette.getBase64Char(data[y][x]);
        }
    }

    const uncompressed = `${width}x${height}:${dataString}`;

    // Apply compression if requested and available
    if (compress && Compression) {
        const result = Compression.smartCompress(uncompressed);
        return result.data;
    }

    return uncompressed;
}

/**
 * Import from Base64 string
 * @param {string} str - Import string (WxH:DATA or WxH:RLE:DATA)
 * @returns {Object} {success: boolean, error: string|null}
 */
function importFromString(str) {
    try {
        // Validate format
        const validation = ValidationUtils.validateDataString(str);
        if (!validation.valid) {
            return { success: false, error: validation.error };
        }

        // Decompress if needed
        let decompressedString = str;
        if (Compression && Compression.isCompressed(str)) {
            decompressedString = Compression.decompress(str);
            logger.debug?.('Data decompressed');
        }

        const parts = decompressedString.split(':');
        const dimensions = parts[0].split('x');
        const newWidth = parseInt(dimensions[0]);
        const newHeight = parseInt(dimensions[1]);
        const dataString = parts[1];

        // Update dimensions
        width = newWidth;
        height = newHeight;

        // Parse pixel data
        clear();
        let index = 0;
        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const char = dataString[index];
                const colorIndex = ColorPalette.getIndexFromChar(char);

                if (colorIndex === -1) {
                    return { success: false, error: `Invalid character: ${char}` };
                }

                data[y][x] = colorIndex;
                index++;
            }
        }

        logger.info?.(`Data imported: ${width}×${height}`);
        return { success: true, error: null };

    } catch (error) {
        logger.error?.('Import failed', error);
        return { success: false, error: error.message };
    }
}

/**
 * Clone pixel data
 * @returns {Array<Array<number>>} Cloned data
 */
function clone() {
    return data.map(row => [...row]);
}

/**
 * Check if canvas has any non-transparent pixels
 * @returns {boolean} True if has content
 */
function hasContent() {
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (data[y][x] !== 0) {
                return true;
            }
        }
    }
    return false;
}

/**
 * Get statistics
 * @returns {Object} Statistics
 */
function getStats() {
    const colorCounts = {};
    let transparentCount = 0;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const color = data[y][x];
            if (color === 0) {
                transparentCount++;
            } else {
                colorCounts[color] = (colorCounts[color] || 0) + 1;
            }
        }
    }

    const totalPixels = width * height;
    const usedColors = Object.keys(colorCounts).length;

    return {
        width,
        height,
        totalPixels,
        transparentPixels: transparentCount,
        usedColors,
        colorCounts,
        fillPercentage: ((totalPixels - transparentCount) / totalPixels * 100).toFixed(1)
    };
}

const PixelData = {
    init,
    clear,
    getData,
    setData,
    getDimensions,
    getPixel,
    setPixel,
    resize,
    exportToString,
    importFromString,
    clone,
    hasContent,
    getStats
};

export default PixelData;
