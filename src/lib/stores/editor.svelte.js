/**
 * Editor State Store (Svelte 5 Runes)
 *
 * Central reactive state management for the pixel art editor.
 * Uses Svelte 5 runes ($state, $derived, $effect) for automatic reactivity.
 *
 * @module stores/editor
 */

// ==================== CANVAS STATE ====================

class CanvasState {
	/** @type {number} */
	width = $state(16);

	/** @type {number} */
	height = $state(16);

	/** @type {number[][]} */
	pixels = $state([]);

	/** @type {boolean} */
	gridVisible = $state(true);

	/** @type {number} */
	zoom = $state(1);

	constructor() {
		// Initialize empty pixel grid
		this.initializeGrid(this.width, this.height);
	}

	/**
	 * Initialize pixel grid with transparent pixels
	 * @param {number} w - Width
	 * @param {number} h - Height
	 */
	initializeGrid(w, h) {
		this.pixels = Array.from({ length: h }, () =>
			Array.from({ length: w }, () => 0)
		);
	}

	/**
	 * Resize canvas (crops or extends)
	 * @param {number} newWidth
	 * @param {number} newHeight
	 */
	resize(newWidth, newHeight) {
		const oldPixels = this.pixels;
		const oldHeight = this.height;
		const oldWidth = this.width;

		this.width = newWidth;
		this.height = newHeight;

		// Create new grid
		const newPixels = Array.from({ length: newHeight }, (_, y) =>
			Array.from({ length: newWidth }, (_, x) => {
				// Copy from old grid if within bounds
				if (y < oldHeight && x < oldWidth) {
					return oldPixels[y][x];
				}
				return 0; // Transparent
			})
		);

		this.pixels = newPixels;
	}

	/**
	 * Clear canvas (all pixels to transparent)
	 */
	clear() {
		this.initializeGrid(this.width, this.height);
	}

	/**
	 * Set pixel color
	 * @param {number} x
	 * @param {number} y
	 * @param {number} colorIndex
	 */
	setPixel(x, y, colorIndex) {
		if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
			this.pixels[y][x] = colorIndex;
		}
	}

	/**
	 * Get pixel color
	 * @param {number} x
	 * @param {number} y
	 * @returns {number}
	 */
	getPixel(x, y) {
		if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
			return this.pixels[y][x];
		}
		return 0;
	}

	/**
	 * Toggle grid visibility
	 */
	toggleGrid() {
		this.gridVisible = !this.gridVisible;
	}

	/**
	 * Set zoom level
	 * @param {number} zoomLevel
	 */
	setZoom(zoomLevel) {
		this.zoom = Math.max(0.1, Math.min(10, zoomLevel));
	}

	/**
	 * Export to data string (WxH:DATA format)
	 * @returns {string}
	 */
	exportToString() {
		const base64Chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/';
		let data = '';

		for (let y = 0; y < this.height; y++) {
			for (let x = 0; x < this.width; x++) {
				const colorIndex = this.pixels[y][x];
				data += base64Chars[colorIndex] || '0';
			}
		}

		return `${this.width}x${this.height}:${data}`;
	}

	/**
	 * Import from data string
	 * @param {string} dataString
	 * @returns {boolean}
	 */
	importFromString(dataString) {
		try {
			const match = dataString.match(/^(\d+)x(\d+):(.+)$/);
			if (!match) return false;

			const width = parseInt(match[1]);
			const height = parseInt(match[2]);
			const data = match[3];

			if (data.length !== width * height) return false;

			this.resize(width, height);

			const base64Chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/';

			for (let i = 0; i < data.length; i++) {
				const char = data[i];
				const colorIndex = base64Chars.indexOf(char);
				const x = i % width;
				const y = Math.floor(i / width);

				if (colorIndex >= 0) {
					this.setPixel(x, y, colorIndex);
				}
			}

			return true;
		} catch (error) {
			console.error('Import failed:', error);
			return false;
		}
	}
}

// ==================== TOOL STATE ====================

class ToolState {
	/** @type {string} */
	currentToolId = $state('brush');

	/** @type {number} */
	brushSize = $state(1);

	/** @type {'fill' | 'stroke'} */
	shapeMode = $state('fill');

	/** @type {number} */
	selectedColor = $state(1);

	/**
	 * Set current tool
	 * @param {string} toolId
	 */
	setTool(toolId) {
		this.currentToolId = toolId;
	}

	/**
	 * Set brush size
	 * @param {number} size
	 */
	setBrushSize(size) {
		this.brushSize = Math.max(1, Math.min(10, size));
	}

	/**
	 * Set shape mode
	 * @param {'fill' | 'stroke'} mode
	 */
	setShapeMode(mode) {
		this.shapeMode = mode;
	}

	/**
	 * Set selected color
	 * @param {number} colorIndex
	 */
	setColor(colorIndex) {
		this.selectedColor = colorIndex;
	}
}

// ==================== HISTORY STATE ====================

class HistoryState {
	/** @type {string[]} */
	undoStack = $state([]);

	/** @type {string[]} */
	redoStack = $state([]);

	/** @type {number} */
	maxStates = 50;

	/**
	 * Push state to undo stack
	 * @param {string} state
	 */
	push(state) {
		// Remove oldest if at limit
		if (this.undoStack.length >= this.maxStates) {
			this.undoStack.shift();
		}

		this.undoStack.push(state);
		this.redoStack = []; // Clear redo stack on new action
	}

	/**
	 * Check if can undo
	 * @returns {boolean}
	 */
	canUndo() {
		return this.undoStack.length > 0;
	}

	/**
	 * Check if can redo
	 * @returns {boolean}
	 */
	canRedo() {
		return this.redoStack.length > 0;
	}

	/**
	 * Undo last action
	 * @param {string} currentState
	 * @returns {string | null}
	 */
	undo(currentState) {
		if (!this.canUndo()) return null;

		const previousState = this.undoStack.pop();
		this.redoStack.push(currentState);

		return previousState;
	}

	/**
	 * Redo last undone action
	 * @param {string} currentState
	 * @returns {string | null}
	 */
	redo(currentState) {
		if (!this.canRedo()) return null;

		const nextState = this.redoStack.pop();
		this.undoStack.push(currentState);

		return nextState;
	}

	/**
	 * Clear all history
	 */
	clear() {
		this.undoStack = [];
		this.redoStack = [];
	}
}

// ==================== FILE STATE ====================

class FileState {
	/** @type {string} */
	currentFileName = $state('Untitled');

	/** @type {boolean} */
	isDirty = $state(false);

	/** @type {number} */
	lastSaved = $state(Date.now());

	/**
	 * Mark file as dirty (unsaved changes)
	 */
	markDirty() {
		this.isDirty = true;
	}

	/**
	 * Mark file as clean (saved)
	 */
	markClean() {
		this.isDirty = false;
		this.lastSaved = Date.now();
	}

	/**
	 * Set file name
	 * @param {string} name
	 */
	setFileName(name) {
		this.currentFileName = name;
	}
}

// ==================== SELECTION STATE ====================

class SelectionState {
	/** @type {boolean} */
	active = $state(false);

	/** @type {number | null} */
	x1 = $state(null);

	/** @type {number | null} */
	y1 = $state(null);

	/** @type {number | null} */
	x2 = $state(null);

	/** @type {number | null} */
	y2 = $state(null);

	/**
	 * Set selection bounds
	 * @param {number} x1
	 * @param {number} y1
	 * @param {number} x2
	 * @param {number} y2
	 */
	setSelection(x1, y1, x2, y2) {
		this.active = true;
		this.x1 = x1;
		this.y1 = y1;
		this.x2 = x2;
		this.y2 = y2;
	}

	/**
	 * Clear selection
	 */
	clear() {
		this.active = false;
		this.x1 = null;
		this.y1 = null;
		this.x2 = null;
		this.y2 = null;
	}

	/**
	 * Check if point is in selection
	 * @param {number} x
	 * @param {number} y
	 * @returns {boolean}
	 */
	contains(x, y) {
		if (!this.active) return false;

		const minX = Math.min(this.x1, this.x2);
		const maxX = Math.max(this.x1, this.x2);
		const minY = Math.min(this.y1, this.y2);
		const maxY = Math.max(this.y1, this.y2);

		return x >= minX && x <= maxX && y >= minY && y <= maxY;
	}
}

// ==================== EDITOR STORE (SINGLETON) ====================

/**
 * Create global editor state
 * @returns {Object}
 */
function createEditorStore() {
	const canvas = new CanvasState();
	const tool = new ToolState();
	const history = new HistoryState();
	const file = new FileState();
	const selection = new SelectionState();

	return {
		canvas,
		tool,
		history,
		file,
		selection
	};
}

// Export singleton instance
export const editor = createEditorStore();
