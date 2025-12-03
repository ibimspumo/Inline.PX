/**
 * ConfigValidator - Validates configuration JSON files
 *
 * Ensures config files meet expected schema before use
 * Prevents runtime errors from malformed configs
 *
 * @module ConfigValidator
 */

import logger from '../core/Logger.js';

/**
 * Validate colors configuration
 * @param {Object} config - Colors config object
 * @returns {{valid: boolean, errors: Array<string>}} Validation result
 */
export function validateColorsConfig(config) {
    const errors = [];

    // Check base64Chars
    if (!config.base64Chars || typeof config.base64Chars !== 'string') {
        errors.push('Missing or invalid base64Chars');
    } else if (config.base64Chars.length !== 64) {
        errors.push(`base64Chars must be 64 characters, got ${config.base64Chars.length}`);
    }

    // Check palette
    if (!Array.isArray(config.palette)) {
        errors.push('palette must be an array');
    } else if (config.palette.length !== 64) {
        errors.push(`palette must have 64 colors, got ${config.palette.length}`);
    } else {
        // Validate each palette entry
        config.palette.forEach((item, i) => {
            if (typeof item.index !== 'number' || item.index !== i) {
                errors.push(`palette[${i}]: invalid or mismatched index`);
            }
            if (!item.char || typeof item.char !== 'string' || item.char.length !== 1) {
                errors.push(`palette[${i}]: invalid char`);
            }
            if (!item.color || typeof item.color !== 'string') {
                errors.push(`palette[${i}]: invalid color`);
            }
            if (!item.name || typeof item.name !== 'string') {
                errors.push(`palette[${i}]: invalid name`);
            }
            if (!item.category || typeof item.category !== 'string') {
                errors.push(`palette[${i}]: invalid category`);
            }
        });
    }

    if (errors.length > 0) {
        logger.error?.('Colors config validation failed:', errors);
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate constants configuration
 * @param {Object} config - Constants config object
 * @returns {{valid: boolean, errors: Array<string>}} Validation result
 */
export function validateConstantsConfig(config) {
    const errors = [];

    // Check canvas
    if (!config.canvas || typeof config.canvas !== 'object') {
        errors.push('Missing or invalid canvas config');
    } else {
        const canvas = config.canvas;

        if (typeof canvas.minSize !== 'number' || canvas.minSize < 1) {
            errors.push('canvas.minSize must be a positive number');
        }
        if (typeof canvas.maxSize !== 'number' || canvas.maxSize < canvas.minSize) {
            errors.push('canvas.maxSize must be >= canvas.minSize');
        }
        if (typeof canvas.defaultWidth !== 'number') {
            errors.push('canvas.defaultWidth must be a number');
        }
        if (typeof canvas.defaultHeight !== 'number') {
            errors.push('canvas.defaultHeight must be a number');
        }
        if (typeof canvas.minPixelSize !== 'number' || canvas.minPixelSize < 1) {
            errors.push('canvas.minPixelSize must be a positive number');
        }
        if (typeof canvas.maxPixelSize !== 'number' || canvas.maxPixelSize < canvas.minPixelSize) {
            errors.push('canvas.maxPixelSize must be >= canvas.minPixelSize');
        }
        if (typeof canvas.defaultPixelSize !== 'number') {
            errors.push('canvas.defaultPixelSize must be a number');
        }
    }

    // Check history
    if (!config.history || typeof config.history !== 'object') {
        errors.push('Missing or invalid history config');
    } else {
        const history = config.history;

        if (typeof history.maxStates !== 'number' || history.maxStates < 1) {
            errors.push('history.maxStates must be a positive number');
        }
        if (typeof history.debounceTime !== 'number' || history.debounceTime < 0) {
            errors.push('history.debounceTime must be a non-negative number');
        }
    }

    // Check autosave
    if (!config.autosave || typeof config.autosave !== 'object') {
        errors.push('Missing or invalid autosave config');
    } else {
        const autosave = config.autosave;

        if (typeof autosave.interval !== 'number' || autosave.interval < 1000) {
            errors.push('autosave.interval must be >= 1000ms');
        }
        if (typeof autosave.debounceTime !== 'number' || autosave.debounceTime < 0) {
            errors.push('autosave.debounceTime must be a non-negative number');
        }
    }

    if (errors.length > 0) {
        logger.error?.('Constants config validation failed:', errors);
    }

    return {
        valid: errors.length === 0,
        errors
    };
}

/**
 * Validate any config object
 * @param {Object} config - Config object
 * @param {string} type - Config type ('colors' or 'constants')
 * @returns {{valid: boolean, errors: Array<string>}} Validation result
 */
export function validateConfig(config, type) {
    if (!config || typeof config !== 'object') {
        return {
            valid: false,
            errors: ['Config is null or not an object']
        };
    }

    switch (type) {
        case 'colors':
            return validateColorsConfig(config);
        case 'constants':
            return validateConstantsConfig(config);
        default:
            return {
                valid: false,
                errors: [`Unknown config type: ${type}`]
            };
    }
}

const ConfigValidator = {
    validateConfig,
    validateColorsConfig,
    validateConstantsConfig
};

export default ConfigValidator;
