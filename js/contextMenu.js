/**
 * Context Menu System - Dynamic right-click menu
 *
 * Features:
 * - Context-aware menu items (canvas, palette, toolbox, etc.)
 * - Dynamic item generation based on current state
 * - Keyboard shortcuts display
 * - Submenu support
 * - Icon support (Material Symbols)
 * - Separators and sections
 * - Conditional item visibility
 *
 * @module ContextMenu
 */

import logger from './core/Logger.js';

let currentMenu = null;
let menuElement = null;

/**
 * @typedef {Object} MenuItemConfig
 * @property {string} id - Unique item identifier
 * @property {string} label - Display label
 * @property {string} [icon] - Material Symbols icon name
 * @property {string} [shortcut] - Keyboard shortcut display
 * @property {Function} [action] - Action to execute on click
 * @property {boolean} [disabled] - Whether item is disabled
 * @property {boolean} [separator] - Whether this is a separator
 * @property {Array<MenuItemConfig>} [submenu] - Submenu items
 * @property {Function} [condition] - Function to determine if item should show
 * @property {string} [danger] - Mark as dangerous action
 */

/**
 * Initialize context menu system
 */
function init() {
    createMenuElement();
    setupGlobalListeners();
    logger.info?.('Context Menu system initialized');
}

/**
 * Create the menu DOM element
 * @private
 */
function createMenuElement() {
    menuElement = document.createElement('div');
    menuElement.className = 'context-menu';
    menuElement.id = 'contextMenu';
    menuElement.style.display = 'none';
    document.body.appendChild(menuElement);
}

/**
 * Setup global event listeners
 * @private
 */
function setupGlobalListeners() {
    // Close menu on click outside
    document.addEventListener('click', (e) => {
        if (menuElement && !menuElement.contains(e.target)) {
            hide();
        }
    });

    // Close menu on scroll
    document.addEventListener('scroll', hide, true);

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && currentMenu) {
            hide();
        }
    });
}

/**
 * Show context menu at position
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Array<MenuItemConfig>} items - Menu items
 * @param {Object} context - Context data for conditional items
 */
function show(x, y, items, context = {}) {
    if (!menuElement) {
        logger.warn?.('Context menu not initialized');
        return;
    }

    // Filter items based on conditions
    const filteredItems = items.filter(item => {
        if (item.condition && typeof item.condition === 'function') {
            return item.condition(context);
        }
        return true;
    });

    // Build menu HTML
    menuElement.innerHTML = '';
    filteredItems.forEach(item => {
        const itemElement = createMenuItem(item, context);
        menuElement.appendChild(itemElement);
    });

    // Position menu
    menuElement.style.left = `${x}px`;
    menuElement.style.top = `${y}px`;
    menuElement.style.display = 'block';

    // Adjust position if menu goes off-screen
    adjustPosition();

    currentMenu = { x, y, items, context };
}

/**
 * Create a menu item element
 * @private
 * @param {MenuItemConfig} item - Item configuration
 * @param {Object} context - Context data
 * @returns {HTMLElement} Menu item element
 */
function createMenuItem(item, context) {
    if (item.separator) {
        const separator = document.createElement('div');
        separator.className = 'context-menu-separator';
        return separator;
    }

    const itemElement = document.createElement('div');
    itemElement.className = 'context-menu-item';

    if (item.disabled) {
        itemElement.classList.add('disabled');
    }

    if (item.danger) {
        itemElement.classList.add('danger');
    }

    // Icon
    if (item.icon) {
        const icon = document.createElement('span');
        icon.className = 'material-symbols-outlined context-menu-icon';
        icon.textContent = item.icon;
        itemElement.appendChild(icon);
    }

    // Label
    const label = document.createElement('span');
    label.className = 'context-menu-label';
    label.textContent = item.label;
    itemElement.appendChild(label);

    // Shortcut
    if (item.shortcut) {
        const shortcut = document.createElement('span');
        shortcut.className = 'context-menu-shortcut';
        shortcut.textContent = item.shortcut;
        itemElement.appendChild(shortcut);
    }

    // Submenu indicator
    if (item.submenu && item.submenu.length > 0) {
        const arrow = document.createElement('span');
        arrow.className = 'material-symbols-outlined context-menu-arrow';
        arrow.textContent = 'chevron_right';
        itemElement.appendChild(arrow);
    }

    // Click handler
    if (!item.disabled && item.action) {
        itemElement.addEventListener('click', (e) => {
            e.stopPropagation();
            item.action(context);
            hide();
        });
    }

    // Hover handler for submenus
    if (item.submenu && item.submenu.length > 0) {
        itemElement.addEventListener('mouseenter', (e) => {
            showSubmenu(itemElement, item.submenu, context);
        });
    }

    return itemElement;
}

/**
 * Show submenu
 * @private
 * @param {HTMLElement} parentElement - Parent menu item
 * @param {Array<MenuItemConfig>} items - Submenu items
 * @param {Object} context - Context data
 */
function showSubmenu(parentElement, items, context) {
    // Remove existing submenus
    document.querySelectorAll('.context-submenu').forEach(el => el.remove());

    const submenu = document.createElement('div');
    submenu.className = 'context-menu context-submenu';

    items.forEach(item => {
        const itemElement = createMenuItem(item, context);
        submenu.appendChild(itemElement);
    });

    // Position submenu
    const rect = parentElement.getBoundingClientRect();
    submenu.style.left = `${rect.right}px`;
    submenu.style.top = `${rect.top}px`;
    submenu.style.display = 'block';

    document.body.appendChild(submenu);

    // Adjust if off-screen
    const submenuRect = submenu.getBoundingClientRect();
    if (submenuRect.right > window.innerWidth) {
        submenu.style.left = `${rect.left - submenuRect.width}px`;
    }
    if (submenuRect.bottom > window.innerHeight) {
        submenu.style.top = `${window.innerHeight - submenuRect.height - 10}px`;
    }
}

/**
 * Adjust menu position if it goes off-screen
 * @private
 */
function adjustPosition() {
    const rect = menuElement.getBoundingClientRect();

    // Adjust horizontal position
    if (rect.right > window.innerWidth) {
        menuElement.style.left = `${window.innerWidth - rect.width - 10}px`;
    }

    // Adjust vertical position
    if (rect.bottom > window.innerHeight) {
        menuElement.style.top = `${window.innerHeight - rect.height - 10}px`;
    }
}

/**
 * Hide context menu
 */
function hide() {
    if (menuElement) {
        menuElement.style.display = 'none';
        menuElement.innerHTML = '';
    }

    // Remove submenus
    document.querySelectorAll('.context-submenu').forEach(el => el.remove());

    currentMenu = null;
}

/**
 * Check if menu is currently visible
 * @returns {boolean} Whether menu is visible
 */
function isVisible() {
    return currentMenu !== null;
}

// ==================== CONTEXT-SPECIFIC MENU BUILDERS ====================

/**
 * Get menu items for canvas context
 * @param {Object} context - Canvas context data
 * @returns {Array<MenuItemConfig>} Menu items
 */
function getCanvasMenuItems(context) {
    return [
        {
            id: 'undo',
            label: 'Undo',
            icon: 'undo',
            shortcut: 'Ctrl+Z',
            action: () => console.log('Undo'),
            condition: (ctx) => ctx.canUndo
        },
        {
            id: 'redo',
            label: 'Redo',
            icon: 'redo',
            shortcut: 'Ctrl+Y',
            action: () => console.log('Redo'),
            condition: (ctx) => ctx.canRedo
        },
        { separator: true },
        {
            id: 'cut',
            label: 'Cut',
            icon: 'content_cut',
            shortcut: 'Ctrl+X',
            action: () => console.log('Cut'),
            condition: (ctx) => ctx.hasSelection
        },
        {
            id: 'copy',
            label: 'Copy',
            icon: 'content_copy',
            shortcut: 'Ctrl+C',
            action: () => console.log('Copy'),
            condition: (ctx) => ctx.hasSelection
        },
        {
            id: 'paste',
            label: 'Paste',
            icon: 'content_paste',
            shortcut: 'Ctrl+V',
            action: () => console.log('Paste'),
            condition: (ctx) => ctx.hasClipboard
        },
        { separator: true },
        {
            id: 'select-all',
            label: 'Select All',
            icon: 'select_all',
            shortcut: 'Ctrl+A',
            action: () => console.log('Select All')
        },
        {
            id: 'deselect',
            label: 'Deselect',
            icon: 'deselect',
            action: () => console.log('Deselect'),
            condition: (ctx) => ctx.hasSelection
        },
        { separator: true },
        {
            id: 'clear',
            label: 'Clear Canvas',
            icon: 'delete',
            action: () => console.log('Clear'),
            danger: true
        }
    ];
}

/**
 * Get menu items for color palette context
 * @param {Object} context - Palette context data
 * @returns {Array<MenuItemConfig>} Menu items
 */
function getPaletteMenuItems(context) {
    return [
        {
            id: 'copy-color',
            label: 'Copy Color Code',
            icon: 'content_copy',
            action: () => console.log('Copy color:', context.color)
        },
        {
            id: 'copy-hex',
            label: 'Copy Hex Value',
            icon: 'tag',
            action: () => console.log('Copy hex:', context.hex)
        },
        { separator: true },
        {
            id: 'set-primary',
            label: 'Set as Primary',
            icon: 'palette',
            action: () => console.log('Set primary')
        },
        {
            id: 'set-secondary',
            label: 'Set as Secondary',
            icon: 'palette',
            action: () => console.log('Set secondary')
        }
    ];
}

/**
 * Get menu items for tab context
 * @param {Object} context - Tab context data
 * @returns {Array<MenuItemConfig>} Menu items
 */
function getTabMenuItems(context) {
    return [
        {
            id: 'rename',
            label: 'Rename',
            icon: 'edit',
            action: () => console.log('Rename tab')
        },
        {
            id: 'duplicate',
            label: 'Duplicate',
            icon: 'content_copy',
            action: () => console.log('Duplicate tab')
        },
        { separator: true },
        {
            id: 'close',
            label: 'Close',
            icon: 'close',
            shortcut: 'Ctrl+W',
            action: () => console.log('Close tab')
        },
        {
            id: 'close-others',
            label: 'Close Others',
            icon: 'close',
            action: () => console.log('Close others'),
            condition: (ctx) => ctx.hasMultipleTabs
        },
        {
            id: 'close-all',
            label: 'Close All',
            icon: 'close',
            action: () => console.log('Close all'),
            danger: true
        }
    ];
}

/**
 * Get menu items for file grid context
 * @param {Object} context - File context data
 * @returns {Array<MenuItemConfig>} Menu items
 */
function getFileMenuItems(context) {
    return [
        {
            id: 'open',
            label: 'Open',
            icon: 'folder_open',
            action: () => console.log('Open file:', context.fileName)
        },
        {
            id: 'rename',
            label: 'Rename',
            icon: 'edit',
            action: () => console.log('Rename file')
        },
        { separator: true },
        {
            id: 'export',
            label: 'Export',
            icon: 'download',
            submenu: [
                {
                    id: 'export-txt',
                    label: 'As Text File',
                    icon: 'description',
                    action: () => console.log('Export TXT')
                },
                {
                    id: 'export-png',
                    label: 'As PNG Image',
                    icon: 'image',
                    action: () => console.log('Export PNG')
                }
            ]
        },
        {
            id: 'duplicate',
            label: 'Duplicate',
            icon: 'content_copy',
            action: () => console.log('Duplicate file')
        },
        { separator: true },
        {
            id: 'delete',
            label: 'Delete',
            icon: 'delete',
            action: () => console.log('Delete file'),
            danger: true
        }
    ];
}

const ContextMenu = {
    init,
    show,
    hide,
    isVisible,
    getCanvasMenuItems,
    getPaletteMenuItems,
    getTabMenuItems,
    getFileMenuItems
};

export default ContextMenu;
