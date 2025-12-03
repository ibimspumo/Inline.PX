# Inline.px 🎨

**Ultra-compact pixel art format with zero-dependency client-side rendering.**

Inline.px is a complete pixel art solution for developers: a professional browser-based editor that generates incredibly small text strings, plus a standalone JavaScript library (`inline-px.js`) for rendering them anywhere. Perfect for game developers, web apps, and anyone who needs to store and display pixel art efficiently.

---

## 🚀 Quick Start for Developers

### Drop-in Integration (Recommended)

Just include one file and start using pixel art:

```html
<!-- 1. Include the standalone library (6KB, zero dependencies) -->
<script src="inline-px.js"></script>

<!-- 2. Use the custom element anywhere -->
<inline-px
    data="8x8:RLE:090021010021020011023011023011010011053011010011053011020011033011040011013011060011040"
    scale="8"
    alt="Heart sprite"
></inline-px>
```

**That's it!** The library handles:
- ✅ Automatic RLE decompression
- ✅ Pixel-perfect rendering
- ✅ Proper CSS for crisp scaling
- ✅ Shadow DOM isolation (no style conflicts)
- ✅ Dynamic attribute updates

### Installation Options

**Option 1: Direct Download**
```bash
# Download inline-px.js from this repo
curl -O https://raw.githubusercontent.com/your-repo/inline.px/main/inline-px.js
```

**Option 2: Copy & Paste**
- Copy `inline-px.js` into your project
- Works with static sites, GitHub Pages, Netlify, Vercel, etc.
- No build step required

---

## 📖 Developer Guide

### The `<inline-px>` Custom Element

The standalone library registers a Web Component that renders pixel art strings as PNG images.

#### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data` | String | Required | Pixel art string (formats: `WxH:DATA` or `WxH:RLE:DATA`) |
| `scale` | Number | `1` | Scale multiplier (1-32) |
| `alt` | String | `"Inline.px pixel art"` | Alt text for accessibility |
| `class` | String | - | CSS classes for additional styling |

#### Basic Usage

```html
<!-- Standard format -->
<inline-px
    data="16x16:0000000000000000003BB00BB3000000B11111111B00000B111111111B0000B11111111111B000B111111111111B00B11111111111111B0B111111111111111B0B111111111111111B00B11111111111111B000B111111111111B0000B11111111111B00000B111111111B000000B11111111B0000000B111111B00000000B11111B000000000B111B0000000000BBB00000000000000000000000"
    scale="4"
></inline-px>

<!-- RLE compressed format (50-80% smaller for sprites with solid areas) -->
<inline-px
    data="8x8:RLE:090021010021020011023011023011010011053011010011053011020011033011040011013011060011040"
    scale="8"
></inline-px>
```

#### Dynamic Updates

The element automatically re-renders when attributes change:

```javascript
const sprite = document.querySelector('inline-px');

// Change sprite data
sprite.setAttribute('data', '16x16:0000...');

// Change scale
sprite.setAttribute('scale', '8');

// Swap between different sprites
sprite.setAttribute('data', spriteDatabase.playerIdle);
```

#### Error Handling

The element displays error messages for invalid data:

```html
<!-- Missing data attribute -->
<inline-px scale="4"></inline-px>
<!-- Renders: "Missing 'data' attribute" -->

<!-- Invalid format -->
<inline-px data="invalid"></inline-px>
<!-- Renders: "Invalid pixel art data" -->
```

---

## 🎮 Integration Examples

### Vanilla JavaScript Game

```javascript
// Sprite system using inline-px
class SpriteManager {
    constructor() {
        this.sprites = {
            player: {
                idle: '16x16:RLE:090011010011020011011011011...',
                walk: '16x16:RLE:090011010011020011011011011...',
                jump: '16x16:RLE:090011010011020011011011011...'
            },
            enemy: {
                slime: '16x16:RLE:090011010011020011011011011...'
            }
        };
    }

    render(container, spritePath, scale = 1) {
        const [category, name] = spritePath.split('.');
        const data = this.sprites[category]?.[name];

        if (!data) {
            console.error(`Sprite not found: ${spritePath}`);
            return null;
        }

        const element = document.createElement('inline-px');
        element.setAttribute('data', data);
        element.setAttribute('scale', scale);
        element.setAttribute('alt', `${category} ${name}`);
        container.appendChild(element);

        return element;
    }

    updateAnimation(element, spritePath) {
        const [category, name] = spritePath.split('.');
        const data = this.sprites[category]?.[name];
        if (data) {
            element.setAttribute('data', data);
        }
    }
}

// Usage
const spriteManager = new SpriteManager();
const gameCanvas = document.getElementById('game');

// Render player
const player = spriteManager.render(gameCanvas, 'player.idle', 4);

// Animate player
setInterval(() => {
    spriteManager.updateAnimation(player, 'player.walk');
}, 100);
```

### React Component Wrapper

```jsx
import React from 'react';

/**
 * React wrapper for <inline-px> element
 */
function PixelArt({ data, scale = 1, alt = 'Pixel art', className, style }) {
    return (
        <inline-px
            data={data}
            scale={scale}
            alt={alt}
            class={className}
            style={style}
        />
    );
}

// Usage
function App() {
    const [currentFrame, setCurrentFrame] = React.useState(0);

    const frames = [
        '8x8:RLE:090021010021020011023011023...',
        '8x8:RLE:090021010021020011023011023...',
        '8x8:RLE:090021010021020011023011023...'
    ];

    React.useEffect(() => {
        const interval = setInterval(() => {
            setCurrentFrame(prev => (prev + 1) % frames.length);
        }, 200);
        return () => clearInterval(interval);
    }, []);

    return (
        <div>
            <h1>Animated Sprite</h1>
            <PixelArt
                data={frames[currentFrame]}
                scale={8}
                alt="Animated heart"
            />
        </div>
    );
}
```

### Vue Component

```vue
<template>
    <inline-px
        :data="spriteData"
        :scale="scale"
        :alt="alt"
        :class="className"
    />
</template>

<script>
export default {
    name: 'PixelArt',
    props: {
        data: {
            type: String,
            required: true
        },
        scale: {
            type: Number,
            default: 1
        },
        alt: {
            type: String,
            default: 'Pixel art'
        },
        className: String
    }
}
</script>

<!-- Usage -->
<template>
    <div>
        <PixelArt
            :data="playerSprite"
            :scale="4"
            alt="Player character"
        />
    </div>
</template>

<script>
export default {
    data() {
        return {
            playerSprite: '16x16:RLE:090011010011020011011011011...'
        }
    }
}
</script>
```

### Database Storage

Store sprites efficiently in any database as text:

```sql
-- SQL Schema
CREATE TABLE sprites (
    id INTEGER PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    category VARCHAR(100),
    data TEXT NOT NULL,
    width INTEGER,
    height INTEGER,
    compressed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert sprites (incredibly small storage!)
INSERT INTO sprites (name, category, data, width, height, compressed) VALUES
    ('heart', 'icons', '8x8:RLE:090021010021020011023011023011010011053011010011053011020011033011040011013011060011040', 8, 8, true),
    ('player_idle', 'characters', '16x16:0000000000000000003BB00BB3000000B11111111B...', 16, 16, false);

-- Retrieve and render
SELECT data FROM sprites WHERE name = 'heart';
```

```javascript
// Frontend rendering from database
async function renderSpriteFromDB(spriteName, container, scale = 1) {
    const response = await fetch(`/api/sprites/${spriteName}`);
    const sprite = await response.json();

    const element = document.createElement('inline-px');
    element.setAttribute('data', sprite.data);
    element.setAttribute('scale', scale);
    element.setAttribute('alt', sprite.name);
    container.appendChild(element);
}

// Usage
renderSpriteFromDB('heart', document.getElementById('sprites'), 8);
```

### JSON Asset Bundle

Perfect for games and apps that need to bundle sprites:

```json
{
    "version": "1.0",
    "sprites": {
        "ui": {
            "heart_full": {
                "data": "8x8:RLE:090021010021020011023011023011010011053011010011053011020011033011040011013011060011040",
                "width": 8,
                "height": 8,
                "tags": ["ui", "health"]
            },
            "heart_empty": {
                "data": "8x8:RLE:090021010021020011013011013011010011003011010011003011020011013011040011013011060011040",
                "width": 8,
                "height": 8,
                "tags": ["ui", "health"]
            }
        },
        "characters": {
            "player_idle": {
                "data": "16x16:0000000000000000003BB00BB3000000B11111111B...",
                "width": 16,
                "height": 16,
                "tags": ["player", "animation"]
            }
        }
    }
}
```

```javascript
// Asset loader
class AssetLoader {
    async load(url) {
        const response = await fetch(url);
        this.assets = await response.json();
    }

    getSprite(category, name) {
        return this.assets.sprites[category]?.[name]?.data;
    }

    render(category, name, container, scale = 1) {
        const data = this.getSprite(category, name);
        if (!data) return null;

        const element = document.createElement('inline-px');
        element.setAttribute('data', data);
        element.setAttribute('scale', scale);
        container.appendChild(element);
        return element;
    }
}

// Usage
const loader = new AssetLoader();
await loader.load('assets/sprites.json');

const gameUI = document.getElementById('game-ui');
loader.render('ui', 'heart_full', gameUI, 4);
loader.render('characters', 'player_idle', gameUI, 4);
```

### Local Storage / IndexedDB

```javascript
// Save sprite to localStorage
function saveSprite(name, data) {
    const sprites = JSON.parse(localStorage.getItem('sprites') || '{}');
    sprites[name] = data;
    localStorage.setItem('sprites', JSON.stringify(sprites));
}

// Load and render
function loadSprite(name, container, scale = 1) {
    const sprites = JSON.parse(localStorage.getItem('sprites') || '{}');
    const data = sprites[name];

    if (!data) return null;

    const element = document.createElement('inline-px');
    element.setAttribute('data', data);
    element.setAttribute('scale', scale);
    container.appendChild(element);
    return element;
}

// IndexedDB for larger collections
class SpriteDatabase {
    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('SpriteDB', 1);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve();
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('sprites')) {
                    const store = db.createObjectStore('sprites', { keyPath: 'name' });
                    store.createIndex('category', 'category', { unique: false });
                }
            };
        });
    }

    async saveSprite(name, category, data) {
        const tx = this.db.transaction(['sprites'], 'readwrite');
        const store = tx.objectStore('sprites');
        await store.put({ name, category, data, timestamp: Date.now() });
    }

    async getSprite(name) {
        const tx = this.db.transaction(['sprites'], 'readonly');
        const store = tx.objectStore('sprites');
        return new Promise((resolve, reject) => {
            const request = store.get(name);
            request.onsuccess = () => resolve(request.result?.data);
            request.onerror = () => reject(request.error);
        });
    }

    async render(name, container, scale = 1) {
        const data = await this.getSprite(name);
        if (!data) return null;

        const element = document.createElement('inline-px');
        element.setAttribute('data', data);
        element.setAttribute('scale', scale);
        container.appendChild(element);
        return element;
    }
}
```

---

## 📐 Format Specification

### Standard Format

```
WxH:DATA
```

- `W` = Width (2-128 pixels)
- `H` = Height (2-128 pixels)
- `DATA` = Base64-encoded pixel data (exactly W×H characters)

**Example:** `8x8:0000000001101100133133101531015310013314013160140`

### RLE Compressed Format

```
WxH:RLE:COMPRESSED_DATA
```

**RLE Encoding:** Fixed 2-digit COUNT + 1 CHAR format
- Each run is exactly 3 characters: `CCCHAR`
- `CC` = 2-digit count (01-99) with leading zeros
- `CHAR` = Base64 character to repeat

**Examples:**
- `03a` = "aaa" (3 repetitions of 'a')
- `15B` = "BBBBBBBBBBBBBBB" (15 repetitions of 'B')
- `01x` = "x" (1 repetition of 'x')

**Full Example:**
`8x8:RLE:090021010021020011023011023011010011053011010011053011020011033011040011013011060011040`

**Decompression:**
```
09 0 = "000000000" (9 zeros)
02 1 = "11" (2 ones)
01 0 = "0" (1 zero)
...
```

### Color Palette

64 colors mapped to Base64 characters `0-9A-Za-z+/`:

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
    // ... 54 more colors (see inline-px.js for full palette)
];
```

**Character Mapping:**
- `0` = Transparent (index 0)
- `1-9` = First 9 colors (indices 1-9)
- `A-Z` = Next 26 colors (indices 10-35)
- `a-z` = Next 26 colors (indices 36-61)
- `+` = Index 62
- `/` = Index 63

---

## 🛠️ Advanced Usage

### Manual Decompression (Without Custom Element)

If you need to parse the format yourself:

```javascript
/**
 * Decompress RLE format manually
 */
function decompressRLE(compressed) {
    let decompressed = '';
    let i = 0;

    while (i < compressed.length) {
        if (i + 2 < compressed.length) {
            const countStr = compressed.substring(i, i + 2);
            const count = parseInt(countStr);
            const char = compressed[i + 2];
            decompressed += char.repeat(count);
            i += 3; // Skip 2-digit count + 1 char
        } else {
            break; // Malformed data
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

// Usage
const { width, height, data } = parsePixelArt('8x8:RLE:090021010...');
console.log(`Size: ${width}×${height}, Data length: ${data.length}`);
```

### Custom Canvas Rendering

```javascript
function renderToCanvas(dataString, canvas, scale = 1) {
    const { width, height, data } = parsePixelArt(dataString);

    canvas.width = width * scale;
    canvas.height = height * scale;

    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;

    const BASE64_CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/';

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const index = y * width + x;
            const char = data[index];
            const colorIndex = BASE64_CHARS.indexOf(char);
            const color = PALETTE[colorIndex];

            if (color) {
                ctx.fillStyle = color;
                ctx.fillRect(x * scale, y * scale, scale, scale);
            }
        }
    }

    return canvas;
}
```

### Server-Side Rendering (Node.js)

```javascript
// Using node-canvas
const { createCanvas } = require('canvas');
const fs = require('fs');

function renderPixelArtToPNG(dataString, outputPath, scale = 1) {
    const { width, height, data } = parsePixelArt(dataString);

    const canvas = createCanvas(width * scale, height * scale);
    const ctx = canvas.getContext('2d');

    // ... render pixels (same as browser)

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);
}

// Generate PNG files from sprite database
renderPixelArtToPNG(
    '8x8:RLE:090021010021020011023011023...',
    'heart.png',
    8
);
```

---

## ✨ Why Inline.px?

### Ultra-Compact Storage

Traditional image formats are bloated. Inline.px produces tiny text strings:

| Size | Standard | RLE Compressed |
|------|----------|----------------|
| **8×8** | ~64 bytes | ~30-50 bytes |
| **16×16** | ~256 bytes | ~100-150 bytes |
| **32×32** | ~1 KB | ~400-600 bytes |
| **64×64** | ~4 KB | ~1.5-2.5 KB |

**RLE compression** saves 50-80% for sprites with solid areas!

### Perfect for Developers

- ✅ **Embed directly in code** - No external files
- ✅ **Store in databases** - Just text, no BLOB handling
- ✅ **Version control friendly** - Easy to diff and merge
- ✅ **No loading delays** - Instant rendering
- ✅ **Cross-platform** - Works everywhere text works
- ✅ **Zero dependencies** - Pure vanilla JavaScript
- ✅ **No build step** - Drop in and use

### Size Comparisons

| Format | 16×16 | 32×32 | 64×64 |
|--------|-------|-------|-------|
| **Inline.px (Standard)** | ~260 bytes | ~1 KB | ~4 KB |
| **Inline.px (RLE)** | ~100-150 bytes | ~400-600 bytes | ~1.5-2.5 KB |
| **PNG (indexed)** | ~150-300 bytes | ~500-800 bytes | ~2-4 KB |
| **PNG (RGBA)** | ~400-800 bytes | ~1.5-3 KB | ~6-12 KB |

**When Inline.px wins:**
- Embedding in code (no Base64 overhead)
- Database storage (no binary handling)
- Version control (readable text diffs)
- Simple parsing (no image library needed)

---

## 🎨 The Editor

The included pixel art editor is a full-featured professional tool:

### Features
- **11 Drawing Tools**: Brush, Pencil, Eraser, Line, Rectangle, Ellipse, Fill, Select, Magic Wand, Move, Hand
- **64-Color Palette**: Complete Base64 color set
- **Multi-Tab Workspace**: Photoshop-style tabs for multiple sprites
- **Undo/Redo**: Full history with Ctrl+Z/Y
- **Zoom & Pan**: 10%-1000% zoom with smooth panning
- **Autosave**: Never lose work (30s intervals)
- **Export Options**:
  - Copy to clipboard (text or PNG data URL)
  - Download as TXT
  - Download as PNG (1×, 2×, 4×, 8× scale)
  - Optional RLE compression with live preview

### Quick Start

1. Open `index.html` in a browser
2. Draw pixel art
3. Click "Export" → Choose format
4. Use the exported string in your code

**No build process, no dependencies, no server required!**

### Keyboard Shortcuts

**Tools:**
- `B` Brush, `P` Pencil, `E` Eraser, `L` Line
- `R` Rectangle, `O` Ellipse, `F` Fill
- `M` Select, `W` Magic Wand, `V` Move, `H` Hand

**Edit:**
- `Ctrl/Cmd + Z` - Undo
- `Ctrl/Cmd + Y` - Redo
- `Ctrl/Cmd + N` - New Tab

**Viewport:**
- `Ctrl/Cmd + +` - Zoom In
- `Ctrl/Cmd + -` - Zoom Out
- `Ctrl/Cmd + 0` - Reset Zoom
- `Space + Drag` - Pan

---

## 📦 What's Included

```
inline.px/
├── index.html              # Pixel art editor
├── inline-px.js            # Standalone rendering library ⭐
├── example.html            # Integration examples
├── favicon.png             # App icon
├── style.css               # Editor styles (modular imports)
├── config/                 # Configuration
│   ├── colors.js           # 64-color palette (editable)
│   └── constants.js        # App-wide constants
├── js/
│   ├── core/               # Core infrastructure
│   │   ├── Logger.js       # Logging system
│   │   ├── EventBus.js     # Event-driven architecture
│   │   └── ConfigLoader.js # Configuration loader
│   ├── utils/              # Utility modules
│   │   ├── ClipboardUtils.js
│   │   ├── ValidationUtils.js
│   │   └── FormatUtils.js
│   ├── tools/              # Drawing tools system
│   │   ├── BaseTool.js     # Abstract base class
│   │   ├── ToolRegistry.js # Tool management
│   │   └── implementations/
│   │       ├── BrushTool.js
│   │       ├── PencilTool.js
│   │       ├── EraserTool.js
│   │       ├── LineTool.js
│   │       ├── RectangleTool.js
│   │       ├── EllipseTool.js
│   │       ├── FillTool.js
│   │       ├── SelectTool.js
│   │       ├── MagicWandTool.js
│   │       ├── MoveTool.js
│   │       └── HandTool.js
│   ├── canvas/             # Canvas system (5 modules)
│   │   ├── PixelData.js    # Data management
│   │   ├── CanvasRenderer.js # Rendering engine
│   │   ├── CanvasEvents.js # Event handling
│   │   ├── SelectionOverlay.js # Selection visualization
│   │   └── PixelCanvas.js  # Canvas orchestrator
│   ├── app.js              # Main application
│   ├── compression.js      # RLE compression
│   ├── dialogs.js          # Custom modal system
│   ├── pngExport.js        # PNG export
│   ├── fileManager.js      # Save/load
│   ├── tabManager.js       # Multi-tab workspace
│   ├── autosave.js         # Auto-saving
│   ├── viewport.js         # Zoom/pan
│   ├── history.js          # Undo/redo
│   └── colorPalette.js     # Color system
└── css/                    # Modular stylesheets (12 files)
    ├── variables.css       # Design tokens
    ├── layout.css          # 3-panel layout
    ├── dialogs.css         # Custom modals
    └── ...                 # 9 more CSS modules
```

**For integration, you only need `inline-px.js`!**

### Architecture Highlights

The editor features a **fully modular architecture**:
- ✅ **26+ JavaScript modules** - Clean separation of concerns
- ✅ **IIFE pattern** - No bundler required, runs directly in browser
- ✅ **Event-driven** - Loose coupling via EventBus
- ✅ **Extensible** - Add new tools by extending BaseTool
- ✅ **Well-documented** - Comprehensive inline documentation
- ✅ **No dependencies** - Pure vanilla JavaScript

---

## 🎯 Use Cases

- **Game Development**: Sprites, tiles, UI elements, particle effects
- **Web Apps**: Icons, avatars, loading indicators, decorations
- **Embedded Systems**: Tiny graphics for resource-constrained devices
- **Education**: Pixel art tutorials, game dev courses
- **Data Visualization**: Heatmaps, status grids, mini charts

---

## 🔧 Browser Support

| Browser | Version | Notes |
|---------|---------|-------|
| Chrome/Edge | 90+ | ✅ Full support |
| Firefox | 88+ | ✅ Full support |
| Safari | 14+ | ✅ Full support |
| Opera | 76+ | ✅ Full support |
| Mobile | Modern | ⚠️ Touch supported, limited keyboard shortcuts |

**Requirements:** Web Components (Custom Elements) support

---

## 💡 Tips & Best Practices

### For Smallest File Sizes

1. **Use transparency** - Color `0` is transparent, use it for empty areas
2. **Limit colors** - Fewer unique colors = better RLE compression
3. **Keep it small** - 8×8, 16×16, 32×32 are optimal sizes
4. **Use RLE for solid areas** - Large solid regions compress extremely well
5. **Test compression** - Editor shows if RLE helps or hurts

### For Best Quality

1. **Export PNG at high scale** - Use 8× for crisp pixels
2. **Use proper CSS** - `image-rendering: pixelated` for sharp edges
3. **Align to grid** - Keep sprites pixel-perfect
4. **Test at target size** - Preview at actual display scale

### Performance

- `<inline-px>` renders to data URL (one-time conversion)
- Shadow DOM prevents style conflicts
- Minimal DOM footprint
- No external image requests

---

## 🤝 Contributing

Contributions welcome! The codebase is modular and well-documented.

### Architecture

- **Editor**: Modular JavaScript (no framework)
- **Library**: Pure vanilla JS Web Component
- **No build step**: Direct browser execution
- **No dependencies**: Everything self-contained

---

## 📜 License

MIT License - Use freely in personal and commercial projects

---

## 🚀 Get Started

1. **Download** `inline-px.js`
2. **Include** in your HTML
3. **Use** `<inline-px>` elements
4. **Create sprites** in the editor
5. **Export** and embed in your code

**No npm install, no webpack, no complexity. Just works.**

---

**Made with ❤️ for developers who value simplicity and efficiency**

*Start building with ultra-compact pixel art today!*
