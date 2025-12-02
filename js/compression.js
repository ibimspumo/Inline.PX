/**
 * Compression Module - RLE (Run-Length Encoding)
 *
 * Provides optional compression for pixel art data strings
 * Uses Run-Length Encoding to compress repeated pixels
 */

const Compression = (function() {
    'use strict';

    /**
     * Compress data string using RLE
     * @param {string} dataString - Original data string (WxH:DATA)
     * @returns {Object} {compressed: string, original: string, savings: number}
     */
    function compress(dataString) {
        const [dimensions, data] = dataString.split(':');

        if (!data || data.length === 0) {
            return {
                compressed: dataString,
                original: dataString,
                savings: 0,
                compressionRatio: 1.0
            };
        }

        let compressed = '';
        let count = 1;
        let current = data[0];

        for (let i = 1; i <= data.length; i++) {
            if (i < data.length && data[i] === current && count < 999) {
                count++;
            } else {
                // Use RLE only if it saves space (run of 3 or more)
                if (count >= 3) {
                    compressed += `${count}${current}`;
                } else {
                    compressed += current.repeat(count);
                }

                if (i < data.length) {
                    current = data[i];
                    count = 1;
                }
            }
        }

        const compressedString = `${dimensions}:RLE:${compressed}`;
        const originalSize = dataString.length;
        const compressedSize = compressedString.length;
        const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
        const compressionRatio = (compressedSize / originalSize).toFixed(2);

        return {
            compressed: compressedString,
            original: dataString,
            savings: parseFloat(savings),
            compressionRatio: parseFloat(compressionRatio),
            originalSize: originalSize,
            compressedSize: compressedSize
        };
    }

    /**
     * Decompress RLE data string
     * @param {string} dataString - Compressed data string (WxH:RLE:DATA)
     * @returns {string} Decompressed data string (WxH:DATA)
     */
    function decompress(dataString) {
        const parts = dataString.split(':');

        // Not compressed
        if (parts.length === 2) {
            return dataString;
        }

        // Check if RLE compressed
        if (parts.length === 3 && parts[1] === 'RLE') {
            const dimensions = parts[0];
            const compressed = parts[2];
            let decompressed = '';
            let i = 0;

            while (i < compressed.length) {
                // Check if this is a run (starts with digit)
                if (/\d/.test(compressed[i])) {
                    // Parse count
                    let countStr = '';
                    while (i < compressed.length && /\d/.test(compressed[i])) {
                        countStr += compressed[i];
                        i++;
                    }
                    const count = parseInt(countStr);

                    // Get character
                    if (i < compressed.length) {
                        const char = compressed[i];
                        decompressed += char.repeat(count);
                        i++;
                    }
                } else {
                    // Single character
                    decompressed += compressed[i];
                    i++;
                }
            }

            return `${dimensions}:${decompressed}`;
        }

        // Unknown format, return as-is
        return dataString;
    }

    /**
     * Check if data string is compressed
     * @param {string} dataString - Data string to check
     * @returns {boolean} True if compressed
     */
    function isCompressed(dataString) {
        const parts = dataString.split(':');
        return parts.length === 3 && parts[1] === 'RLE';
    }

    /**
     * Smart compress - only compress if it results in smaller size
     * @param {string} dataString - Original data string
     * @returns {Object} Best option with stats
     */
    function smartCompress(dataString) {
        const result = compress(dataString);

        if (result.compressedSize < result.originalSize) {
            return {
                data: result.compressed,
                wasCompressed: true,
                savings: result.savings,
                compressionRatio: result.compressionRatio,
                originalSize: result.originalSize,
                compressedSize: result.compressedSize
            };
        } else {
            return {
                data: dataString,
                wasCompressed: false,
                savings: 0,
                compressionRatio: 1.0,
                originalSize: dataString.length,
                compressedSize: dataString.length
            };
        }
    }

    /**
     * Get compression stats without actually compressing
     * @param {string} dataString - Data string
     * @returns {Object} Stats object
     */
    function getStats(dataString) {
        return compress(dataString);
    }

    /**
     * Batch compress multiple data strings
     * @param {Array<string>} dataStrings - Array of data strings
     * @returns {Array<Object>} Array of compression results
     */
    function compressBatch(dataStrings) {
        return dataStrings.map(str => smartCompress(str));
    }

    // Public API
    return {
        compress,
        decompress,
        isCompressed,
        smartCompress,
        getStats,
        compressBatch
    };
})();
