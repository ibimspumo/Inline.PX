# Inline.px 🎨

**Ultra-compact pixel art with on-the-fly PNG generation.**

Inline.px is a professional browser-based pixel art editor that generates incredibly small file sizes using a custom Base64 encoding system. It includes a custom HTML element and PNG generation server for seamless integration anywhere. Perfect for game developers who need to store sprites, icons, and textures in minimal space.

---

## ✨ Why Inline.px?

### 🎯 Ultra-Compact Storage
Traditional image formats are bloated. Inline.px uses a revolutionary **Base64 encoding system** that produces tiny text strings:

- **16×16 sprite**: Only **260 characters** (~260 bytes)
- **32×32 icon**: Only **1,030 characters** (~1 KB)
- **64×64 texture**: Only **4,100 characters** (~4 KB)

Compare this to PNG files which are typically **5-10× larger**!

### 📦 Perfect for Game Development

- **Embed directly in code** - No external files needed
- **Store in databases** - Just a text field
- **Version control friendly** - Easy to diff and merge
- **No loading delays** - Instant rendering
- **Cross-platform** - Works everywhere text works

---

## 🚀 Features

### Professional Tools
- **11 Drawing Tools**: Brush, Pencil, Eraser, Line, Rectangle, Ellipse, Fill, Select, Magic Wand, Move, Hand
- **64 Colors**: Curated palette with Base64 encoding (0-9, A-Z, a-z, +, /)
- **Adjustable Brush Sizes**: 1px, 2px, 3px, 5px
- **Shape Modes**: Fill and Stroke for rectangles and ellipses

### Advanced Features
- **Multi-Tab Workspace**: Work on multiple sprites simultaneously (Photoshop-style)
- **Autosave System**: Never lose your work with automatic saving (every 30s)
- **Zoom & Pan**: 10%-1000% zoom with smooth panning and hand tool
- **RLE Compression**: Optional compression with savings preview (50-80% smaller)
- **PNG Export**: Export as PNG with multiple scale options (1×, 2×, 4×, 8×)
- **Real-Time Export**: See your export string update as you draw
- **LocalStorage Integration**: Save/load projects in your browser

### Modern Interface
- **Dark Theme**: Professional design easy on the eyes
- **Material Symbols Icons**: Modern, crisp icon system from Google
- **Keyboard Shortcuts**: Fast workflow with hotkeys for every tool
- **Responsive Design**: Works on desktop and mobile
- **Custom Dialogs**: Beautiful, consistent UI (no browser popups)

---

## 📖 How It Works

### The Format

PixelCreator Pro exports pixel art as a simple text string:

```
WxH:BASE64DATA
```

**Example:** A 16×16 red heart icon
```
16x16:0000000000000000003BB00BB3000000B11111111B00000B111111111B0000B11111111111B000B111111111111B00B11111111111111B0B111111111111111B0B111111111111111B00B11111111111111B000B111111111111B0000B11111111111B00000B111111111B000000B11111111B0000000B111111B00000000B11111B000000000B111B0000000000BBB00000000000000000000000
```

This represents a full 16×16 sprite in just **260 characters**!

### Optional RLE Compression

For sprites with repeated pixels, you can enable RLE (Run-Length Encoding) compression:

```
WxH:RLE:COMPRESSED_DATA
```

**Example:** Same heart with compression
```
16x16:RLE:16(0)3B2(0)B3(0)B11(1)B9(1)B11(1)B10(1)B9(1)B...
```

This can reduce file size by **50-80%** for sprites with large solid areas! The editor shows you the exact savings and a before/after preview.

### Encoding System

- **Character `0`**: Transparent pixel
- **Characters `1-9, A-Z, a-z, +, /`**: 63 colors
- Each character = 1 pixel
- Total palette: 64 colors (6-bit color depth)

---

## 🚀 Easy Integration - Standalone Client-Side

Just include one JavaScript file and use the `<inline-px>` custom element:

```html
<!-- Include the standalone script (no dependencies!) -->
<script src="inline-px.js"></script>

<!-- Use anywhere in your HTML -->
<inline-px
    data="16x16:0000000000000000003BB00BB3000000B11111111B..."
    scale="8"
    alt="Heart sprite"
></inline-px>
```

**Features:**
- ✓ **Zero dependencies** - pure vanilla JavaScript
- ✓ **No server required** - works on static sites (GitHub Pages, Netlify, etc.)
- ✓ **Automatic RLE compression** support
- ✓ **Crisp pixel-perfect rendering** with proper CSS
- ✓ **Shadow DOM isolation** - no style conflicts
- ✓ **Copy & paste ready** - drop `inline-px.js` into any project

**Attributes:**
- `data` - Your pixel art string (WxH:DATA or WxH:RLE:DATA)
- `scale` - Image scale multiplier (default: 1)
- `alt` - Alternative text for accessibility
- `class` - CSS classes for styling

---

## 💻 Integration Examples

### JavaScript/HTML5 Canvas

```javascript
/**
 * Parse and render PixelCreator Pro format
 * Supports both standard and RLE-compressed formats
 */
function parsePixelArt(dataString) {
    const parts = dataString.split(':');
    const [width, height] = parts[0].split('x').map(Number);

    let data;
    if (parts[1] === 'RLE') {
        // Decompress RLE format
        data = decompressRLE(parts[2]);
    } else {
        // Standard format
        data = parts[1];
    }

    return { width, height, data };
}

/**
 * Decompress RLE format
 * Format: "16(0)" means 16 repetitions of character '0'
 */
function decompressRLE(compressed) {
    let decompressed = '';
    let i = 0;

    while (i < compressed.length) {
        // Check if we have a number (run length)
        if (/\d/.test(compressed[i])) {
            let numStr = '';
            while (i < compressed.length && /\d/.test(compressed[i])) {
                numStr += compressed[i];
                i++;
            }
            const count = parseInt(numStr);
            const char = compressed[i];
            decompressed += char.repeat(count);
            i++;
        } else {
            // Single character
            decompressed += compressed[i];
            i++;
        }
    }

    return decompressed;
}

/**
 * Base64 character to color palette
 */
const PALETTE = {
    '0': null,              // Transparent
    '1': '#000000',         // Black
    '2': '#FFFFFF',         // White
    '3': '#FF0000',         // Red
    '4': '#00FF00',         // Green
    '5': '#0000FF',         // Blue
    // ... add all 64 colors from the palette
};

/**
 * Render pixel art to canvas
 */
function renderPixelArt(dataString, canvas, scale = 1) {
    const { width, height, data } = parsePixelArt(dataString);
    const ctx = canvas.getContext('2d');

    canvas.width = width * scale;
    canvas.height = height * scale;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = y * width + x;
            const char = data[index];
            const color = PALETTE[char];

            if (color) {  // Skip transparent pixels
                ctx.fillStyle = color;
                ctx.fillRect(x * scale, y * scale, scale, scale);
            }
        }
    }
}

// Usage
const spriteData = "16x16:0000000000000000003BB00BB300...";
const canvas = document.getElementById('myCanvas');
renderPixelArt(spriteData, canvas, 4);  // Render at 4× scale
```

### Game Engine Integration (Phaser Example)

```javascript
class PixelArtSprite {
    constructor(scene, x, y, dataString, scale = 1) {
        this.scene = scene;
        this.parse(dataString);
        this.scale = scale;

        // Create texture from pixel data
        this.createTexture();

        // Create sprite
        this.sprite = scene.add.sprite(x, y, this.textureKey);
        this.sprite.setScale(scale);
    }

    parse(dataString) {
        const [dimensions, data] = dataString.split(':');
        const [width, height] = dimensions.split('x').map(Number);

        this.width = width;
        this.height = height;
        this.data = data;
        this.textureKey = 'pixel_' + Date.now();
    }

    createTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        const ctx = canvas.getContext('2d');

        // Render each pixel
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const index = y * this.width + x;
                const char = this.data[index];
                const color = this.getColor(char);

                if (color) {
                    ctx.fillStyle = color;
                    ctx.fillRect(x, y, 1, 1);
                }
            }
        }

        // Add texture to game
        this.scene.textures.addCanvas(this.textureKey, canvas);
    }

    getColor(char) {
        // Your color palette mapping
        const palette = { '0': null, '1': '#000000', /* ... */ };
        return palette[char];
    }
}

// Usage in Phaser scene
const playerSprite = new PixelArtSprite(
    this,
    100,
    100,
    "16x16:0000000000000000003BB00BB300...",
    3  // 3× scale
);
```

### Database Storage

```sql
-- Store sprites in a database
CREATE TABLE sprites (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255),
    data TEXT,
    width INTEGER,
    height INTEGER,
    created_at TIMESTAMP
);

-- Insert a sprite (incredibly small storage!)
INSERT INTO sprites (name, data, width, height) VALUES (
    'player_idle',
    '16x16:0000000000000000003BB00BB300...',
    16,
    16
);
```

### JSON Game Assets

```json
{
  "sprites": {
    "player": {
      "idle": "16x16:0000000000000000003BB00BB300...",
      "walk": "16x16:0000000000000000003BB00BB300...",
      "jump": "16x16:0000000000000000003BB00BB300..."
    },
    "enemies": {
      "slime": "16x16:00000000BB00BB0000...",
      "bat": "16x16:0000B000000B000000..."
    },
    "tiles": {
      "grass": "8x8:4444444444444444...",
      "stone": "8x8:7777777777777777..."
    }
  }
}
```

### React Component

```jsx
import React, { useEffect, useRef } from 'react';

function PixelArtImage({ dataString, scale = 1 }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const [dimensions, data] = dataString.split(':');
        const [width, height] = dimensions.split('x').map(Number);

        canvas.width = width * scale;
        canvas.height = height * scale;

        const ctx = canvas.getContext('2d');
        const palette = getPalette();  // Your color palette

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const index = y * width + x;
                const color = palette[data[index]];

                if (color) {
                    ctx.fillStyle = color;
                    ctx.fillRect(x * scale, y * scale, scale, scale);
                }
            }
        }
    }, [dataString, scale]);

    return <canvas ref={canvasRef} />;
}

// Usage
<PixelArtImage
    dataString="16x16:0000000000000000003BB00BB300..."
    scale={4}
/>
```

### Node.js / Server-Side Rendering

```javascript
const { createCanvas } = require('canvas');
const fs = require('fs');

function renderPixelArtToPNG(dataString, outputPath, scale = 1) {
    const [dimensions, data] = dataString.split(':');
    const [width, height] = dimensions.split('x').map(Number);

    const canvas = createCanvas(width * scale, height * scale);
    const ctx = canvas.getContext('2d');

    const palette = getPalette();

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = y * width + x;
            const color = palette[data[index]];

            if (color) {
                ctx.fillStyle = color;
                ctx.fillRect(x * scale, y * scale, scale, scale);
            }
        }
    }

    // Save as PNG
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
}

// Convert to PNG for traditional use
renderPixelArtToPNG(
    "16x16:0000000000000000003BB00BB300...",
    "sprite.png",
    8  // 8× scale for crisp pixels
);
```

---

## 🎮 Complete Color Palette

The full 64-color palette is available in the editor. Here's the mapping:

```javascript
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

    // Grayscale (A-J)
    '#1a1a1a',   // A: Gray 10%
    '#333333',   // B: Gray 20%
    '#4d4d4d',   // C: Gray 30%
    '#666666',   // D: Gray 40%
    '#808080',   // E: Gray 50%
    '#999999',   // F: Gray 60%
    '#b3b3b3',   // G: Gray 70%
    '#cccccc',   // H: Gray 80%
    '#e6e6e6',   // I: Gray 90%
    '#f5f5f5',   // J: Gray 95%

    // Reds (K-O)
    '#8B0000',   // K: Dark Red
    '#DC143C',   // L: Crimson
    '#FF6347',   // M: Tomato
    '#FFA07A',   // N: Light Salmon
    '#FFB6C1',   // O: Light Pink

    // Greens (P-T)
    '#006400',   // P: Dark Green
    '#228B22',   // Q: Forest Green
    '#32CD32',   // R: Lime Green
    '#90EE90',   // S: Light Green
    '#98FB98',   // T: Pale Green

    // Blues (U-Y)
    '#00008B',   // U: Dark Blue
    '#4169E1',   // V: Royal Blue
    '#1E90FF',   // W: Dodger Blue
    '#87CEEB',   // X: Sky Blue
    '#ADD8E6',   // Y: Light Blue

    // Purples (Z-d)
    '#4B0082',   // Z: Indigo
    '#8B008B',   // a: Dark Magenta
    '#9370DB',   // b: Medium Purple
    '#BA55D3',   // c: Medium Orchid
    '#DDA0DD',   // d: Plum

    // Browns/Earth (e-i)
    '#8B4513',   // e: Saddle Brown
    '#A0522D',   // f: Sienna
    '#D2691E',   // g: Chocolate
    '#CD853F',   // h: Peru
    '#DEB887',   // i: Burlywood

    // Pastels (j-n)
    '#FFE4E1',   // j: Misty Rose
    '#FFE4B5',   // k: Moccasin
    '#FAFAD2',   // l: Light Goldenrod
    '#E0FFFF',   // m: Light Cyan
    '#E6E6FA',   // n: Lavender

    // Additional Colors (o-s)
    '#FF1493',   // o: Deep Pink
    '#FF8C00',   // p: Dark Orange
    '#FFD700',   // q: Gold
    '#ADFF2F',   // r: Green Yellow
    '#00CED1',   // s: Dark Turquoise

    // More Colors (t-x)
    '#9400D3',   // t: Dark Violet
    '#8B4789',   // u: Purple
    '#2F4F4F',   // v: Dark Slate Gray
    '#708090',   // w: Slate Gray
    '#BC8F8F',   // x: Rosy Brown

    // Final Colors (y-/)
    '#F0E68C',   // y: Khaki
    '#EEE8AA',   // z: Pale Goldenrod
    '#F5DEB3',   // +: Wheat
    '#FFDAB9'    // /: Peach Puff
];
```

---

## ⌨️ Keyboard Shortcuts

### Tools
- `B` - Brush
- `P` - Pencil
- `E` - Eraser
- `L` - Line
- `R` - Rectangle
- `O` - Ellipse (Circle)
- `F` - Fill
- `M` - Select (Marquee)
- `W` - Magic Wand
- `V` - Move
- `H` - Hand (Pan)

### File Operations
- `Ctrl/Cmd + N` - New Tab/Document
- `Ctrl/Cmd + S` - Save
- `Ctrl/Cmd + O` - Load

### Viewport
- `Ctrl/Cmd + +` - Zoom In
- `Ctrl/Cmd + -` - Zoom Out
- `Ctrl/Cmd + 0` - Reset View
- `Space + Drag` - Pan Canvas

---

## 🚀 Getting Started

### Installation

1. Clone or download this repository
2. Open `index.html` in a modern web browser
3. Start creating pixel art!

**No build process, no dependencies, no server required!**

### Quick Start

1. **Select a tool** - Click a tool or use keyboard shortcuts (B, P, E, L, etc.)
2. **Choose a color** - Click on the color palette (64 colors available)
3. **Draw** - Click and drag on the canvas
4. **Export** - Click "Export" to choose your export format
5. **Choose Format**:
   - **Copy String** - Copy the text string to clipboard
   - **Download TXT** - Save as a text file
   - **Download PNG** - Export as a pixel-perfect PNG image (1×, 2×, 4×, 8× scale)
6. **Optional Compression** - Enable RLE compression to reduce file size by 50-80%

### Tips for Smallest File Sizes

- Use **transparent background** (color 0) wherever possible
- Stick to a **limited color palette** - fewer unique colors = better compression potential
- Use **smaller dimensions** when possible (8×8, 16×16, 32×32)
- Consider creating **tile sets** instead of large images
- Enable **RLE compression** for sprites with repeated colors (the editor will show you if it helps)

---

## 📊 Size Comparisons

| Format | 16×16 | 32×32 | 64×64 |
|--------|-------|-------|-------|
| **PixelCreator Pro** | ~260 bytes | ~1 KB | ~4 KB |
| **PNG (indexed)** | ~150-300 bytes | ~500-800 bytes | ~2-4 KB |
| **PNG (RGBA)** | ~400-800 bytes | ~1.5-3 KB | ~6-12 KB |
| **BMP** | ~1 KB | ~4 KB | ~16 KB |
| **GIF** | ~300-500 bytes | ~1-2 KB | ~4-8 KB |

**Note**: PixelCreator Pro format excels when:
- Embedding directly in code (no Base64 encoding overhead)
- Storing in databases (no binary blob handling)
- Version control (text diffs work perfectly)
- Simple parsing (no image library required)

---

## 🏗️ Architecture

### Modular JavaScript
- `dialogs.js` - Custom dialog system with Material Symbols
- `compression.js` - RLE compression/decompression
- `pngExport.js` - PNG export functionality
- `colorPalette.js` - 64-color palette management
- `tools.js` - 11 professional drawing tools
- `canvas.js` - Canvas rendering and pixel data
- `fileManager.js` - Save/Load/Export operations
- `tabManager.js` - Multi-document interface
- `autosave.js` - Automatic saving system (30s intervals)
- `viewport.js` - Zoom and pan functionality
- `app.js` - Main application controller

### Modular CSS
- `variables.css` - Design system tokens
- `icons.css` - Material Symbols icon styling
- `layout.css` - Photoshop-style 3-panel layout
- `toolbox.css` - Tool sidebar styling
- `properties.css` - Properties panel styling
- `dialogs.css` - Custom dialog styling
- `tabs.css` - Multi-tab system styling
- `autosave.css` - Autosave indicator styling
- `zoom.css` - Zoom controls styling
- And more...

---

## 🎯 Use Cases

### Game Development
- **Sprite sheets**: Store multiple character animations
- **UI elements**: Icons, buttons, cursors
- **Tile sets**: Level tiles, terrain, objects
- **Particle effects**: Small animated effects
- **Emoji/Avatars**: User profile pictures

### Web Development
- **Favicon alternatives**: Tiny site icons
- **Loading indicators**: Animated spinners
- **Decorative elements**: Small graphics
- **User avatars**: Retro-style profile pics

### Education
- **Pixel art tutorials**: Easy to share and modify
- **Game development courses**: Simple asset creation
- **Art classes**: Introduction to digital art

### Data Visualization
- **Heatmaps**: Color-coded data grids
- **Mini charts**: Tiny sparkline-style graphs
- **Status indicators**: Visual status grids

---

## 🔧 Browser Support

- ✅ Chrome/Edge (90+)
- ✅ Firefox (88+)
- ✅ Safari (14+)
- ✅ Opera (76+)
- ⚠️ Mobile browsers (touch supported, keyboard shortcuts limited)

---

## 📜 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

---

## 💡 Future Ideas

- **Animation support**: Multiple frames with timeline
- **Onion skinning**: See previous/next frames while animating
- **Import from PNG**: Convert existing images
- **Color quantization**: Automatically reduce colors
- **Sprite sheet generator**: Combine multiple sprites
- **NPM library**: Official parsing/rendering library
- **Advanced compression**: LZ-based compression for even smaller sizes
- **Collaborative editing**: Real-time multi-user editing
- **Cloud sync**: Sync projects across devices

---

## 📞 Support

Having trouble? Create an issue in the GitHub repository!

---

**Made with ❤️ for game developers and pixel art enthusiasts**

*Start creating tiny, beautiful pixel art today!*
