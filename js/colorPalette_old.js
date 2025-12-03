/**
 * ColorPalette Module - Base64 Color System
 *
 * Manages a professional 64-color palette using Base64 encoding:
 * - 0 = Transparent
 * - 1-63 = Colors
 *
 * Base64 characters: 0-9, A-Z, a-z, +, /
 *
 * Color categories:
 * - Basic colors (1-16): Primary colors, grayscale
 * - Extended colors (17-63): RGB variations, earth tones, pastels
 */

const ColorPalette = (function() {
    'use strict';

    // Base64 character set for encoding
    const BASE64_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/';

    // 64 colors including transparent
    const COLORS = [
        // 0: Transparent
        'transparent',

        // 1-8: Basic colors
        '#000000', // 1: Black
        '#FFFFFF', // 2: White
        '#FF0000', // 3: Red
        '#00FF00', // 4: Green
        '#0000FF', // 5: Blue
        '#FFFF00', // 6: Yellow
        '#FF00FF', // 7: Magenta
        '#00FFFF', // 8: Cyan

        // 9-16: Grayscale
        '#1A1A1A', '#333333', '#4D4D4D', '#666666',
        '#808080', '#999999', '#B3B3B3', '#CCCCCC',

        // 17-24: Reds/Oranges
        '#8B0000', '#B22222', '#DC143C', '#FF4500',
        '#FF6347', '#FF7F50', '#FFA500', '#FFD700',

        // 25-32: Greens
        '#006400', '#008000', '#228B22', '#32CD32',
        '#7FFF00', '#90EE90', '#98FB98', '#ADFF2F',

        // 33-40: Blues/Cyans
        '#00008B', '#0000CD', '#1E90FF', '#4169E1',
        '#6495ED', '#87CEEB', '#87CEFA', '#B0E0E6',

        // 41-48: Purples/Magentas
        '#4B0082', '#6A5ACD', '#7B68EE', '#9370DB',
        '#BA55D3', '#DA70D6', '#DDA0DD', '#EE82EE',

        // 49-56: Browns/Earth tones
        '#8B4513', '#A0522D', '#D2691E', '#CD853F',
        '#F4A460', '#DEB887', '#D2B48C', '#BC8F8F',

        // 57-63: Pastels/Extras
        '#FFB6C1', '#FFC0CB', '#FFE4E1', '#F0E68C',
        '#E6E6FA', '#D8BFD8', '#FFDAB9'
    ];

    const COLOR_NAMES = [
        'Transparent', 'Black', 'White', 'Red', 'Green', 'Blue', 'Yellow', 'Magenta', 'Cyan',
        'Dark Gray 1', 'Dark Gray 2', 'Dark Gray 3', 'Gray 1', 'Gray 2', 'Gray 3', 'Light Gray 1', 'Light Gray 2',
        'Dark Red', 'Firebrick', 'Crimson', 'Orange Red', 'Tomato', 'Coral', 'Orange', 'Gold',
        'Dark Green', 'Green', 'Forest Green', 'Lime Green', 'Chartreuse', 'Light Green', 'Pale Green', 'Yellow Green',
        'Dark Blue', 'Medium Blue', 'Dodger Blue', 'Royal Blue', 'Steel Blue', 'Sky Blue', 'Light Sky Blue', 'Powder Blue',
        'Indigo', 'Slate Blue', 'Medium Slate Blue', 'Medium Purple', 'Orchid', 'Violet', 'Plum', 'Pink Violet',
        'Saddle Brown', 'Sienna', 'Chocolate', 'Peru', 'Sandy Brown', 'Burlywood', 'Tan', 'Rosy Brown',
        'Light Pink', 'Pink', 'Misty Rose', 'Khaki', 'Lavender', 'Thistle', 'Peach'
    ];

    let currentColorCode = 1; // Default to black
    let onColorChangeCallback = null;
    let customPalette = [...COLORS]; // Allow for custom colors

    /**
     * Initialize the color palette UI
     * @param {string} containerId - ID of the container element
     * @param {Function} onColorChange - Callback when color changes
     */
    function init(containerId, onColorChange) {
        onColorChangeCallback = onColorChange;
        const container = document.getElementById(containerId);

        if (!container) {
            console.error('Color palette container not found:', containerId);
            return;
        }

        renderPalette(container);
        updateColorDisplay();
    }

    /**
     * Render the color palette
     * @param {HTMLElement} container - Container element
     */
    function renderPalette(container) {
        container.innerHTML = '';

        // Create color grid
        COLORS.forEach((color, index) => {
            const btn = document.createElement('button');
            btn.className = 'color-swatch';
            btn.dataset.code = BASE64_CHARS[index];
            btn.dataset.index = index;
            btn.style.backgroundColor = color;
            btn.title = `${COLOR_NAMES[index]} (${BASE64_CHARS[index]})`;

            if (index === currentColorCode) {
                btn.classList.add('active');
            }

            btn.addEventListener('click', () => selectColor(index));
            container.appendChild(btn);
        });
    }

    /**
     * Select a color by its index
     * @param {number} index - Color index (0-63)
     */
    function selectColor(index) {
        if (index < 0 || index >= COLORS.length) {
            console.error('Invalid color index:', index);
            return;
        }

        currentColorCode = index;

        // Update UI
        document.querySelectorAll('.color-swatch').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.index) === index);
        });

        updateColorDisplay();

        // Trigger callback
        if (onColorChangeCallback) {
            onColorChangeCallback(index, COLORS[index]);
        }
    }

    /**
     * Update the current color display
     */
    function updateColorDisplay() {
        const colorDisplay = document.getElementById('currentColorDisplay');
        const colorCode = document.getElementById('currentColorCode');
        const colorName = document.getElementById('currentColorName');

        if (colorDisplay) {
            colorDisplay.style.backgroundColor = COLORS[currentColorCode];
        }

        if (colorCode) {
            colorCode.textContent = BASE64_CHARS[currentColorCode];
        }

        if (colorName) {
            colorName.textContent = COLOR_NAMES[currentColorCode];
        }
    }

    /**
     * Get color by index
     * @param {number} index - Color index
     * @returns {string} Hex color or 'transparent'
     */
    function getColor(index) {
        return COLORS[index] || COLORS[0];
    }

    /**
     * Get color by Base64 character
     * @param {string} char - Base64 character
     * @returns {string} Hex color or 'transparent'
     */
    function getColorByChar(char) {
        const index = BASE64_CHARS.indexOf(char);
        return index >= 0 ? COLORS[index] : COLORS[0];
    }

    /**
     * Get current selected color code (index)
     * @returns {number} Current color index
     */
    function getCurrentColorCode() {
        return currentColorCode;
    }

    /**
     * Get current selected color
     * @returns {string} Current color hex or 'transparent'
     */
    function getCurrentColor() {
        return COLORS[currentColorCode];
    }

    /**
     * Get Base64 character for index
     * @param {number} index - Color index
     * @returns {string} Base64 character
     */
    function getBase64Char(index) {
        return BASE64_CHARS[index] || '0';
    }

    /**
     * Get index from Base64 character
     * @param {string} char - Base64 character
     * @returns {number} Color index
     */
    function getIndexFromChar(char) {
        return BASE64_CHARS.indexOf(char);
    }

    /**
     * Get all colors
     * @returns {Array} Array of color hex codes
     */
    function getAllColors() {
        return [...COLORS];
    }

    /**
     * Convert color index to RGBA values for canvas
     * @param {number} index - Color index
     * @returns {Object} RGBA values {r, g, b, a}
     */
    function indexToRGBA(index) {
        const color = COLORS[index];

        if (color === 'transparent') {
            return { r: 0, g: 0, b: 0, a: 0 };
        }

        // Convert hex to RGB
        const hex = color.replace('#', '');
        const r = parseInt(hex.substring(0, 2), 16);
        const g = parseInt(hex.substring(2, 4), 16);
        const b = parseInt(hex.substring(4, 6), 16);

        return { r, g, b, a: 255 };
    }

    /**
     * Get color name by index
     * @param {number} index - Color index
     * @returns {string} Color name
     */
    function getColorName(index) {
        return COLOR_NAMES[index] || 'Unknown';
    }

    /**
     * Set custom color at index
     * @param {number} index - Color index
     * @param {string} hexColor - Hex color code
     */
    function setCustomColor(index, hexColor) {
        if (index >= 0 && index < COLORS.length) {
            customPalette[index] = hexColor;
        }
    }

    // Public API
    return {
        init,
        selectColor,
        getColor,
        getColorByChar,
        getCurrentColorCode,
        getCurrentColor,
        getBase64Char,
        getIndexFromChar,
        getAllColors,
        indexToRGBA,
        getColorName,
        setCustomColor,
        BASE64_CHARS,
        COLORS
    };
})();
