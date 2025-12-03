/**
 * Logger Module - Unified Logging System
 *
 * Provides consistent logging across the application with levels:
 * - DEBUG: Development information
 * - INFO: General information
 * - WARN: Warnings
 * - ERROR: Errors
 *
 * @module Logger
 */

const Logger = (function() {
    'use strict';

    const LOG_LEVELS = {
        DEBUG: 0,
        INFO: 1,
        WARN: 2,
        ERROR: 3
    };

    let currentLevel = LOG_LEVELS.INFO;
    let enableConsole = true;
    let logHistory = [];
    const MAX_HISTORY = 100;

    /**
     * Set log level
     * @param {string} level - Log level ('DEBUG', 'INFO', 'WARN', 'ERROR')
     */
    function setLevel(level) {
        if (LOG_LEVELS[level] !== undefined) {
            currentLevel = LOG_LEVELS[level];
        }
    }

    /**
     * Enable/disable console output
     * @param {boolean} enabled - Console output enabled
     */
    function setConsoleEnabled(enabled) {
        enableConsole = enabled;
    }

    /**
     * Log debug message
     * @param {string} message - Log message
     * @param {Object} data - Additional data
     */
    function debug(message, data = null) {
        log(LOG_LEVELS.DEBUG, 'DEBUG', message, data);
    }

    /**
     * Log info message
     * @param {string} message - Log message
     * @param {Object} data - Additional data
     */
    function info(message, data = null) {
        log(LOG_LEVELS.INFO, 'INFO', message, data);
    }

    /**
     * Log warning message
     * @param {string} message - Log message
     * @param {Object} data - Additional data
     */
    function warn(message, data = null) {
        log(LOG_LEVELS.WARN, 'WARN', message, data);
    }

    /**
     * Log error message
     * @param {string} message - Log message
     * @param {Error|Object} error - Error object or additional data
     */
    function error(message, error = null) {
        log(LOG_LEVELS.ERROR, 'ERROR', message, error);
    }

    /**
     * Internal log function
     * @private
     */
    function log(level, levelName, message, data) {
        if (level < currentLevel) {
            return;
        }

        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level: levelName,
            message,
            data
        };

        // Add to history
        logHistory.push(logEntry);
        if (logHistory.length > MAX_HISTORY) {
            logHistory.shift();
        }

        // Console output
        if (enableConsole) {
            const consoleMessage = `[${timestamp}] [${levelName}] ${message}`;

            switch (level) {
                case LOG_LEVELS.DEBUG:
                    console.debug(consoleMessage, data || '');
                    break;
                case LOG_LEVELS.INFO:
                    console.info(consoleMessage, data || '');
                    break;
                case LOG_LEVELS.WARN:
                    console.warn(consoleMessage, data || '');
                    break;
                case LOG_LEVELS.ERROR:
                    console.error(consoleMessage, data || '');
                    break;
            }
        }
    }

    /**
     * Get log history
     * @returns {Array} Log history
     */
    function getHistory() {
        return [...logHistory];
    }

    /**
     * Clear log history
     */
    function clearHistory() {
        logHistory = [];
    }

    /**
     * Export logs as text
     * @returns {string} Logs as formatted text
     */
    function exportLogs() {
        return logHistory.map(entry => {
            let line = `[${entry.timestamp}] [${entry.level}] ${entry.message}`;
            if (entry.data) {
                line += ` | ${JSON.stringify(entry.data)}`;
            }
            return line;
        }).join('\n');
    }

    // Public API
    return {
        LOG_LEVELS,
        setLevel,
        setConsoleEnabled,
        debug,
        info,
        warn,
        error,
        getHistory,
        clearHistory,
        exportLogs
    };
})();

if (typeof window !== 'undefined') {
    window.Logger = Logger;
}
