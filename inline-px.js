/**
 * <inline-px> Custom HTML Element
 *
 * Renders ultra-compact pixel art strings as PNG images
 * with automatic scaling and crisp rendering.
 *
 * Usage:
 *   <inline-px data="16x16:000..." scale="4"></inline-px>
 *
 * Attributes:
 *   - data: Pixel art string (WxH:DATA or WxH:RLE:DATA)
 *   - scale: Image scale multiplier (default: 1)
 *   - alt: Alternative text for accessibility
 *   - class: CSS classes
 *
 * Example:
 *   <inline-px
 *     data="16x16:0000000000000000003BB00BB3000000B11111111B..."
 *     scale="4"
 *     alt="Heart sprite"
 *     class="pixelart"
 *   ></inline-px>
 */

(function() {
    'use strict';

    // 64-color palette (same as Inline.px editor)
    const PALETTE = [
        null,        // 0: Transparent
        '#000000',   // 1: Black
        '#FFFFFF',   // 2: White
        '#FF0000',   // 3: Red
        '#00FF00',   // 4: Green
        '#0000FF',   // 5: Blue
        '#FFFF00',   // 6: Yellow
        '#FF00FF',   // 7: Magenta
        '#00FFFF',   // 8: Cyan
        '#FFA500',   // 9: Orange
        '#1a1a1a', '#333333', '#4d4d4d', '#666666', '#808080',
        '#999999', '#b3b3b3', '#cccccc', '#e6e6e6', '#f5f5f5',
        '#8B0000', '#DC143C', '#FF6347', '#FFA07A', '#FFB6C1',
        '#006400', '#228B22', '#32CD32', '#90EE90', '#98FB98',
        '#00008B', '#4169E1', '#1E90FF', '#87CEEB', '#ADD8E6',
        '#4B0082', '#8B008B', '#9370DB', '#BA55D3', '#DDA0DD',
        '#8B4513', '#A0522D', '#D2691E', '#CD853F', '#DEB887',
        '#FFE4E1', '#FFE4B5', '#FAFAD2', '#E0FFFF', '#E6E6FA',
        '#FF1493', '#FF8C00', '#FFD700', '#ADFF2F', '#00CED1',
        '#9400D3', '#8B4789', '#2F4F4F', '#708090', '#BC8F8F',
        '#F0E68C', '#EEE8AA', '#F5DEB3', '#FFDAB9'
    ];

    // Base64 character to index mapping
    const BASE64_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/';

    function getColorIndex(char) {
        const index = BASE64_CHARS.indexOf(char);
        return index >= 0 && index < PALETTE.length ? index : 0;
    }

    /**
     * Decompress RLE format
     */
    function decompressRLE(compressed) {
        let decompressed = '';
        let i = 0;

        while (i < compressed.length) {
            // Parse fixed 2-digit count
            if (i + 2 < compressed.length) {
                const countStr = compressed.substring(i, i + 2);
                const count = parseInt(countStr);
                const char = compressed[i + 2];
                decompressed += char.repeat(count);
                i += 3; // Skip count (2 digits) + char (1)
            } else {
                // Malformed data, skip
                break;
            }
        }

        return decompressed;
    }

    /**
     * Parse pixel art data string
     */
    function parsePixelArt(dataString) {
        const parts = dataString.split(':');
        const [width, height] = parts[0].split('x').map(Number);

        let data;
        if (parts[1] === 'RLE') {
            data = decompressRLE(parts[2]);
        } else {
            data = parts[1];
        }

        return { width, height, data };
    }

    /**
     * Define Custom Element
     */
    class InlinePxElement extends HTMLElement {
        constructor() {
            super();
            this.attachShadow({ mode: 'open' });
        }

        connectedCallback() {
            this.render();
        }

        static get observedAttributes() {
            return ['data', 'scale', 'alt'];
        }

        attributeChangedCallback(name, oldValue, newValue) {
            if (oldValue !== newValue) {
                this.render();
            }
        }

        render() {
            const dataString = this.getAttribute('data');
            if (!dataString) {
                this.shadowRoot.innerHTML = '<p style="color: red;">Missing "data" attribute</p>';
                return;
            }

            const scale = Math.max(1, parseInt(this.getAttribute('scale') || '1'));
            const alt = this.getAttribute('alt') || 'Inline.px pixel art';

            try {
                const { width, height, data } = parsePixelArt(dataString);

                // Create canvas
                const canvas = document.createElement('canvas');
                canvas.width = width * scale;
                canvas.height = height * scale;

                const ctx = canvas.getContext('2d');
                ctx.imageSmoothingEnabled = false;

                // Draw pixels
                for (let y = 0; y < height; y++) {
                    for (let x = 0; x < width; x++) {
                        const index = y * width + x;
                        const char = data[index];
                        const colorIndex = getColorIndex(char);
                        const color = PALETTE[colorIndex];

                        if (color) {
                            ctx.fillStyle = color;
                            ctx.fillRect(x * scale, y * scale, scale, scale);
                        }
                    }
                }

                // Convert to data URL
                const dataUrl = canvas.toDataURL('image/png');

                // Create image element
                this.shadowRoot.innerHTML = `
                    <style>
                        :host {
                            display: inline-block;
                            line-height: 0;
                        }
                        img {
                            display: block;
                            image-rendering: -moz-crisp-edges;
                            image-rendering: -webkit-crisp-edges;
                            image-rendering: pixelated;
                            image-rendering: crisp-edges;
                            max-width: 100%;
                            height: auto;
                        }
                    </style>
                    <img src="${dataUrl}" alt="${alt}" width="${width * scale}" height="${height * scale}" />
                `;
            } catch (error) {
                console.error('Inline.px render error:', error);
                this.shadowRoot.innerHTML = `<p style="color: red;">Invalid pixel art data</p>`;
            }
        }
    }

    // Register custom element
    if (!customElements.get('inline-px')) {
        customElements.define('inline-px', InlinePxElement);
        console.log('✓ <inline-px> custom element registered');
    }
})();
