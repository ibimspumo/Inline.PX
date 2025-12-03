/**
 * Custom Dialog System - Beautiful modal dialogs
 *
 * Replaces browser alerts, confirms, and prompts with custom styled dialogs
 * Provides consistent UX across the application
 */

import Compression from './compression.js';
import ClipboardUtils from './utils/ClipboardUtils.js';
import PNGExport from './pngExport.js';

let dialogContainer = null;
let currentDialog = null;

    /**
     * Initialize dialog system
     */
    function init() {
        createDialogContainer();
        console.log('Dialog system initialized');
    }

    /**
     * Create dialog container
     */
    function createDialogContainer() {
        dialogContainer = document.createElement('div');
        dialogContainer.id = 'dialogContainer';
        dialogContainer.className = 'dialog-overlay';
        dialogContainer.style.display = 'none';
        document.body.appendChild(dialogContainer);

        // Close on overlay click
        dialogContainer.addEventListener('click', (e) => {
            if (e.target === dialogContainer) {
                closeDialog();
            }
        });

        // Close on ESC key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && currentDialog) {
                closeDialog();
            }
        });
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
            const iconMap = {
                info: 'info',
                success: 'check_circle',
                warning: 'warning',
                error: 'error'
            };

            const dialog = createDialogElement({
                title: title,
                message: message,
                icon: iconMap[type] || iconMap.info,
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

            const iconMap = {
                info: 'info',
                success: 'check_circle',
                warning: 'warning',
                error: 'error'
            };

            const dialog = createDialogElement({
                title: title,
                message: message,
                icon: iconMap[type],
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
        return new Promise((resolve) => {
            // Get compression stats
            const compressionStats = Compression ? Compression.getStats(dataString) : null;
            const canCompress = compressionStats !== null; // Always show option if Compression module exists

            const dialog = createDialogElement({
                title: 'Export Pixel Art',
                message: 'Choose how you want to export your pixel art:',
                icon: 'download',
                type: 'info',
                customContent: `
                    <div class="export-options">
                        <!-- String Preview -->
                        <div class="export-preview">
                            <div class="export-preview-header">
                                <strong>Text Format Preview:</strong>
                                <span class="export-preview-size">${dataString.length} chars</span>
                            </div>
                            <code class="export-code-preview">${escapeHtml(dataString.substring(0, 100))}${dataString.length > 100 ? '...' : ''}</code>
                        </div>

                        <!-- Compression Option -->
                        ${canCompress ? `
                        <div class="export-option-group">
                            <label class="export-checkbox-label">
                                <input type="checkbox" id="exportCompress" class="export-checkbox" ${compressionStats.savings > 0 ? 'checked' : ''} />
                                <span>Use RLE Compression</span>
                                <span class="export-savings ${compressionStats.savings > 0 ? '' : 'export-warning'}">${compressionStats.savings > 0 ? 'Save' : 'Adds'} ${Math.abs(compressionStats.savings)}% (${compressionStats.originalSize} → ${compressionStats.compressedSize} chars)</span>
                            </label>
                            <div class="export-option-info">
                                ${compressionStats.savings > 0
                                    ? 'Compresses repeated pixels for smaller file size. Recommended for sprites with large solid areas.'
                                    : 'Note: This sprite has few repeated pixels, so compression increases file size. Use only if needed for compatibility.'}
                            </div>

                            <!-- Compression Preview -->
                            <div class="compression-preview">
                                <div class="compression-preview-section">
                                    <div class="compression-preview-label">
                                        <strong>Before:</strong>
                                        <span class="compression-preview-size">${compressionStats.originalSize} chars</span>
                                    </div>
                                    <code class="compression-preview-code">${escapeHtml(dataString.substring(0, 80))}${dataString.length > 80 ? '...' : ''}</code>
                                </div>
                                <div class="compression-preview-arrow">→</div>
                                <div class="compression-preview-section">
                                    <div class="compression-preview-label">
                                        <strong>After:</strong>
                                        <span class="compression-preview-size compression-highlight">${compressionStats.compressedSize} chars</span>
                                    </div>
                                    <code class="compression-preview-code">${escapeHtml(compressionStats.compressed.substring(0, 80))}${compressionStats.compressed.length > 80 ? '...' : ''}</code>
                                </div>
                            </div>
                        </div>
                        ` : ''}

                        <!-- Export Format Buttons -->
                        <div class="export-format-section">
                            <strong>Export as:</strong>
                            <div class="export-format-buttons">
                                <button class="export-format-btn" data-format="copy-string">
                                    <span class="material-symbols-outlined export-format-icon">content_copy</span>
                                    <span class="export-format-label">Copy String</span>
                                    <span class="export-format-desc">Copy to clipboard</span>
                                </button>
                                <button class="export-format-btn" data-format="download-txt">
                                    <span class="material-symbols-outlined export-format-icon">description</span>
                                    <span class="export-format-label">Download TXT</span>
                                    <span class="export-format-desc">Save as text file</span>
                                </button>
                                <button class="export-format-btn" data-format="download-png">
                                    <span class="material-symbols-outlined export-format-icon">image</span>
                                    <span class="export-format-label">Download PNG</span>
                                    <span class="export-format-desc">Save as image</span>
                                </button>
                            </div>
                        </div>

                        <!-- PNG Scale Options (hidden initially) -->
                        <div id="pngScaleOptions" class="png-scale-options" style="display: none;">
                            <strong>PNG Scale:</strong>
                            <div class="png-scale-buttons">
                                <button class="png-scale-btn active" data-scale="1">1×</button>
                                <button class="png-scale-btn" data-scale="2">2×</button>
                                <button class="png-scale-btn" data-scale="4">4×</button>
                                <button class="png-scale-btn" data-scale="8">8×</button>
                            </div>
                        </div>
                    </div>
                `,
                buttons: [
                    {
                        text: 'Cancel',
                        type: 'secondary',
                        action: () => {
                            closeDialog();
                            resolve(null);
                        }
                    }
                ]
            });

            showDialog(dialog);

            // Setup format button handlers
            let selectedFormat = null;
            let selectedScale = 1;

            dialog.querySelectorAll('.export-format-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    // Update selection
                    dialog.querySelectorAll('.export-format-btn').forEach(b => b.classList.remove('selected'));
                    btn.classList.add('selected');
                    selectedFormat = btn.dataset.format;

                    // Show PNG scale options if PNG selected
                    const pngOptions = dialog.querySelector('#pngScaleOptions');
                    if (selectedFormat === 'download-png') {
                        pngOptions.style.display = 'block';
                    } else {
                        pngOptions.style.display = 'none';
                    }

                    // Auto-submit on selection
                    setTimeout(() => {
                        const useCompression = dialog.querySelector('#exportCompress')?.checked || false;
                        closeDialog();
                        resolve({
                            format: selectedFormat,
                            compress: useCompression,
                            scale: selectedScale
                        });
                    }, 150);
                });
            });

            // Setup PNG scale handlers
            dialog.querySelectorAll('.png-scale-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dialog.querySelectorAll('.png-scale-btn').forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    selectedScale = parseInt(btn.dataset.scale);
                });
            });
        });
    }

    /**
     * Create dialog element
     * @param {Object} config - Dialog configuration
     * @returns {HTMLElement} Dialog element
     */
    function createDialogElement(config) {
        const dialog = document.createElement('div');
        dialog.className = `dialog-content dialog-${config.type}`;

        // Header
        const header = document.createElement('div');
        header.className = 'dialog-header';
        header.innerHTML = `
            <span class="material-symbols-outlined dialog-icon">${config.icon}</span>
            <h2 class="dialog-title">${escapeHtml(config.title)}</h2>
        `;
        dialog.appendChild(header);

        // Body
        const body = document.createElement('div');
        body.className = 'dialog-body';

        if (config.message) {
            const messagePara = document.createElement('p');
            messagePara.className = 'dialog-message';
            messagePara.textContent = config.message;
            body.appendChild(messagePara);
        }

        // Custom content
        if (config.customContent) {
            const customDiv = document.createElement('div');
            customDiv.innerHTML = config.customContent;
            body.appendChild(customDiv);
        }

        // Input field
        if (config.input) {
            const input = document.createElement('input');
            input.type = config.input.type;
            input.value = config.input.value;
            input.placeholder = config.input.placeholder;
            input.className = 'dialog-input';
            body.appendChild(input);
        }

        dialog.appendChild(body);

        // Footer with buttons
        const footer = document.createElement('div');
        footer.className = 'dialog-footer';

        config.buttons.forEach(btnConfig => {
            const btn = document.createElement('button');
            btn.className = `dialog-btn dialog-btn-${btnConfig.type}`;
            btn.textContent = btnConfig.text;
            btn.addEventListener('click', btnConfig.action);
            footer.appendChild(btn);
        });

        dialog.appendChild(footer);

        return dialog;
    }

    /**
     * Show dialog
     * @param {HTMLElement} dialog - Dialog element
     */
    function showDialog(dialog) {
        dialogContainer.innerHTML = '';
        dialogContainer.appendChild(dialog);
        dialogContainer.style.display = 'flex';
        currentDialog = dialog;

        // Animate in
        setTimeout(() => {
            dialog.classList.add('dialog-show');
        }, 10);

        // Focus first button
        const firstButton = dialog.querySelector('.dialog-btn');
        if (firstButton) {
            firstButton.focus();
        }
    }

    /**
     * Close current dialog
     */
    function closeDialog() {
        if (currentDialog) {
            currentDialog.classList.remove('dialog-show');
            setTimeout(() => {
                dialogContainer.style.display = 'none';
                dialogContainer.innerHTML = '';
                currentDialog = null;
            }, 200);
        }
    }

    /**
     * Escape HTML to prevent XSS
     * @param {string} text - Text to escape
     * @returns {string} Escaped text
     */
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

const Dialogs = {
    init,
    alert,
    confirm,
    prompt,
    exportDialog
};

export default Dialogs;
