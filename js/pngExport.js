/**
 * PNG Export Module
 *
 * Exports pixel art as PNG images using Canvas API
 * Supports different scales and formats
 */

import logger from './core/Logger.js';
import PixelCanvas from './canvas/PixelCanvas.js';
import ColorPalette from './colorPalette.js';
import Compression from './compression.js';

/**
 * Export current canvas to PNG
 * @param {number} scale - Scale factor (1, 2, 4, 8, etc.)
 * @param {string} filename - Output filename
 */
function exportToPNG(scale = 1, filename = 'pixelart.png') {
    const canvas = document.getElementById('pixelCanvas');
    if (!canvas) {
        logger.error('Canvas not found');
        return;
    }

    const dimensions = PixelCanvas.getDimensions();
    const pixelData = PixelCanvas.getPixelData();

    // Create temporary canvas at desired scale
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = dimensions.width * scale;
    exportCanvas.height = dimensions.height * scale;
    const ctx = exportCanvas.getContext('2d');

    // Disable image smoothing for pixel-perfect rendering
    ctx.imageSmoothingEnabled = false;
    ctx.imageSmoothingQuality = 'high';

    // Draw each pixel at scaled size
    for (let y = 0; y < dimensions.height; y++) {
        for (let x = 0; x < dimensions.width; x++) {
            const colorIndex = pixelData[y][x];

            // Skip transparent pixels (0)
            if (colorIndex === 0) continue;

            const color = ColorPalette.getColor(colorIndex);
            ctx.fillStyle = color;
            ctx.fillRect(x * scale, y * scale, scale, scale);
        }
    }

    // Convert to blob and download
    exportCanvas.toBlob((blob) => {
        downloadBlob(blob, filename);
    }, 'image/png');
}

/**
 * Export pixel art data string to PNG
 * @param {string} dataString - Pixel art data string (WxH:DATA)
 * @param {number} scale - Scale factor
 * @param {string} filename - Output filename
 */
function exportDataStringToPNG(dataString, scale = 1, filename = 'pixelart.png') {
    // Parse data string
    let parsedData = dataString;

    // Check if compressed, decompress if needed
    if (Compression && Compression.isCompressed(dataString)) {
        parsedData = Compression.decompress(dataString);
    }

    const [dimensions, data] = parsedData.split(':');
    const [width, height] = dimensions.split('x').map(Number);

    // Create canvas
    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = width * scale;
    exportCanvas.height = height * scale;
    const ctx = exportCanvas.getContext('2d');

    ctx.imageSmoothingEnabled = false;

    // Draw pixels
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = y * width + x;
            const char = data[index];
            const colorIndex = ColorPalette.getIndexFromChar(char);

            if (colorIndex === 0) continue; // Skip transparent

            const color = ColorPalette.getColor(colorIndex);
            ctx.fillStyle = color;
            ctx.fillRect(x * scale, y * scale, scale, scale);
        }
    }

    // Convert to blob and download
    exportCanvas.toBlob((blob) => {
        downloadBlob(blob, filename);
    }, 'image/png');
}

/**
 * Get PNG as data URL
 * @param {number} scale - Scale factor
 * @returns {string} Data URL
 */
function getDataURL(scale = 1) {
    const dimensions = PixelCanvas.getDimensions();
    const pixelData = PixelCanvas.getPixelData();

    const exportCanvas = document.createElement('canvas');
    exportCanvas.width = dimensions.width * scale;
    exportCanvas.height = dimensions.height * scale;
    const ctx = exportCanvas.getContext('2d');

    ctx.imageSmoothingEnabled = false;

    for (let y = 0; y < dimensions.height; y++) {
        for (let x = 0; x < dimensions.width; x++) {
            const colorIndex = pixelData[y][x];

            if (colorIndex === 0) continue;

            const color = ColorPalette.getColor(colorIndex);
            ctx.fillStyle = color;
            ctx.fillRect(x * scale, y * scale, scale, scale);
        }
    }

    return exportCanvas.toDataURL('image/png');
}

/**
 * Download blob as file
 * @param {Blob} blob - Blob to download
 * @param {string} filename - Filename
 */
function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

/**
 * Copy PNG to clipboard
 * @param {number} scale - Scale factor
 * @returns {Promise<boolean>} Success
 */
async function copyToClipboard(scale = 1) {
    try {
        const dimensions = PixelCanvas.getDimensions();
        const pixelData = PixelCanvas.getPixelData();

        const exportCanvas = document.createElement('canvas');
        exportCanvas.width = dimensions.width * scale;
        exportCanvas.height = dimensions.height * scale;
        const ctx = exportCanvas.getContext('2d');

        ctx.imageSmoothingEnabled = false;

        for (let y = 0; y < dimensions.height; y++) {
            for (let x = 0; x < dimensions.width; x++) {
                const colorIndex = pixelData[y][x];

                if (colorIndex === 0) continue;

                const color = ColorPalette.getColor(colorIndex);
                ctx.fillStyle = color;
                ctx.fillRect(x * scale, y * scale, scale, scale);
            }
        }

        // Convert to blob
        const blob = await new Promise(resolve => {
            exportCanvas.toBlob(resolve, 'image/png');
        });

        // Copy to clipboard
        if (navigator.clipboard && navigator.clipboard.write) {
            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': blob })
            ]);
            return true;
        } else {
            throw new Error('Clipboard API not supported');
        }
    } catch (error) {
        logger.error('Failed to copy PNG to clipboard:', error);
        return false;
    }
}

/**
 * Get available PNG scales
 * @returns {Array<Object>} Scale options
 */
function getScaleOptions() {
    const dimensions = PixelCanvas.getDimensions();
    const maxDimension = Math.max(dimensions.width, dimensions.height);

    const scales = [
        { value: 1, label: '1× (Original)', size: `${dimensions.width}×${dimensions.height}` },
        { value: 2, label: '2× (Small)', size: `${dimensions.width * 2}×${dimensions.height * 2}` },
        { value: 4, label: '4× (Medium)', size: `${dimensions.width * 4}×${dimensions.height * 4}` },
        { value: 8, label: '8× (Large)', size: `${dimensions.width * 8}×${dimensions.height * 8}` },
    ];

    // Only include scales that result in reasonable sizes
    return scales.filter(scale => {
        const scaledSize = maxDimension * scale.value;
        return scaledSize <= 2048; // Max 2048px
    });
}

const PNGExport = {
    exportToPNG,
    exportDataStringToPNG,
    getDataURL,
    copyToClipboard,
    getScaleOptions
};

export default PNGExport;
