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

function setLevel(level) {
    if (LOG_LEVELS[level] !== undefined) {
        currentLevel = LOG_LEVELS[level];
    }
}

function setConsoleEnabled(enabled) {
    enableConsole = enabled;
}

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

    logHistory.push(logEntry);
    if (logHistory.length > MAX_HISTORY) {
        logHistory.shift();
    }

    if (enableConsole) {
        const consoleMessage = `[${timestamp}] [${levelName}] ${message}`;
        const consoleMethod = levelName.toLowerCase();

        if(console[consoleMethod]) {
             console[consoleMethod](consoleMessage, data || '');
        } else {
             console.log(consoleMessage, data || '');
        }
    }
}

const Logger = {
    LOG_LEVELS,
    setLevel,
    setConsoleEnabled,
    debug: (message, data = null) => log(LOG_LEVELS.DEBUG, 'DEBUG', message, data),
    info: (message, data = null) => log(LOG_LEVELS.INFO, 'INFO', message, data),
    warn: (message, data = null) => log(LOG_LEVELS.WARN, 'WARN', message, data),
    error: (message, error = null) => log(LOG_LEVELS.ERROR, 'ERROR', message, error),
    getHistory: () => [...logHistory],
    clearHistory: () => { logHistory = []; },
    exportLogs: () => {
        return logHistory.map(entry => {
            let line = `[${entry.timestamp}] [${entry.level}] ${entry.message}`;
            if (entry.data) {
                line += ` | ${JSON.stringify(entry.data)}`;
            }
            return line;
        }).join('\n');
    }
};

export default Logger;
