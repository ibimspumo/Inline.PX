/**
 * ConfigLoader - Configuration File Loader
 *
 * Loads configuration files from ES modules and provides a fallback for dynamic JSON loading.
 *
 * @module ConfigLoader
 */

import logger from './Logger.js';
import ColorConfig from '../../config/colors.js';
import Constants from '../../config/constants.js';

const cache = {};

// Direct access to ES module configs
const STATIC_COLORS = ColorConfig;
const STATIC_CONSTANTS = Constants;

/**
 * Load configuration file (primarily for dynamic/runtime configs, or if static fails)
 * @param {string} path - Path to config file
 * @returns {Promise<Object>} Configuration object
 */
async function load(path) {
    if (cache[path]) {
        logger.debug?.(`Config loaded from cache: ${path}`);
        return cache[path];
    }

    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        cache[path] = data;
        logger.info?.(`Config loaded: ${path}`);
        return data;
    } catch (error) {
        logger.error?.(`Failed to load config: ${path}`, error);
        throw error;
    }
}

/**
 * Load colors configuration. Prioritizes static ES module.
 * @returns {Promise<Object>} Colors config
 */
async function loadColors() {
    logger.debug?.('Colors loaded from ES module (static)');
    return STATIC_COLORS;
}

/**
 * Load constants configuration. Prioritizes static ES module.
 * @returns {Promise<Object>} Constants config
 */
async function loadConstants() {
    logger.debug?.('Constants loaded from ES module (static)');
    return STATIC_CONSTANTS;
}

/**
 * Get cached config
 * @param {string} path - Config path
 * @returns {Object|null} Cached config or null
 */
function getCache(path) {
    return cache[path] || null;
}

/**
 * Clear cache
 * @param {string} path - Specific path or null for all
 */
function clearCache(path = null) {
    if (path) {
        delete cache[path];
    } else {
        Object.keys(cache).forEach(key => delete cache[key]);
    }
}

/**
 * Reload configuration (bypasses cache)
 * @param {string} path - Config path
 * @returns {Promise<Object>} Reloaded config
 */
async function reload(path) {
    clearCache(path);
    return load(path);
}

const ConfigLoader = {
    load,
    loadColors,
    loadConstants,
    getCache,
    clearCache,
    reload
};

export default ConfigLoader;
