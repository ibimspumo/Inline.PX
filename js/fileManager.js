/**
 * FileManager Module
 *
 * Handles file operations including:
 * - Save to browser's LocalStorage
 * - Load from LocalStorage
 * - Export as .txt file
 * - Export as text string
 * - Import from text string
 *
 * Storage format in LocalStorage:
 * - Key: "pixelart_files"
 * - Value: JSON array of file objects
 * - Each file: {id, name, data, timestamp, width, height}
 */

const FileManager = (function() {
    'use strict';

    const STORAGE_KEY = 'pixelart_files';
    let currentFileName = null;

    /**
     * Get all saved files from LocalStorage
     * @returns {Array} Array of file objects
     */
    function getAllFiles() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error reading from LocalStorage:', error);
            return [];
        }
    }

    /**
     * Save files array to LocalStorage
     * @param {Array} files - Array of file objects
     * @returns {boolean} Success status
     */
    function saveAllFiles(files) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
            return true;
        } catch (error) {
            console.error('Error saving to LocalStorage:', error);
            if (Dialogs) {
                Dialogs.alert('Save Failed', 'Failed to save: Storage quota may be exceeded.', 'error');
            } else {
                alert('Failed to save: Storage quota may be exceeded');
            }
            return false;
        }
    }

    /**
     * Save current canvas to LocalStorage
     * @param {string} dataString - Pixel data string from canvas
     * @param {string} name - Optional file name
     * @returns {Promise<boolean>} Success status
     */
    async function save(dataString, name = null) {
        // Prompt for name if not provided
        if (!name) {
            name = await Dialogs.prompt(
                'Save Pixel Art',
                'Enter a name for your pixel art:',
                currentFileName || 'untitled',
                { placeholder: 'File name' }
            );
            if (!name) return false; // User cancelled
        }

        // Parse dimensions from data string
        const parts = dataString.split(':');
        if (parts.length !== 2) {
            await Dialogs.alert('Invalid Format', 'Invalid data format.', 'error');
            return false;
        }

        const dimensions = parts[0].split('x');
        const width = parseInt(dimensions[0]);
        const height = parseInt(dimensions[1]);

        // Get existing files
        const files = getAllFiles();

        // Check if file with same name exists
        const existingIndex = files.findIndex(f => f.name === name);

        // Ask for confirmation if file exists
        if (existingIndex >= 0) {
            const confirmed = await Dialogs.confirm(
                'Overwrite File',
                `A file named "${name}" already exists. Overwrite it?`,
                {
                    confirmText: 'Overwrite',
                    cancelText: 'Cancel',
                    type: 'warning'
                }
            );

            if (!confirmed) return false;
        }

        const fileObject = {
            id: existingIndex >= 0 ? files[existingIndex].id : generateId(),
            name: name,
            data: dataString,
            timestamp: Date.now(),
            width: width,
            height: height
        };

        if (existingIndex >= 0) {
            // Update existing file
            files[existingIndex] = fileObject;
        } else {
            // Add new file
            files.push(fileObject);
        }

        // Save to LocalStorage
        if (saveAllFiles(files)) {
            currentFileName = name;
            await Dialogs.alert('Saved!', `Saved as "${name}"`, 'success');
            return true;
        }

        return false;
    }

    /**
     * Load a file from LocalStorage by ID
     * @param {string} id - File ID
     * @returns {Object|null} File object or null if not found
     */
    function load(id) {
        const files = getAllFiles();
        const file = files.find(f => f.id === id);

        if (file) {
            currentFileName = file.name;
            return file;
        }

        return null;
    }

    /**
     * Delete a file from LocalStorage
     * @param {string} id - File ID
     * @returns {boolean} Success status
     */
    function deleteFile(id) {
        const files = getAllFiles();
        const newFiles = files.filter(f => f.id !== id);

        if (newFiles.length < files.length) {
            return saveAllFiles(newFiles);
        }

        return false;
    }

    /**
     * Export data string as downloadable .txt file
     * @param {string} dataString - Pixel data string
     * @param {string} filename - Optional filename
     */
    function exportAsFile(dataString, filename = null) {
        if (!filename) {
            filename = currentFileName || 'pixelart';
        }

        // Ensure .txt extension
        if (!filename.endsWith('.txt')) {
            filename += '.txt';
        }

        // Create blob
        const blob = new Blob([dataString], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        // Create download link
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();

        // Cleanup
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Generate unique ID for files
     * @returns {string} Unique ID
     */
    function generateId() {
        return 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    /**
     * Get current file name
     * @returns {string|null} Current file name
     */
    function getCurrentFileName() {
        return currentFileName;
    }

    /**
     * Set current file name
     * @param {string} name - File name
     */
    function setCurrentFileName(name) {
        currentFileName = name;
    }

    /**
     * Clear current file name (for new file)
     */
    function clearCurrentFileName() {
        currentFileName = null;
    }

    /**
     * Format timestamp to readable date string
     * @param {number} timestamp - Unix timestamp
     * @returns {string} Formatted date
     */
    function formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleString();
    }

    /**
     * Get storage usage statistics
     * @returns {Object} Storage stats {used, total, percentage}
     */
    function getStorageStats() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            const used = data ? data.length : 0;
            const total = 5 * 1024 * 1024; // Approximate 5MB limit for localStorage

            return {
                used: used,
                total: total,
                percentage: (used / total * 100).toFixed(2),
                usedKB: (used / 1024).toFixed(2),
                totalMB: (total / 1024 / 1024).toFixed(2)
            };
        } catch (error) {
            console.error('Error getting storage stats:', error);
            return null;
        }
    }

    /**
     * Display file selection modal
     * @param {Function} onSelectCallback - Callback when file is selected
     */
    function showLoadDialog(onSelectCallback) {
        const modal = document.getElementById('fileModal');
        const fileList = document.getElementById('fileList');
        const noFilesMessage = document.getElementById('noFilesMessage');
        const closeBtn = document.getElementById('closeModal');

        if (!modal || !fileList) {
            console.error('Modal elements not found');
            return;
        }

        // Get files
        const files = getAllFiles();

        // Clear file list
        fileList.innerHTML = '';

        if (files.length === 0) {
            noFilesMessage.style.display = 'block';
        } else {
            noFilesMessage.style.display = 'none';

            // Sort by timestamp (newest first)
            files.sort((a, b) => b.timestamp - a.timestamp);

            // Create file items
            files.forEach(file => {
                const item = createFileItem(file, onSelectCallback);
                fileList.appendChild(item);
            });
        }

        // Show modal
        modal.style.display = 'flex';

        // Close button handler
        const closeHandler = () => {
            modal.style.display = 'none';
            closeBtn.removeEventListener('click', closeHandler);
            modal.removeEventListener('click', outsideClickHandler);
        };

        // Click outside to close
        const outsideClickHandler = (e) => {
            if (e.target === modal) {
                closeHandler();
            }
        };

        closeBtn.addEventListener('click', closeHandler);
        modal.addEventListener('click', outsideClickHandler);
    }

    /**
     * Create a file list item element
     * @param {Object} file - File object
     * @param {Function} onSelectCallback - Callback when file is selected
     * @returns {HTMLElement} File item element
     */
    function createFileItem(file, onSelectCallback) {
        const item = document.createElement('div');
        item.className = 'file-item';

        const info = document.createElement('div');
        info.className = 'file-item-info';

        const name = document.createElement('div');
        name.className = 'file-item-name';
        name.textContent = file.name;

        const meta = document.createElement('div');
        meta.className = 'file-item-meta';
        meta.textContent = `${file.width}x${file.height} • ${formatDate(file.timestamp)}`;

        info.appendChild(name);
        info.appendChild(meta);

        const actions = document.createElement('div');
        actions.className = 'file-item-actions';

        // Load button
        const loadBtn = document.createElement('button');
        loadBtn.className = 'btn btn-success';
        loadBtn.textContent = 'Load';
        loadBtn.addEventListener('click', () => {
            document.getElementById('fileModal').style.display = 'none';
            onSelectCallback(file);
        });

        // Delete button
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'btn btn-danger';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', async () => {
            const confirmed = await Dialogs.confirm(
                'Delete File',
                `Delete "${file.name}"? This cannot be undone.`,
                {
                    confirmText: 'Delete',
                    cancelText: 'Cancel',
                    type: 'error',
                    dangerous: true
                }
            );

            if (confirmed) {
                if (deleteFile(file.id)) {
                    item.remove();

                    // Check if no files left
                    const fileListElement = document.getElementById('fileList');
                    if (fileListElement && fileListElement.children.length === 0) {
                        document.getElementById('noFilesMessage').style.display = 'block';
                    }
                }
            }
        });

        actions.appendChild(loadBtn);
        actions.appendChild(deleteBtn);

        item.appendChild(info);
        item.appendChild(actions);

        return item;
    }

    // Public API
    return {
        save,
        load,
        deleteFile,
        getAllFiles,
        exportAsFile,
        getCurrentFileName,
        setCurrentFileName,
        clearCurrentFileName,
        formatDate,
        getStorageStats,
        showLoadDialog
    };
})();
