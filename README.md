# Inline.px - Browser-Based Pixel Art Editor

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6%2B-yellow.svg)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF.svg)](https://vitejs.dev/)

A modern, lightweight pixel art editor that runs entirely in the browser. Built with vanilla JavaScript and ES6 modules, Inline.px provides a professional-grade pixel art creation experience with zero backend dependencies.

## 🎯 Features

### Core Functionality
- **Professional Tool Suite**: Pen, Line, Rectangle, Ellipse, Fill, Eyedropper, Hand, Selection tools
- **Multi-Tab Workspace**: Work on multiple sprites simultaneously (Photoshop-style tabs)
- **Undo/Redo System**: Full history management with 50-state stack
- **Autosave**: Automatic saving every 30 seconds with visual indicator
- **Zoom & Pan**: 10%-1000% zoom with smooth panning (Space key or Hand tool)

### Advanced Features
- **64-Color Base64 Palette**: Optimized color system with Base64 encoding
- **RLE Compression**: Optional Run-Length Encoding for compact exports
- **Custom Dialogs**: Beautiful modal system replacing browser alerts
- **LocalStorage**: Browser-based project persistence
- **Export Options**: Copy to clipboard, download as .txt, or export as PNG

### Developer Features
- **Modular Architecture**: 43+ ES6 modules with clear separation of concerns
- **JSDoc TypeDefs**: Full type safety without TypeScript compilation overhead
- **Config Validation**: Runtime validation for all configuration files
- **Event-Driven**: EventBus for decoupled inter-module communication
- **Single-File Build**: Entire app compiles to one HTML file (128KB gzipped: 34KB)

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) 18+ and npm

### Installation

```bash
# Clone the repository
git clone https://github.com/ibimspumo/Inline.PX.git
cd Inline.PX

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will open at `http://localhost:5173`

### Build for Production

```bash
npm run build
```

Output: `docs/index.html` - A single, self-contained HTML file

---

## 🏗️ Architecture

### Technology Stack

| Technology | Purpose | Version |
|------------|---------|---------|
| **Vite** | Build tool & dev server | 5.x |
| **JavaScript** | ES6+ modules | Native |
| **CSS** | Modular stylesheets | CSS3 |
| **JSDoc** | Type annotations | 3.x |
| **LocalStorage API** | Browser persistence | Native |

### Project Structure

```
inline.px/
├── js/                          # Source code (ES6 modules)
│   ├── main.js                  # Application entry point
│   ├── core/                    # Core systems
│   │   ├── EventBus.js          # Event-driven communication
│   │   ├── Logger.js            # Logging system
│   │   ├── ConfigLoader.js      # Configuration management
│   │   └── ...
│   ├── canvas/                  # Canvas rendering
│   │   ├── PixelCanvas.js       # Main canvas controller
│   │   ├── CanvasRenderer.js    # Drawing operations
│   │   └── ...
│   ├── tools/                   # Drawing tools
│   │   ├── BaseTool.js          # Base tool class
│   │   ├── ToolRegistry.js      # Tool management
│   │   ├── PenTool.js           # Pen implementation
│   │   └── ...
│   ├── dialogs/                 # Dialog system
│   │   ├── DialogCore.js        # Core dialog functionality
│   │   ├── ExportDialog.js      # Export dialog
│   │   └── ...
│   ├── utils/                   # Utility modules
│   │   ├── StorageUtils.js      # localStorage wrapper
│   │   ├── ConfigValidator.js   # Config validation
│   │   └── ...
│   ├── types.js                 # JSDoc type definitions
│   ├── fileManager.js           # File operations
│   ├── tabManager.js            # Multi-tab interface
│   ├── autosave.js              # Autosave system
│   ├── viewport.js              # Zoom & pan
│   ├── colorPalette.js          # Color management
│   ├── compression.js           # RLE compression
│   └── History.js               # Undo/redo
├── css/                         # Stylesheets
│   ├── style.css                # Main stylesheet
│   ├── utilities.css            # Utility classes
│   └── ...
├── config/                      # Configuration files
│   ├── colors.js                # 64-color palette config
│   └── constants.js             # App constants
├── docs/                        # Build output
│   └── index.html               # Single-file build
├── index.html                   # Development HTML
├── vite.config.js               # Vite configuration
├── package.json                 # Dependencies & scripts
├── CLAUDE.md                    # AI development guide
└── README.md                    # This file
```

---

## 🛠️ Development Guide

### Core Concepts

#### 1. Module System

All modules use ES6 imports/exports:

```javascript
// Import dependencies
import logger from './core/Logger.js';
import eventBus from './core/EventBus.js';

// Export functionality
const MyModule = {
    init() { /* ... */ },
    doSomething() { /* ... */ }
};

export default MyModule;
```

#### 2. Type Safety with JSDoc

We use JSDoc for type annotations without TypeScript overhead:

```javascript
/**
 * @typedef {Object} TabData
 * @property {string} id - Unique tab identifier
 * @property {string} name - Display name
 * @property {number} width - Canvas width
 * @property {number} height - Canvas height
 * @property {string} data - Pixel data string (WxH:DATA)
 * @property {boolean} isDirty - Unsaved changes flag
 */

/**
 * Create a new tab
 * @param {string} name - Tab name
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @returns {TabData} Created tab object
 */
function createNewTab(name, width, height) {
    // Implementation with full IntelliSense support
}
```

#### 3. Event-Driven Communication

Use EventBus for decoupled module communication:

```javascript
// Subscribe to events
eventBus.on('canvas:change', (data) => {
    console.log('Canvas changed:', data);
});

// Emit events
eventBus.emit('canvas:change', {
    width: 32,
    height: 32,
    timestamp: Date.now()
});
```

#### 4. Configuration Validation

All configs are validated at runtime:

```javascript
// config/constants.js
const Constants = {
    canvas: {
        minSize: 2,
        maxSize: 128,
        defaultWidth: 16,
        defaultHeight: 16
    }
};

// ConfigValidator automatically validates on load
// Throws error if validation fails
```

---

## 🔧 Creating New Tools

### Step 1: Create Tool Class

Create a new file in `js/tools/` extending `BaseTool`:

```javascript
// js/tools/MyCustomTool.js
import BaseTool from './BaseTool.js';
import logger from '../core/Logger.js';

/**
 * MyCustomTool - Description of what this tool does
 */
class MyCustomTool extends BaseTool {
    /**
     * Tool configuration (required)
     */
    static CONFIG = {
        id: 'my-custom-tool',
        name: 'My Tool',
        icon: 'M10,10 L20,20', // SVG path
        cursor: 'crosshair',
        shortcut: 'M',
        description: 'My custom drawing tool',
        supportsSelection: false
    };

    /**
     * Constructor
     */
    constructor() {
        super();
        // Initialize tool-specific state
        this.myState = null;
    }

    /**
     * Called when tool is activated
     */
    activate() {
        super.activate();
        logger.info?.('MyCustomTool activated');
    }

    /**
     * Called when tool is deactivated
     */
    deactivate() {
        super.deactivate();
        logger.info?.('MyCustomTool deactivated');
    }

    /**
     * Handle mouse/touch down
     * @param {number} x - Grid X coordinate
     * @param {number} y - Grid Y coordinate
     * @param {DrawingContext} context - Drawing context
     */
    onStart(x, y, context) {
        this.setPixel(context, x, y, this.options.primaryColor);
    }

    /**
     * Handle mouse/touch move
     * @param {number} x - Grid X coordinate
     * @param {number} y - Grid Y coordinate
     * @param {DrawingContext} context - Drawing context
     */
    onMove(x, y, context) {
        // Drawing logic during drag
        this.setPixel(context, x, y, this.options.primaryColor);
    }

    /**
     * Handle mouse/touch up
     * @param {number} x - Grid X coordinate
     * @param {number} y - Grid Y coordinate
     * @param {DrawingContext} context - Drawing context
     */
    onEnd(x, y, context) {
        // Finalize drawing
        logger.debug?.('MyCustomTool finished drawing');
    }

    /**
     * Cleanup when tool is destroyed
     */
    destroy() {
        super.destroy();
        this.myState = null;
    }
}

export default MyCustomTool;
```

### Step 2: Register Tool

Add your tool to the registry in `js/main.js`:

```javascript
// Import your tool
import MyCustomTool from './tools/MyCustomTool.js';

// Register with ToolRegistry
ToolRegistry.registerTools([
    PenTool,
    LineTool,
    // ... other tools
    MyCustomTool  // Add your tool
]);
```

### Step 3: Add Tool Button to UI

Update `index.html` to add a button for your tool:

```html
<button class="tool-btn" data-tool="my-custom-tool" title="My Tool (M)">
    <svg viewBox="0 0 24 24">
        <path d="M10,10 L20,20" />
    </svg>
</button>
```

### Tool Development Tips

1. **Use BaseTool helpers**: `setPixel()`, `getPixel()`, `clonePixelData()`
2. **Respect selections**: Check `this.isInSelection(x, y)` if tool supports selections
3. **Emit changes**: Call `this.emitChange()` when drawing is complete
4. **Handle options**: Access shared options via `this.options.primaryColor`, etc.
5. **Log appropriately**: Use `logger.debug?.()` for verbose logging

---

## 📦 Data Format

### Pixel Data String Format

```
WxH:DATA
```

**Example:** `16x16:00000000...` (16×16 canvas, Base64 color indices)

### Compressed Format (RLE)

```
WxH:RLE:COMPRESSED_DATA
```

**Example:** `16x16:RLE:2001500230...` (count+char pairs)

### Base64 Color Encoding

- **64 colors** mapped to Base64 characters: `0-9A-Za-z+/`
- Index 0: Transparent
- Index 1: Black
- Index 63: White

---

## 🎨 Adding Custom Colors

### Modify Color Palette

Edit `config/colors.js`:

```javascript
const ColorConfig = {
    base64Chars: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/',
    palette: [
        {
            index: 0,
            char: '0',
            color: '#00000000', // Transparent
            name: 'Transparent',
            category: 'Special'
        },
        {
            index: 1,
            char: '1',
            color: '#000000',
            name: 'Black',
            category: 'Grayscale'
        },
        // ... add your custom colors (must have exactly 64)
    ]
};
```

**Important**: The palette must have exactly 64 colors, and each `index` must match its array position.

---

## 🧪 Testing

### Manual Testing Checklist

```bash
# 1. Build the project
npm run build

# 2. Open docs/index.html in browser
open docs/index.html

# 3. Test core features
- [ ] Draw with Pen tool
- [ ] Use Undo/Redo (Ctrl+Z, Ctrl+Y)
- [ ] Create multiple tabs
- [ ] Save and load files
- [ ] Export as .txt and PNG
- [ ] Zoom and pan canvas
- [ ] Verify autosave indicator
```

### Validation Testing

Config validation runs automatically on startup. Check browser console for:

```
✅ Colors loaded from ES module (static)
✅ Constants loaded from ES module (static)
```

Errors indicate misconfigured `config/colors.js` or `config/constants.js`.

---

## 🐛 Debugging

### Enable Debug Logging

Set log level in browser console:

```javascript
// In browser DevTools console
logger.setLevel('debug');
```

### Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Build fails | Outdated dependencies | Run `npm install` |
| Canvas not rendering | Missing DOM element | Check `index.html` structure |
| Config validation error | Invalid colors/constants | Review config files |
| Autosave not working | localStorage disabled | Enable localStorage in browser |
| Tools not responding | ToolRegistry not initialized | Check `main.js` initialization order |

---

## 🚢 Deployment

### Option 1: Static Hosting

Deploy the single `docs/index.html` file to any static host:

- **GitHub Pages**: Enable in repo settings → Pages → Deploy from `/docs`
- **Netlify**: Drag and drop `docs/` folder
- **Vercel**: Connect repo and set build output to `docs/`

### Option 2: CDN

Upload to a CDN and share the direct link:

```
https://your-cdn.com/inline-px/index.html
```

### Option 3: Offline Use

The built file works completely offline - just open `docs/index.html` in any modern browser.

---

## 📚 API Reference

### ToolRegistry

```javascript
// Register a tool
ToolRegistry.registerTool(MyToolClass);

// Set current tool
ToolRegistry.setCurrentTool('pen');

// Get current tool
const tool = ToolRegistry.getCurrentTool();

// Set tool option
ToolRegistry.setToolOption('primaryColor', 5);
```

### EventBus

```javascript
// Subscribe to event
eventBus.on('event:name', callback);

// Emit event
eventBus.emit('event:name', data);

// Unsubscribe
eventBus.off('event:name', callback);
```

### PixelCanvas

```javascript
// Get canvas instance
import PixelCanvas from './canvas/PixelCanvas.js';

// Export to string
const dataString = PixelCanvas.exportToString();

// Import from string
PixelCanvas.importFromString('16x16:00000...');

// Clear canvas
PixelCanvas.clear();

// Resize
PixelCanvas.resize(32, 32);
```

### FileManager

```javascript
// Save to localStorage
await FileManager.save(dataString, 'my-sprite');

// Load from localStorage
const file = FileManager.load(fileId);

// Export as file
FileManager.exportAsFile(dataString, 'sprite.txt');
```

---

## 🤝 Contributing

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/my-feature`
3. **Make your changes**
4. **Test thoroughly**: `npm run build` and manual testing
5. **Commit with clear messages**: `git commit -m "Add MyFeature"`
6. **Push to your fork**: `git push origin feature/my-feature`
7. **Open a Pull Request**

### Code Style Guidelines

- Use **ES6+ features** (arrow functions, destructuring, etc.)
- Add **JSDoc comments** for all public functions
- Keep **files under 400 lines** (split if larger)
- Use **logger** instead of `console.log`
- Follow **existing naming conventions**
- Add **TypeDefs** for new data structures

### Commit Message Format

```
<type>: <subject>

<body>

<footer>
```

**Types**: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`

**Example**:
```
feat: Add custom brush tool

- Implement CustomBrushTool class
- Add pressure sensitivity support
- Update tool registry

Closes #123
```

---

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Acknowledgments

- Built with [Vite](https://vitejs.dev/)
- Inspired by classic pixel art editors
- Uses [vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile) for single-file builds

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/ibimspumo/Inline.PX/issues)
- **Discussions**: [GitHub Discussions](https://github.com/ibimspumo/Inline.PX/discussions)

---

**Made with ❤️ for pixel artists and developers**
