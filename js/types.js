/**
 * Global Type Definitions for Inline.px
 *
 * Provides JSDoc TypeDefs for better IntelliSense and type safety
 * Use these types across the codebase with @type, @param, @returns
 *
 * @module types
 */

/**
 * Canvas dimensions
 * @typedef {Object} Dimensions
 * @property {number} width - Width in pixels
 * @property {number} height - Height in pixels
 */

/**
 * 2D pixel data array (color indices 0-63)
 * @typedef {Array<Array<number>>} PixelData
 */

/**
 * Selection bounds rectangle
 * @typedef {Object} SelectionBounds
 * @property {number} x1 - Top-left X coordinate
 * @property {number} y1 - Top-left Y coordinate
 * @property {number} x2 - Bottom-right X coordinate
 * @property {number} y2 - Bottom-right Y coordinate
 */

/**
 * Tab data structure
 * @typedef {Object} TabData
 * @property {string} id - Unique tab identifier
 * @property {string} name - Tab display name
 * @property {number} width - Canvas width
 * @property {number} height - Canvas height
 * @property {string} data - Pixel data string (WxH:DATA format)
 * @property {boolean} isDirty - Has unsaved changes
 * @property {number} created - Creation timestamp
 * @property {number} modified - Last modification timestamp
 */

/**
 * Saved file structure
 * @typedef {Object} SavedFile
 * @property {string} id - Unique file identifier
 * @property {string} name - File name
 * @property {string} data - Pixel data string
 * @property {number} timestamp - Save timestamp
 * @property {number} width - Canvas width
 * @property {number} height - Canvas height
 */

/**
 * Tool configuration
 * @typedef {Object} ToolConfig
 * @property {string} id - Unique tool identifier
 * @property {string} name - Display name
 * @property {string} icon - Material Symbol icon name
 * @property {string} shortcut - Keyboard shortcut (single letter)
 * @property {string} cursor - CSS cursor style
 * @property {boolean} hasSizeOption - Shows brush size UI
 * @property {boolean} hasShapeOption - Shows fill/stroke UI
 * @property {string} description - Tool description
 * @property {string} category - Tool category
 */

/**
 * Tool options
 * @typedef {Object} ToolOptions
 * @property {number} brushSize - Brush/tool size (1-50)
 * @property {string} shapeMode - Shape fill mode ('fill' or 'stroke')
 * @property {number} colorCode - Current color index (0-63)
 * @property {number} [opacity] - Tool opacity (0-1)
 * @property {boolean} [antiAlias] - Enable anti-aliasing
 * @property {boolean} [snapToGrid] - Snap to grid
 * @property {boolean} [constrainProportions] - Constrain proportions (Shift)
 */

/**
 * Drawing context for tools
 * @typedef {Object} DrawingContext
 * @property {number} colorCode - Color to draw with
 * @property {number} [brushSize] - Brush size
 * @property {string} [shapeMode] - Shape mode
 * @property {SelectionBounds} [selection] - Active selection
 * @property {boolean} [shiftKey] - Shift key pressed
 * @property {boolean} [ctrlKey] - Ctrl/Cmd key pressed
 * @property {boolean} [altKey] - Alt key pressed
 */

/**
 * Color palette item
 * @typedef {Object} PaletteColor
 * @property {number} index - Color index (0-63)
 * @property {string} char - Base64 character
 * @property {string} color - Hex color code or 'transparent'
 * @property {string} name - Color name
 * @property {string} category - Color category
 */

/**
 * Compression statistics
 * @typedef {Object} CompressionStats
 * @property {string} compressed - Compressed data string
 * @property {number} originalSize - Original size in characters
 * @property {number} compressedSize - Compressed size in characters
 * @property {number} savings - Savings percentage
 */

/**
 * Storage statistics
 * @typedef {Object} StorageStats
 * @property {number} used - Used bytes
 * @property {number} total - Total available bytes
 * @property {string} percentage - Usage percentage
 * @property {string} usedKB - Used kilobytes
 * @property {string} totalMB - Total megabytes
 * @property {number} available - Available bytes
 */

/**
 * Validation result
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Validation passed
 * @property {string|null} error - Error message if invalid
 */

/**
 * Dialog options for confirm
 * @typedef {Object} ConfirmOptions
 * @property {string} [confirmText] - Confirm button text
 * @property {string} [cancelText] - Cancel button text
 * @property {string} [type] - Dialog type ('info'|'success'|'warning'|'error')
 * @property {boolean} [dangerous] - Show as dangerous action
 */

/**
 * Dialog options for prompt
 * @typedef {Object} PromptOptions
 * @property {string} [placeholder] - Input placeholder
 * @property {string} [inputType] - Input type ('text'|'number'|'email')
 */

/**
 * Export dialog result
 * @typedef {Object} ExportResult
 * @property {string} format - Export format ('copy-string'|'download-txt'|'download-png')
 * @property {boolean} compress - Use RLE compression
 * @property {number} [scale] - PNG scale factor (1,2,4,8)
 */

/**
 * Event bus event data
 * @typedef {Object} EventData
 * @property {string} type - Event type
 * @property {*} [data] - Event payload
 * @property {number} timestamp - Event timestamp
 */

/**
 * Logger levels
 * @typedef {'debug'|'info'|'warn'|'error'} LogLevel
 */

/**
 * Config constants
 * @typedef {Object} Constants
 * @property {Object} canvas - Canvas limits
 * @property {number} canvas.minSize - Minimum canvas size
 * @property {number} canvas.maxSize - Maximum canvas size
 * @property {number} canvas.defaultSize - Default canvas size
 * @property {number} canvas.minPixelSize - Minimum pixel render size
 * @property {number} canvas.maxPixelSize - Maximum pixel render size
 * @property {number} canvas.defaultPixelSize - Default pixel render size
 * @property {Object} history - History settings
 * @property {number} history.maxStates - Maximum undo states
 * @property {number} history.debounceDelay - Debounce delay in ms
 * @property {Object} autosave - Autosave settings
 * @property {number} autosave.interval - Autosave interval in ms
 * @property {number} autosave.debounce - Debounce delay in ms
 */

// Export empty object (types are in JSDoc comments)
export default {};
