/**
 * Dialogs - Custom Dialog System (Refactored)
 *
 * Beautiful modal dialogs that replace browser alerts, confirms, and prompts
 * Provides consistent UX across the application
 *
 * @module Dialogs
 *
 * @typedef {import('./types.js').ConfirmOptions} ConfirmOptions
 * @typedef {import('./types.js').PromptOptions} PromptOptions
 * @typedef {import('./types.js').ExportResult} ExportResult
 */

import logger from './core/Logger.js';
import { initDialogSystem, createDialogElement, showDialog, closeDialog } from './dialogs/DialogCore.js';
import { getIconForType } from './dialogs/DialogHelpers.js';
import { showExportDialog } from './dialogs/ExportDialog.js';

/**
 * Initialize dialog system
 */
function init() {
    initDialogSystem();
    logger.info?.('Dialog system initialized');
}

/**
 * Show alert dialog
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {string} type - Dialog type: 'info', 'success', 'warning', 'error'
 * @returns {Promise} Resolves when user clicks OK
 */
function alert(title, message, type = 'info') {
    return new Promise((resolve) => {
        const dialog = createDialogElement({
            title: title,
            message: message,
            icon: getIconForType(type),
            type: type,
            buttons: [
                {
                    text: 'OK',
                    type: 'primary',
                    action: () => {
                        closeDialog();
                        resolve(true);
                    }
                }
            ]
        });

        showDialog(dialog);
    });
}

/**
 * Show confirm dialog
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {Object} options - Button options
 * @returns {Promise<boolean>} Resolves with true/false
 */
function confirm(title, message, options = {}) {
    return new Promise((resolve) => {
        const confirmText = options.confirmText || 'Confirm';
        const cancelText = options.cancelText || 'Cancel';
        const type = options.type || 'warning';
        const dangerous = options.dangerous || false;

        const dialog = createDialogElement({
            title: title,
            message: message,
            icon: getIconForType(type),
            type: type,
            buttons: [
                {
                    text: cancelText,
                    type: 'secondary',
                    action: () => {
                        closeDialog();
                        resolve(false);
                    }
                },
                {
                    text: confirmText,
                    type: dangerous ? 'danger' : 'primary',
                    action: () => {
                        closeDialog();
                        resolve(true);
                    }
                }
            ]
        });

        showDialog(dialog);
    });
}

/**
 * Show prompt dialog
 * @param {string} title - Dialog title
 * @param {string} message - Dialog message
 * @param {string} defaultValue - Default input value
 * @param {Object} options - Additional options
 * @returns {Promise<string|null>} Resolves with input value or null
 */
function prompt(title, message, defaultValue = '', options = {}) {
    return new Promise((resolve) => {
        const placeholder = options.placeholder || '';
        const inputType = options.inputType || 'text';

        const dialog = createDialogElement({
            title: title,
            message: message,
            icon: 'edit_note',
            type: 'info',
            input: {
                type: inputType,
                value: defaultValue,
                placeholder: placeholder
            },
            buttons: [
                {
                    text: 'Cancel',
                    type: 'secondary',
                    action: () => {
                        closeDialog();
                        resolve(null);
                    }
                },
                {
                    text: 'OK',
                    type: 'primary',
                    action: () => {
                        const input = dialog.querySelector('.dialog-input');
                        const value = input ? input.value : null;
                        closeDialog();
                        resolve(value);
                    }
                }
            ]
        });

        showDialog(dialog);

        // Auto-focus and select input
        setTimeout(() => {
            const input = dialog.querySelector('.dialog-input');
            if (input) {
                input.focus();
                input.select();

                // Submit on Enter key
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        const value = input.value;
                        closeDialog();
                        resolve(value);
                    }
                });
            }
        }, 100);
    });
}

/**
 * Show custom export dialog
 * @param {string} dataString - Export data string
 * @returns {Promise<Object>} Resolves with export options
 */
function exportDialog(dataString) {
    return showExportDialog(dataString);
}

const Dialogs = {
    init,
    alert,
    confirm,
    prompt,
    exportDialog
};

export default Dialogs;
