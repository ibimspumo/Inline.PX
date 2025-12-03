/**
 * ValidationUtils - Input Validation Utilities
 *
 * Provides validation functions for user input:
 * - Canvas dimensions
 * - File names
 * - Data strings
 * - Colors
 *
 * @module ValidationUtils
 */

const ValidationUtils = (function() {
    'use strict';

    const logger = window.Logger || console;
    let constants = null;

    /**
     * Initialize with constants
     * @param {Object} config - Constants configuration
     */
    function init(config = null) {
        constants = config;
    }

    /**
     * Validate canvas dimensions
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @returns {Object} {valid: boolean, error: string|null}
     */
    function validateCanvasDimensions(width, height) {
        const minSize = constants?.canvas?.minSize || 2;
        const maxSize = constants?.canvas?.maxSize || 128;

        if (isNaN(width) || isNaN(height)) {
            return {
                valid: false,
                error: 'Width and height must be numbers'
            };
        }

        if (width < minSize || width > maxSize) {
            return {
                valid: false,
                error: `Width must be between ${minSize} and ${maxSize}`
            };
        }

        if (height < minSize || height > maxSize) {
            return {
                valid: false,
                error: `Height must be between ${minSize} and ${maxSize}`
            };
        }

        return { valid: true, error: null };
    }

    /**
     * Validate file name
     * @param {string} fileName - File name to validate
     * @returns {Object} {valid: boolean, error: string|null}
     */
    function validateFileName(fileName) {
        if (!fileName || fileName.trim().length === 0) {
            return {
                valid: false,
                error: 'File name cannot be empty'
            };
        }

        const maxLength = constants?.validation?.fileNameMaxLength || 100;
        if (fileName.length > maxLength) {
            return {
                valid: false,
                error: `File name too long (max ${maxLength} characters)`
            };
        }

        // Check for invalid characters
        const pattern = constants?.validation?.fileNamePattern || '^[a-zA-Z0-9_\\-\\.]+$';
        const regex = new RegExp(pattern);

        if (!regex.test(fileName)) {
            return {
                valid: false,
                error: 'File name contains invalid characters'
            };
        }

        return { valid: true, error: null };
    }

    /**
     * Validate data string format (WxH:DATA or WxH:RLE:DATA)
     * @param {string} dataString - Data string to validate
     * @returns {Object} {valid: boolean, error: string|null, info: Object}
     */
    function validateDataString(dataString) {
        if (!dataString || typeof dataString !== 'string') {
            return {
                valid: false,
                error: 'Data string must be a non-empty string',
                info: null
            };
        }

        const parts = dataString.split(':');

        // Must have at least dimensions and data
        if (parts.length < 2) {
            return {
                valid: false,
                error: 'Invalid format: must be "WxH:DATA" or "WxH:RLE:DATA"',
                info: null
            };
        }

        // Parse dimensions
        const dimensions = parts[0].split('x');
        if (dimensions.length !== 2) {
            return {
                valid: false,
                error: 'Invalid dimensions format: must be "WIDTHxHEIGHT"',
                info: null
            };
        }

        const width = parseInt(dimensions[0]);
        const height = parseInt(dimensions[1]);

        // Validate dimensions
        const dimValidation = validateCanvasDimensions(width, height);
        if (!dimValidation.valid) {
            return {
                valid: false,
                error: dimValidation.error,
                info: null
            };
        }

        // Check if RLE compressed
        const isRLE = parts.length === 3 && parts[1] === 'RLE';
        const dataIndex = isRLE ? 2 : 1;
        const data = parts[dataIndex];

        if (!data || data.length === 0) {
            return {
                valid: false,
                error: 'Data section is empty',
                info: null
            };
        }

        // For non-RLE, data length must match dimensions
        if (!isRLE) {
            const expectedLength = width * height;
            if (data.length !== expectedLength) {
                return {
                    valid: false,
                    error: `Data length mismatch: expected ${expectedLength}, got ${data.length}`,
                    info: null
                };
            }
        }

        return {
            valid: true,
            error: null,
            info: {
                width,
                height,
                isCompressed: isRLE,
                dataLength: data.length
            }
        };
    }

    /**
     * Validate hex color
     * @param {string} color - Hex color code
     * @returns {boolean} True if valid
     */
    function validateHexColor(color) {
        if (color === 'transparent') {
            return true;
        }

        const regex = /^#[0-9A-Fa-f]{6}$/;
        return regex.test(color);
    }

    /**
     * Validate color index
     * @param {number} index - Color index (0-63)
     * @returns {boolean} True if valid
     */
    function validateColorIndex(index) {
        return Number.isInteger(index) && index >= 0 && index <= 63;
    }

    /**
     * Validate Base64 character
     * @param {string} char - Character to validate
     * @returns {boolean} True if valid Base64 character
     */
    function validateBase64Char(char) {
        const base64Chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/';
        return typeof char === 'string' && char.length === 1 && base64Chars.includes(char);
    }

    /**
     * Sanitize file name
     * @param {string} fileName - File name to sanitize
     * @returns {string} Sanitized file name
     */
    function sanitizeFileName(fileName) {
        // Remove invalid characters
        return fileName
            .replace(/[^a-zA-Z0-9_\-\.]/g, '_')
            .replace(/_{2,}/g, '_')
            .substring(0, constants?.validation?.fileNameMaxLength || 100);
    }

    /**
     * Sanitize user input (prevent XSS)
     * @param {string} input - User input
     * @returns {string} Sanitized input
     */
    function sanitizeInput(input) {
        const div = document.createElement('div');
        div.textContent = input;
        return div.innerHTML;
    }

    // Public API
    return {
        init,
        validateCanvasDimensions,
        validateFileName,
        validateDataString,
        validateHexColor,
        validateColorIndex,
        validateBase64Char,
        sanitizeFileName,
        sanitizeInput
    };
})();

if (typeof window !== 'undefined') {
    window.ValidationUtils = ValidationUtils;
}
