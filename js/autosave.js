/**
 * Autosave Module - Automatic saving with visual indicator
 *
 * Features:
 * - Automatic saving every 30 seconds
 * - Visual indicator showing save status
 * - Debouncing to prevent excessive saves
 * - Last saved timestamp display
 */

import logger from './core/Logger.js';
import TabManager from './tabManager.js';
import PixelCanvas from './canvas/PixelCanvas.js';

let autosaveInterval = null;
let saveTimeout = null;
let lastSaveTime = null;
let isDirty = false;
let isEnabled = true;

const AUTOSAVE_DELAY = 30000; // 30 seconds
const DEBOUNCE_DELAY = 2000; // 2 seconds after last change

/**
 * Initialize autosave system
 */
function init() {
    createAutosaveIndicator();
    startAutosave();
    logger.info('Autosave initialized');
}

/**
 * Create autosave indicator in UI
 */
function createAutosaveIndicator() {
    const menuBar = document.querySelector('.menu-bar');
    if (!menuBar) return;

    const indicator = document.createElement('div');
    indicator.id = 'autosaveIndicator';
    indicator.className = 'autosave-indicator';
    indicator.innerHTML = `
        <span class="autosave-status">
            <span class="autosave-icon">💾</span>
            <span class="autosave-text">Saved</span>
        </span>
        <span class="autosave-time"></span>
    `;

    menuBar.appendChild(indicator);
}

/**
 * Start autosave interval
 */
function startAutosave() {
    if (autosaveInterval) {
        clearInterval(autosaveInterval);
    }

    autosaveInterval = setInterval(() => {
        if (isDirty && isEnabled) {
            performSave();
        }
    }, AUTOSAVE_DELAY);
}

/**
 * Stop autosave interval
 */
function stopAutosave() {
    if (autosaveInterval) {
        clearInterval(autosaveInterval);
        autosaveInterval = null;
    }
}

/**
 * Mark content as changed (dirty)
 */
function markDirty() {
    isDirty = true;
    updateIndicator('unsaved');

    // Debounce: save after user stops making changes
    if (saveTimeout) {
        clearTimeout(saveTimeout);
    }

    saveTimeout = setTimeout(() => {
        if (isDirty && isEnabled) {
            performSave();
        }
    }, DEBOUNCE_DELAY);
}

/**
 * Perform the actual save
 */
function performSave() {
    if (!isEnabled) return;

    updateIndicator('saving');

    // Get current document data
    const currentTab = TabManager ? TabManager.getCurrentTab() : null;
    if (!currentTab) return;

    const dataString = PixelCanvas.exportToString();

    // Save to localStorage with tab ID
    try {
        const saveKey = `autosave_${currentTab.id}`;
        localStorage.setItem(saveKey, dataString);
        localStorage.setItem(`${saveKey}_timestamp`, Date.now().toString());

        isDirty = false;
        lastSaveTime = Date.now();

        setTimeout(() => {
            updateIndicator('saved');
        }, 500);

        logger.info('Autosaved:', currentTab.name);
    } catch (error) {
        logger.error('Autosave failed:', error);
        updateIndicator('error');
    }
}

/**
 * Update visual indicator
 * @param {string} status - 'saved', 'saving', 'unsaved', 'error'
 */
function updateIndicator(status) {
    const indicator = document.getElementById('autosaveIndicator');
    if (!indicator) return;

    const icon = indicator.querySelector('.autosave-icon');
    const text = indicator.querySelector('.autosave-text');
    const timeSpan = indicator.querySelector('.autosave-time');

    // Remove all status classes
    indicator.classList.remove('status-saved', 'status-saving', 'status-unsaved', 'status-error');

    switch (status) {
        case 'saved':
            indicator.classList.add('status-saved');
            icon.textContent = '✓';
            text.textContent = 'Saved';
            if (lastSaveTime) {
                timeSpan.textContent = formatTimeAgo(lastSaveTime);
            }
            break;

        case 'saving':
            indicator.classList.add('status-saving');
            icon.textContent = '⏳';
            text.textContent = 'Saving...';
            break;

        case 'unsaved':
            indicator.classList.add('status-unsaved');
            icon.textContent = '●';
            text.textContent = 'Unsaved';
            break;

        case 'error':
            indicator.classList.add('status-error');
            icon.textContent = '⚠️';
            text.textContent = 'Error';
            break;
    }
}

/**
 * Format time ago
 * @param {number} timestamp - Timestamp in ms
 * @returns {string} Formatted time
 */
function formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
}

/**
 * Update time display periodically
 */
function startTimeUpdater() {
    setInterval(() => {
        const indicator = document.getElementById('autosaveIndicator');
        const timeSpan = indicator?.querySelector('.autosave-time');

        if (timeSpan && lastSaveTime && !isDirty) {
            timeSpan.textContent = formatTimeAgo(lastSaveTime);
        }
    }, 30000); // Update every 30 seconds
}

/**
 * Load autosaved data for a tab
 * @param {string} tabId - Tab ID
 * @returns {Object|null} Autosaved data or null
 */
function loadAutosave(tabId) {
    try {
        const saveKey = `autosave_${tabId}`;
        const data = localStorage.getItem(saveKey);
        const timestamp = localStorage.getItem(`${saveKey}_timestamp`);

        if (data && timestamp) {
            return {
                data: data,
                timestamp: parseInt(timestamp)
            };
        }
    } catch (error) {
        logger.error('Failed to load autosave:', error);
    }
    return null;
}

/**
 * Clear autosave for a tab
 * @param {string} tabId - Tab ID
 */
function clearAutosave(tabId) {
    try {
        const saveKey = `autosave_${tabId}`;
        localStorage.removeItem(saveKey);
        localStorage.removeItem(`${saveKey}_timestamp`);
    } catch (error) {
        logger.error('Failed to clear autosave:', error);
    }
}

/**
 * Enable or disable autosave
 * @param {boolean} enabled - Enable state
 */
function setEnabled(enabled) {
    isEnabled = enabled;
    if (enabled) {
        startAutosave();
    } else {
        stopAutosave();
    }
}

/**
 * Force immediate save
 */
function forceSave() {
    performSave();
}

// Start time updater
startTimeUpdater();

const Autosave = {
    init,
    markDirty,
    forceSave,
    loadAutosave,
    clearAutosave,
    setEnabled
};

export default Autosave;
