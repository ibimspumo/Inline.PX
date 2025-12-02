/**
 * Tab Manager Module - Multi-document interface (Photoshop-style)
 *
 * Features:
 * - Multiple open documents/tabs
 * - Tab switching with visual feedback
 * - New tab creation
 * - Tab closing with unsaved warning
 * - Tab renaming
 */

const TabManager = (function() {
    'use strict';

    let tabs = [];
    let currentTabId = null;
    let tabCounter = 0;

    /**
     * Initialize tab manager
     */
    function init() {
        createTabBar();
        createNewTab('Untitled-1', 16, 16);
        console.log('Tab Manager initialized');
    }

    /**
     * Create tab bar UI
     */
    function createTabBar() {
        const workspace = document.querySelector('.workspace');
        if (!workspace) return;

        const menuBar = workspace.querySelector('.menu-bar');

        const tabBar = document.createElement('div');
        tabBar.className = 'tab-bar';
        tabBar.id = 'tabBar';
        tabBar.innerHTML = `
            <div class="tab-list" id="tabList"></div>
            <button class="tab-new-btn" id="newTabBtn" title="New Document (Ctrl+N)">+</button>
        `;

        // Insert after menu bar
        workspace.insertBefore(tabBar, menuBar.nextSibling);

        // Setup event listeners
        document.getElementById('newTabBtn').addEventListener('click', () => {
            createNewTab();
        });
    }

    /**
     * Create a new tab
     * @param {string} name - Tab name
     * @param {number} width - Canvas width
     * @param {number} height - Canvas height
     * @param {string} data - Optional pixel data
     */
    function createNewTab(name = null, width = 16, height = 16, data = null) {
        tabCounter++;
        const tabId = `tab_${Date.now()}_${tabCounter}`;
        const tabName = name || `Untitled-${tabCounter}`;

        const tab = {
            id: tabId,
            name: tabName,
            width: width,
            height: height,
            data: data || generateEmptyData(width, height),
            isDirty: false,
            created: Date.now(),
            modified: Date.now()
        };

        tabs.push(tab);
        renderTab(tab);
        switchToTab(tabId);

        return tab;
    }

    /**
     * Generate empty pixel data
     * @param {number} width - Width
     * @param {number} height - Height
     * @returns {string} Empty data string
     */
    function generateEmptyData(width, height) {
        const emptyPixels = '0'.repeat(width * height);
        return `${width}x${height}:${emptyPixels}`;
    }

    /**
     * Render a tab in the tab bar
     * @param {Object} tab - Tab object
     */
    function renderTab(tab) {
        const tabList = document.getElementById('tabList');
        if (!tabList) return;

        const tabElement = document.createElement('div');
        tabElement.className = 'tab';
        tabElement.dataset.tabId = tab.id;
        tabElement.innerHTML = `
            <span class="tab-name">${tab.name}</span>
            <span class="tab-dirty" style="display: none;">●</span>
            <button class="tab-close" title="Close">×</button>
        `;

        // Tab click - switch
        tabElement.addEventListener('click', (e) => {
            if (!e.target.classList.contains('tab-close')) {
                switchToTab(tab.id);
            }
        });

        // Close button
        tabElement.querySelector('.tab-close').addEventListener('click', (e) => {
            e.stopPropagation();
            closeTab(tab.id);
        });

        // Double click - rename
        tabElement.querySelector('.tab-name').addEventListener('dblclick', (e) => {
            e.stopPropagation();
            renameTab(tab.id);
        });

        tabList.appendChild(tabElement);
    }

    /**
     * Switch to a different tab
     * @param {string} tabId - Tab ID to switch to
     */
    function switchToTab(tabId) {
        const tab = tabs.find(t => t.id === tabId);
        if (!tab) return;

        // Save current tab state
        if (currentTabId) {
            saveCurrentTabState();
        }

        // Update current tab
        currentTabId = tabId;

        // Update UI
        document.querySelectorAll('.tab').forEach(el => {
            el.classList.toggle('active', el.dataset.tabId === tabId);
        });

        // Load tab data into canvas
        if (PixelCanvas) {
            PixelCanvas.importFromString(tab.data);
        }

        // Update document title
        document.title = `${tab.name} - PixelCreator Pro`;

        console.log('Switched to tab:', tab.name);
    }

    /**
     * Save current tab state
     */
    function saveCurrentTabState() {
        const tab = tabs.find(t => t.id === currentTabId);
        if (!tab || !PixelCanvas) return;

        tab.data = PixelCanvas.exportToString();
        tab.modified = Date.now();
    }

    /**
     * Close a tab
     * @param {string} tabId - Tab ID to close
     */
    async function closeTab(tabId) {
        const tab = tabs.find(t => t.id === tabId);
        if (!tab) return;

        // Prevent closing last tab
        if (tabs.length === 1) {
            const confirmed = await Dialogs.confirm(
                'Close Document',
                'Close this document and create a new one?',
                {
                    confirmText: 'Close & New',
                    cancelText: 'Cancel',
                    type: 'info'
                }
            );

            if (confirmed) {
                // Clear and reset
                tab.data = generateEmptyData(16, 16);
                tab.name = 'Untitled-1';
                tab.isDirty = false;
                updateTabUI(tab);
                switchToTab(tab.id);
                if (PixelCanvas) {
                    PixelCanvas.importFromString(tab.data);
                }
            }
            return;
        }

        // Warn if unsaved
        if (tab.isDirty) {
            const confirmed = await Dialogs.confirm(
                'Unsaved Changes',
                `"${tab.name}" has unsaved changes. Close anyway?`,
                {
                    confirmText: 'Close',
                    cancelText: 'Cancel',
                    type: 'warning',
                    dangerous: true
                }
            );

            if (!confirmed) {
                return;
            }
        }

        // Remove tab
        tabs = tabs.filter(t => t.id !== tabId);

        // Remove from UI
        const tabElement = document.querySelector(`.tab[data-tab-id="${tabId}"]`);
        if (tabElement) {
            tabElement.remove();
        }

        // Switch to another tab if this was current
        if (currentTabId === tabId) {
            const nextTab = tabs[tabs.length - 1];
            if (nextTab) {
                switchToTab(nextTab.id);
            }
        }

        // Clear autosave
        if (Autosave) {
            Autosave.clearAutosave(tabId);
        }

        console.log('Closed tab:', tab.name);
    }

    /**
     * Rename a tab
     * @param {string} tabId - Tab ID to rename
     */
    async function renameTab(tabId) {
        const tab = tabs.find(t => t.id === tabId);
        if (!tab) return;

        const newName = await Dialogs.prompt(
            'Rename Document',
            'Enter a new name for this document:',
            tab.name,
            { placeholder: 'Document name' }
        );

        if (newName && newName.trim()) {
            tab.name = newName.trim();
            updateTabUI(tab);

            if (currentTabId === tabId) {
                document.title = `${tab.name} - PixelCreator Pro`;
            }
        }
    }

    /**
     * Update tab UI element
     * @param {Object} tab - Tab object
     */
    function updateTabUI(tab) {
        const tabElement = document.querySelector(`.tab[data-tab-id="${tab.id}"]`);
        if (!tabElement) return;

        const nameSpan = tabElement.querySelector('.tab-name');
        const dirtySpan = tabElement.querySelector('.tab-dirty');

        if (nameSpan) {
            nameSpan.textContent = tab.name;
        }

        if (dirtySpan) {
            dirtySpan.style.display = tab.isDirty ? 'inline' : 'none';
        }
    }

    /**
     * Mark current tab as dirty (modified)
     */
    function markCurrentTabDirty() {
        const tab = tabs.find(t => t.id === currentTabId);
        if (!tab) return;

        tab.isDirty = true;
        tab.modified = Date.now();
        updateTabUI(tab);

        // Trigger autosave
        if (Autosave) {
            Autosave.markDirty();
        }
    }

    /**
     * Mark current tab as clean (saved)
     */
    function markCurrentTabClean() {
        const tab = tabs.find(t => t.id === currentTabId);
        if (!tab) return;

        tab.isDirty = false;
        updateTabUI(tab);
    }

    /**
     * Get current tab
     * @returns {Object|null} Current tab object
     */
    function getCurrentTab() {
        return tabs.find(t => t.id === currentTabId) || null;
    }

    /**
     * Get all tabs
     * @returns {Array} Array of tab objects
     */
    function getAllTabs() {
        return tabs;
    }

    /**
     * Update current tab name
     * @param {string} name - New name
     */
    function setCurrentTabName(name) {
        const tab = getCurrentTab();
        if (tab) {
            tab.name = name;
            updateTabUI(tab);
            document.title = `${tab.name} - PixelCreator Pro`;
        }
    }

    // Public API
    return {
        init,
        createNewTab,
        switchToTab,
        closeTab,
        renameTab,
        markCurrentTabDirty,
        markCurrentTabClean,
        getCurrentTab,
        getAllTabs,
        setCurrentTabName
    };
})();
