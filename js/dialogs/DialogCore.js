/**
 * DialogCore - Core dialog system functionality
 *
 * Provides:
 * - Dialog container management
 * - Dialog element creation
 * - Show/hide animations
 * - ESC key and overlay click handling
 *
 * @module DialogCore
 *
 * @typedef {Object} DialogConfig
 * @property {string} title
 * @property {string} message
 * @property {string} icon
 * @property {string} type
 * @property {Array<Object>} buttons
 */

import { escapeHtml } from './DialogHelpers.js';

let dialogContainer = null;
let currentDialog = null;

/**
 * Initialize dialog system
 */
export function initDialogSystem() {
    createDialogContainer();
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
 * Create dialog element
 * @param {Object} config - Dialog configuration
 * @returns {HTMLElement} Dialog element
 */
export function createDialogElement(config) {
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
export function showDialog(dialog) {
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
export function closeDialog() {
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
 * Get current dialog
 * @returns {HTMLElement|null}
 */
export function getCurrentDialog() {
    return currentDialog;
}
