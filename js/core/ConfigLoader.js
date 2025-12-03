/**
 * ConfigLoader - Configuration File Loader
 *
 * Loads JSON configuration files:
 * - colors.json (64-color palette)
 * - constants.json (app-wide constants)
 *
 * Provides caching and error handling
 *
 * @module ConfigLoader
 */

const ConfigLoader = (function() {
    'use strict';

    const cache = {};
    const logger = window.Logger || console;

    /**
     * Load configuration file
     * @param {string} path - Path to config file
     * @returns {Promise<Object>} Configuration object
     */
    async function load(path) {
        // Check cache
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
     * Load colors configuration
     * @returns {Promise<Object>} Colors config
     */
    async function loadColors() {
        // Try JS module first (file:// compatibility)
        if (window.ColorConfig) {
            logger.debug?.('Colors loaded from JS module');
            cache['config/colors'] = window.ColorConfig;
            return window.ColorConfig;
        }
        // Fallback to JSON (HTTP only)
        return load('config/colors.json');
    }

    /**
     * Load constants configuration
     * @returns {Promise<Object>} Constants config
     */
    async function loadConstants() {
        // Try JS module first (file:// compatibility)
        if (window.Constants) {
            logger.debug?.('Constants loaded from JS module');
            cache['config/constants'] = window.Constants;
            return window.Constants;
        }
        // Fallback to JSON (HTTP only)
        return load('config/constants.json');
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
     * Reload configuration
     * @param {string} path - Config path
     * @returns {Promise<Object>} Reloaded config
     */
    async function reload(path) {
        clearCache(path);
        return load(path);
    }

    // Public API
    return {
        load,
        loadColors,
        loadConstants,
        getCache,
        clearCache,
        reload
    };
})();

if (typeof window !== 'undefined') {
    window.ConfigLoader = ConfigLoader;
}
