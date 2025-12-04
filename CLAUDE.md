# Inline.px - Pixel Art Editor

## Overview

**Inline.px** ist ein browserbasierter Pixel Art Editor mit zero-dependency client-side rendering. Das Projekt nutzt eine modulare ES6-Architektur mit Vite als Build-Tool und kompiliert zu einer einzigen, selbstständigen HTML-Datei.

- **Typ**: Standard single-project (browser-based app)
- **Stack**: Vanilla JavaScript (ES6+), Vite, CSS3, LocalStorage API
- **Architecture**: Event-driven, modular ES6 modules, JSDoc type annotations
- **Output**: Single-file build (128KB uncompressed, ~34KB gzipped)
- **Deployment**: Static hosting (GitHub Pages, Netlify, offline use)

Dieses CLAUDE.md ist die autoritative Quelle für Entwicklungsrichtlinien.
Unterverzeichnisse können spezialisierte Dokumentation enthalten.

---

## Universal Development Rules

### Code Quality (MUST)

- **MUST** use ES6+ module syntax (import/export)
- **MUST** add JSDoc comments for all public functions and classes
- **MUST** use the Logger module instead of console.log
- **MUST** emit events through EventBus for cross-module communication
- **MUST NOT** commit node_modules, .DS_Store, or temporary files
- **MUST NOT** use `any` type without explicit justification in JSDoc
- **MUST** validate user input before processing
- **MUST** handle errors gracefully with try-catch blocks

### Best Practices (SHOULD)

- **SHOULD** keep files under 500 lines (split into smaller modules if larger)
- **SHOULD** use descriptive variable names (no single letters except loop counters)
- **SHOULD** prefer functional patterns over imperative when appropriate
- **SHOULD** use const by default, let only when reassignment needed
- **SHOULD** validate coordinates before canvas operations
- **SHOULD** use throttle/debounce for performance-critical operations
- **SHOULD** test manually in browser after significant changes

### Anti-Patterns (MUST NOT)

- **MUST NOT** mix concerns (keep rendering, data, and business logic separate)
- **MUST NOT** create circular dependencies between modules
- **MUST NOT** mutate function parameters directly (use clones)
- **MUST NOT** use innerHTML with user-provided content (XSS risk)
- **MUST NOT** bypass security measures or validation
- **MUST NOT** hardcode configuration values (use config/ files)
- **MUST NOT** use global variables (use modules and EventBus)

---

## Git Workflow und Commit-Policy

### WICHTIG: Commit-Strategie

**NACH JEDER ÄNDERUNG MUSS EIN COMMIT GEMACHT WERDEN.**

- Nachdem du Code geändert, Features hinzugefügt oder Bugs behoben hast, erstelle **sofort einen Commit**
- Aktualisiere diese **CLAUDE.md Datei**, wenn sich Architektur, Patterns oder wichtige Workflows ändern
- Committe die CLAUDE.md zusammen mit den Code-Änderungen

**Workflow:**
```bash
# 1. Änderungen machen
# 2. CLAUDE.md aktualisieren (falls nötig)
# 3. Commit erstellen
git add .
git commit -m "feat: Add [feature description]

- Details der Änderung
- Weitere Details

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Branch-Strategie

- Branch from `main` for features: `feature/description`
- Branch from `main` for fixes: `fix/description`
- Use descriptive branch names: `feature/context-menu-system`, `fix/canvas-zoom-issue`

### Conventional Commits

Verwende Conventional Commit Format:

**Format:**
```
<type>: <subject>

<body>

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types:**
- `feat:` - Neues Feature
- `fix:` - Bug Fix
- `refactor:` - Code-Refactoring ohne Funktionsänderung
- `docs:` - Nur Dokumentationsänderungen
- `style:` - Code-Formatierung (keine funktionalen Änderungen)
- `perf:` - Performance-Verbesserungen
- `test:` - Test-Hinzufügungen oder -Korrekturen
- `chore:` - Build-Prozess oder Tool-Änderungen

**Beispiele:**
```bash
# Feature hinzufügen
git commit -m "feat: Add dynamic context menu system

- Implement ContextMenu module with configurable menu items
- Add context menus for canvas, palette, tabs, and files
- Support icons, separators, and dynamic action handlers

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Bug fixen
git commit -m "fix: Fix canvas zoom and scaling issues

- Simplify pixelSize calculation to work with Viewport zoom
- Remove redundant zoom multiplier
- Preserve zoom level on canvas resize

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"

# Refactoring
git commit -m "refactor: Extract tool event handling into mixin

- Create ToolEventMixin for reusable event handling
- Reduce code duplication across tool implementations

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

### Wann CLAUDE.md aktualisieren

Aktualisiere diese Datei, wenn:
- ✅ Neue Module hinzugefügt werden
- ✅ Architektur-Patterns sich ändern
- ✅ Neue Workflows oder Best Practices etabliert werden
- ✅ Wichtige Konfigurationsänderungen gemacht werden
- ✅ Neue Tool-Typen oder Core-Systeme hinzugefügt werden

Aktualisierung NICHT nötig für:
- ❌ Kleine Bug-Fixes
- ❌ Styling-Änderungen
- ❌ Einzelne Funktionsergänzungen ohne Architektur-Impact

---

## Core Commands

### Development
```bash
# Start development server (Vite)
npm run dev
# Öffnet automatisch http://localhost:5173

# Build for production (single HTML file)
npm run build
# Output: docs/index.html

# Install dependencies
npm install
```

### Project Structure Exploration
```bash
# List all JavaScript modules
find js -type f -name "*.js" -not -path "*/node_modules/*"

# Find tool implementations
find js/tools/implementations -name "*.js"

# Find core modules
find js/core -name "*.js"

# List CSS files
ls css/
```

### Quality Gates (run before commit)
```bash
# No automated tests yet - manual testing required
# 1. Run build
npm run build

# 2. Open built file in browser
open docs/index.html

# 3. Manual testing checklist:
# - Test all tools (Brush, Pencil, Fill, Select, etc.)
# - Test undo/redo (Ctrl+Z, Ctrl+Y)
# - Test file save/load from LocalStorage
# - Test export (copy string, download .txt, export PNG)
# - Test canvas resize
# - Test zoom and pan
# - Test multi-tab functionality
# - Test autosave indicator
```

---

## Project Structure

### Applications & Entry Point
- **`index.html`** → Development HTML template
  - Entry point for Vite dev server
  - Contains full UI structure
  - Loads `js/main.js` as module

- **`js/main.js`** → Application entry point ([main.js:1](js/main.js:1))
  - Initializes all core systems
  - Registers tools
  - Sets up event listeners and keyboard shortcuts
  - Orchestrates app lifecycle

### Core Systems (`js/core/`)
- **`EventBus.js`** → Centralized pub/sub event system ([EventBus.js:1](js/core/EventBus.js:1))
  - Pattern: `eventBus.on('event:name', callback)`
  - Used for: Cross-module communication
  - Events defined in: `EventBus.Events`

- **`Logger.js`** → Unified logging with levels ([Logger.js:1](js/core/Logger.js:1))
  - Levels: DEBUG, INFO, WARN, ERROR
  - Usage: `logger.info('message', data)`
  - Maintains history (last 100 entries)

- **`ConfigLoader.js`** → Configuration management
  - Loads and validates config files
  - Ensures config integrity at runtime

### Canvas System (`js/canvas/`)
- **`PixelCanvas.js`** → Main canvas orchestrator ([PixelCanvas.js:1](js/canvas/PixelCanvas.js:1))
  - Coordinates: PixelData, CanvasRenderer, CanvasEvents, SelectionOverlay
  - Runs main render loop with requestAnimationFrame
  - Exports/imports pixel data strings

- **`CanvasRenderer.js`** → Rendering engine
  - Draws pixels to canvas
  - Handles grid visualization
  - Manages zoom and pan

- **`PixelData.js`** → Data management
  - 2D array of color indices (0-63)
  - Format: `WxH:DATA` (e.g., `16x16:000111222...`)
  - Compression support via RLE

- **`CanvasEvents.js`** → User input handling
  - Mouse and touch events
  - Coordinate translation (screen → grid)
  - Delegates to ToolRegistry

- **`SelectionOverlay.js`** → Selection visualization
  - Renders marching ants selection border
  - Separate overlay canvas for performance

### Tool System (`js/tools/`)

**Architecture:**
- **`BaseTool.js`** → Abstract base class ([BaseTool.js:1](js/tools/BaseTool.js:1))
  - All tools extend this
  - Lifecycle: init() → activate() → deactivate() → destroy()
  - Drawing phases: onDrawStart(), onDrawContinue(), onDrawEnd()
  - Mixins: Selection, Events

- **`ToolRegistry.js`** → Tool management ([ToolRegistry.js:1](js/tools/ToolRegistry.js:1))
  - Registers and manages tool instances
  - Handles tool switching
  - Delegates drawing operations to current tool
  - Manages shared tool options (brushSize, shapeMode, colorCode)

**Tool Implementations** (`js/tools/implementations/`):
- **BrushTool** - Variable size brush (circular shape)
- **PencilTool** - Single pixel drawing
- **EraserTool** - Erase to transparent
- **LineTool** - Draw straight lines
- **RectangleTool** - Rectangles (fill/stroke)
- **EllipseTool** - Ellipses (fill/stroke)
- **FillTool** - Flood fill (bucket)
- **SelectTool** - Rectangular selection
- **MagicWandTool** - Color-based selection
- **MoveTool** - Move selected pixels
- **HandTool** - Pan viewport

### UI & Managers
- **`tabManager.js`** → Multi-tab interface ([tabManager.js:1](js/tabManager.js:1))
  - Photoshop-style tabs for multiple documents
  - Tab creation, switching, closing, renaming
  - Dirty state tracking
  - Autosave integration per tab

- **`fileManager.js`** → File operations ([fileManager.js:1](js/fileManager.js:1))
  - Save/load from LocalStorage
  - Export as .txt file
  - Export as PNG
  - File deletion with confirmation

- **`colorPalette.js`** → 64-color palette manager
  - Base64 encoding (0-9A-Za-z+/)
  - Character → Color index mapping
  - UI rendering

- **`dialogs.js`** → Modal dialog system
  - Custom dialogs (alert, confirm, prompt)
  - Export dialog with compression options
  - Replaces browser native dialogs

- **`contextMenu.js`** → Context menu system ([contextMenu.js:1](js/contextMenu.js:1))
  - Dynamic context menus for canvas, palette, tabs, files
  - Configurable menu items with icons and actions
  - Closes on click outside

- **`viewport.js`** → Zoom and pan
  - Zoom: 10%-1000%
  - Pan: Space key or Hand tool
  - Mouse wheel zoom

### Support Modules
- **`history.js`** → Undo/redo system ([history.js:1](js/history.js:1))
  - 50-state stack
  - Debounced state capture (500ms)
  - Supports canvas data strings

- **`autosave.js`** → Automatic saving ([autosave.js:1](js/autosave.js:1))
  - Saves every 30 seconds if dirty
  - Visual indicator with timestamp
  - Per-tab autosave to LocalStorage
  - 2-second debounce after last change

- **`compression.js`** → RLE compression ([compression.js:1](js/compression.js:1))
  - Run-Length Encoding for pixel data
  - Format: `WxH:RLE:02a05b` (count+char pairs)
  - Smart compression (only if smaller)

- **`pngExport.js`** → PNG export
  - Renders pixel data to PNG
  - Configurable scale (1×-20×)
  - Download as file

### Utilities (`js/utils/`)
- **`StorageUtils.js`** → LocalStorage wrapper
  - JSON storage helpers
  - Quota detection
  - Storage availability checks

- **`ValidationUtils.js`** → Input validation
  - Canvas dimension validation (2-128)
  - Coordinate validation
  - File name validation

- **`FormatUtils.js`** → String formatting
  - Dimension formatting (e.g., "16×16")
  - Data string truncation for display

- **`ClipboardUtils.js`** → Clipboard operations
  - Copy with visual feedback
  - Error handling for clipboard API

### Configuration (`config/`)
- **`colors.js`** → 64-color palette ([colors.js:1](config/colors.js:1))
  - Base64 character mapping
  - RGB hex colors
  - Color categories (basic, grayscale, reds, greens, etc.)
  - **MUST** have exactly 64 colors

- **`constants.js`** → Application constants ([constants.js:1](config/constants.js:1))
  - Canvas constraints (minSize: 2, maxSize: 128)
  - History settings (maxStates: 50)
  - Autosave timing (30s interval, 1s debounce)
  - Tool defaults (brushSize, shapeMode)
  - RLE compression settings

### Styles (`css/`)
Modular CSS architecture:
- `variables.css` - CSS custom properties
- `reset.css` - Browser reset
- `layout.css` - Main layout grid
- `toolbox.css` - Left sidebar styles
- `properties.css` - Right panel styles
- `buttons.css` - Button components
- `modals.css` - Modal dialogs
- `dialogs.css` - Custom dialog system
- `tabs.css` - Tab bar styles
- `context-menu.css` - Context menu styles
- `autosave.css` - Autosave indicator
- `welcome.css` - Welcome screen
- `utilities.css` - Utility classes
- `responsive.css` - Media queries

### Build Output (`docs/`)
- **`docs/index.html`** → Production build
  - Single-file output from Vite
  - All JS/CSS inlined
  - ~128KB uncompressed, ~34KB gzipped
  - Deployable to GitHub Pages, Netlify, etc.

---

## Architecture & Patterns

### Module Organization

**✅ DO**: Use ES6 import/export
```javascript
// Import dependencies
import logger from './core/Logger.js';
import eventBus from './core/EventBus.js';

// Export module
const MyModule = {
    init() { /* ... */ },
    doSomething() { /* ... */ }
};

export default MyModule;
```

**✅ DO**: Keep modules focused (Single Responsibility)
```javascript
// ❌ DON'T: Mix rendering with data management
// ✅ DO: Separate concerns
// - PixelData.js: Data only
// - CanvasRenderer.js: Rendering only
// - CanvasEvents.js: Input only
```

**❌ DON'T**: Create circular dependencies
```javascript
// ❌ BAD: ModuleA imports ModuleB, ModuleB imports ModuleA
// ✅ GOOD: Use EventBus for communication
```

### Event-Driven Communication

**Pattern**: Use EventBus for cross-module communication

```javascript
// Subscribe to events
eventBus.on('canvas:change', (data) => {
    logger.info('Canvas changed:', data);
});

// Emit events
eventBus.emit('canvas:change', {
    width: 32,
    height: 32,
    timestamp: Date.now()
});

// Unsubscribe
eventBus.off('canvas:change', callback);
```

**Available Events** (see `EventBus.Events`):
- `tool:changed` - Tool switched
- `tool:optionChanged` - Tool option changed
- `canvas:changed` - Canvas modified
- `canvas:resized` - Canvas resized
- `canvas:cleared` - Canvas cleared
- `selection:changed` - Selection changed
- `selection:cleared` - Selection cleared
- `color:changed` - Color selected
- `history:stateAdded` - State added to history
- `file:loaded` - File loaded
- `file:saved` - File saved
- `app:ready` - App initialized

### Type Safety with JSDoc

**✅ DO**: Use JSDoc for type annotations

```javascript
/**
 * @typedef {Object} TabData
 * @property {string} id - Unique tab identifier
 * @property {string} name - Display name
 * @property {number} width - Canvas width
 * @property {number} height - Canvas height
 * @property {string} data - Pixel data string (WxH:DATA)
 * @property {boolean} isDirty - Unsaved changes flag
 * @property {number} created - Creation timestamp
 * @property {number} modified - Last modified timestamp
 */

/**
 * Create a new tab
 * @param {string} name - Tab name
 * @param {number} width - Canvas width
 * @param {number} height - Canvas height
 * @param {string|null} data - Optional pixel data
 * @returns {TabData} Created tab object
 */
function createNewTab(name, width, height, data = null) {
    // Implementation with full IntelliSense support
}
```

**Existing TypeDefs** (see `js/types.js`):
- `TabData`, `SavedFile`, `ToolConfig`, `ToolOptions`
- `DrawingContext`, `SelectionBounds`, `PixelData`
- `HistoryState`, `CompressionStats`, `StorageStats`

### Configuration Validation

All configuration files are validated at runtime:

```javascript
// config/constants.js - Validated by ConfigLoader
const Constants = {
    canvas: {
        minSize: 2,      // Must be positive integer
        maxSize: 128,    // Must be >= minSize
        defaultWidth: 8  // Must be between min and max
    }
};

// config/colors.js - MUST have exactly 64 colors
const ColorConfig = {
    palette: [
        { index: 0, char: "0", color: "transparent", name: "Transparent" },
        // ... must have 64 entries total
    ]
};
```

**Validation happens at app init:**
- Canvas constraints validated
- Color palette validated (64 colors, unique chars/indices)
- Missing or invalid config → error alert and app stops

### State Management

**Canvas State:**
```javascript
// State stored in PixelData module
// 2D array: data[y][x] = colorIndex (0-63)

// Export to string
const dataString = PixelCanvas.exportToString();
// Format: "16x16:000111222..."

// Import from string
PixelCanvas.importFromString("16x16:000111222...");
```

**Tool State:**
```javascript
// Shared options managed by ToolStateManager
ToolRegistry.setToolOption('brushSize', 3);
ToolRegistry.setToolOption('shapeMode', 'stroke');
ToolRegistry.setToolOption('colorCode', 5);

// Tool-specific state in tool instance
class MyTool extends BaseTool {
    constructor() {
        super();
        this.myState = null; // Tool-specific state
    }
}
```

**Tab State:**
```javascript
// Managed by TabManager
// Each tab stores its own canvas data
const tab = {
    id: 'tab_123',
    name: 'My Artwork',
    width: 16,
    height: 16,
    data: '16x16:000111222...',
    isDirty: false  // Unsaved changes
};
```

### Error Handling

**✅ DO**: Use try-catch for error-prone operations

```javascript
async function saveFile() {
    try {
        const success = await FileManager.save(dataString, fileName);
        if (success) {
            logger.info('Saved successfully');
        }
    } catch (error) {
        logger.error('Save failed', error);
        await Dialogs.alert('Error', 'Failed to save file.', 'error');
    }
}
```

**✅ DO**: Validate inputs before processing

```javascript
function resize(width, height) {
    const validation = validationUtils.validateCanvasDimensions(width, height);
    if (!validation.valid) {
        Dialogs.alert('Invalid Size', validation.error, 'warning');
        return false;
    }
    // Proceed with resize
}
```

### Performance Optimization

**✅ DO**: Use throttle for frequent events

```javascript
// In BaseTool.js
this.throttle = ToolHelpers.createThrottle(16); // ~60fps

continueDrawing(x, y, pixelData, context) {
    if (this.throttle.shouldThrottle()) {
        return false; // Skip this frame
    }
    // Process drawing
}
```

**✅ DO**: Use debounce for delayed actions

```javascript
// In main.js - History
let historyDebounceTimer = null;

function onCanvasChange() {
    clearTimeout(historyDebounceTimer);
    historyDebounceTimer = setTimeout(() => {
        History.pushState(PixelCanvas.exportToString(), 'Paint');
    }, 500); // Wait 500ms after last change
}
```

**✅ DO**: Use requestAnimationFrame for rendering

```javascript
// In PixelCanvas.js
function startRenderLoop() {
    function loop() {
        CanvasRenderer.render(PixelData.getData());
        SelectionOverlay.render(selectionState, dashOffset);
        renderLoopId = requestAnimationFrame(loop);
    }
    loop();
}
```

---

## Creating New Tools

### Step 1: Create Tool Class

Create a new file in `js/tools/implementations/`:

```javascript
// js/tools/implementations/MyCustomTool.js
import BaseTool from '../BaseTool.js';

/**
 * MyCustomTool - Description of what this tool does
 */
class MyCustomTool extends BaseTool {
    /**
     * Tool configuration (required)
     * @static
     */
    static CONFIG = {
        id: 'my-custom-tool',
        name: 'My Tool',
        icon: 'brush', // Material Symbols icon name
        shortcut: 'M',
        cursor: 'crosshair',
        hasSizeOption: false,  // Show brush size option in UI
        hasShapeOption: false, // Show shape mode option in UI
        description: 'My custom drawing tool',
        category: 'drawing'
    };

    /**
     * Called when tool is activated
     */
    activate() {
        super.activate();
        this.logger.info('MyCustomTool activated');
    }

    /**
     * Called when tool is deactivated
     */
    deactivate() {
        super.deactivate();
        this.logger.info('MyCustomTool deactivated');
    }

    /**
     * Handle mouse/touch down
     * @param {number} x - Grid X coordinate
     * @param {number} y - Grid Y coordinate
     * @param {Array<Array<number>>} pixelData - 2D pixel array
     * @param {Object} context - Drawing context (colorCode, brushSize, etc.)
     * @returns {boolean} True if canvas was modified
     */
    onDrawStart(x, y, pixelData, context) {
        return this.setPixel(x, y, pixelData, context.colorCode);
    }

    /**
     * Handle mouse/touch move (drag)
     * @returns {boolean} True if canvas was modified
     */
    onDrawContinue(x, y, pixelData, context) {
        return this.setPixel(x, y, pixelData, context.colorCode);
    }

    /**
     * Handle mouse/touch up
     * @returns {boolean} True if canvas was modified
     */
    onDrawEnd(x, y, pixelData, context) {
        return this.setPixel(x, y, pixelData, context.colorCode);
    }

    /**
     * Set a pixel in the grid
     * @private
     */
    setPixel(x, y, pixelData, colorCode) {
        const height = pixelData.length;
        const width = pixelData[0].length;

        if (x >= 0 && x < width && y >= 0 && y < height) {
            // Check selection if tool respects it
            if (this.respectsSelection() && !this.isInSelection(x, y)) {
                return false;
            }

            if (pixelData[y][x] !== colorCode) {
                pixelData[y][x] = colorCode;
                return true; // Canvas modified
            }
        }
        return false; // No change
    }
}

export default MyCustomTool;
```

### Step 2: Register Tool

Add your tool to `js/main.js`:

```javascript
// Import your tool
import MyCustomTool from './tools/implementations/MyCustomTool.js';

// In initializeTools() function
async function initializeTools() {
    const toolClasses = [
        BrushTool, PencilTool, EraserTool,
        LineTool, RectangleTool, EllipseTool,
        FillTool, SelectTool, MagicWandTool,
        MoveTool, HandTool,
        MyCustomTool  // Add your tool here
    ];

    // ... rest of initialization
}
```

### Step 3: Add Tool Button to UI

Update `index.html` to add a tool button:

**Option A**: Let `setupToolbox()` auto-generate (recommended)
- Buttons are auto-generated from tool CONFIG
- No HTML changes needed

**Option B**: Manual button (for custom styling)
```html
<!-- In index.html, inside .toolbox-content -->
<button class="tool-btn" data-tool="my-custom-tool" title="My Tool (M)">
    <span class="material-symbols-outlined tool-icon">brush</span>
    <span class="tool-label">My Tool</span>
    <span class="tool-shortcut">M</span>
</button>
```

### Tool Development Tips

**✅ DO**: Use BaseTool helper methods
```javascript
// Available helpers (see ToolHelpers.js)
this.setPixel(x, y, pixelData, colorCode)
this.getPixel(x, y, pixelData)
this.clonePixelData(pixelData)
this.validateCoordinates(x, y, pixelData)
```

**✅ DO**: Respect selections
```javascript
// Check if tool should respect selection
if (this.respectsSelection() && !this.isInSelection(x, y)) {
    continue; // Skip pixels outside selection
}
```

**✅ DO**: Return true if canvas modified
```javascript
onDrawEnd(x, y, pixelData, context) {
    // ... drawing logic
    return true; // Tells system to update canvas
}
```

**✅ DO**: Use preview mode for shape tools
```javascript
needsPreview() {
    return true; // For tools like Line, Rectangle, Ellipse
}

onDrawContinue(x, y, pixelData, context) {
    // Restore original data
    this.restorePreviewData(pixelData);

    // Draw preview shape
    this.drawShape(x, y, pixelData, context);

    return true;
}
```

**✅ DO**: Log appropriately
```javascript
this.logger.debug?.('Detailed debug info');
this.logger.info?.('General info');
this.logger.warn?.('Warning message');
this.logger.error?.('Error occurred', error);
```

**Example Tools:**
- **Simple tool**: See `js/tools/implementations/PencilTool.js`
- **Size-aware tool**: See `js/tools/implementations/BrushTool.js`
- **Shape tool**: See `js/tools/implementations/RectangleTool.js`
- **Fill algorithm**: See `js/tools/implementations/FillTool.js`

---

## Data Format

### Pixel Data String Format

**Standard Format:**
```
WxH:DATA
```

Example: `16x16:0000001111112222...`
- `16x16` = dimensions (width × height)
- `0000001111...` = pixel data (Base64 characters)
- Each character represents one pixel color (0-63)

**Compressed Format (RLE):**
```
WxH:RLE:COMPRESSED_DATA
```

Example: `16x16:RLE:020010311005...`
- `RLE` = marker for compressed data
- `02001031` = count+char pairs (02='0'×2, 00='0'×0 padding, 10='3'×10, 11='1'×11)
- Always 2-digit count + 1-char color

**Decompression:**
```javascript
import Compression from './compression.js';

if (Compression.isCompressed(dataString)) {
    const decompressed = Compression.decompress(dataString);
    // Now: "16x16:0000111111111..."
}
```

### Base64 Color Encoding

- **64 colors** mapped to Base64 characters: `0-9A-Za-z+/`
- Index 0 → '0' → Transparent
- Index 1 → '1' → Black (#000000)
- Index 2 → '2' → White (#FFFFFF)
- Index 63 → '/' → Peach (#FFDAB9)

**See**: `config/colors.js` for full palette

---

## Adding Custom Colors

### Modify Color Palette

Edit `config/colors.js`:

```javascript
const ColorConfig = {
    base64Chars: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/',
    palette: [
        {
            index: 0,
            char: '0',
            color: 'transparent',
            name: 'Transparent',
            category: 'special'
        },
        {
            index: 1,
            char: '1',
            color: '#000000',
            name: 'Black',
            category: 'basic'
        },
        // ... add your custom colors
        // IMPORTANT: Must have exactly 64 colors total
    ]
};
```

**Rules:**
- ✅ **MUST** have exactly 64 colors
- ✅ Each `index` must match its array position (0-63)
- ✅ Each `char` must be unique
- ✅ Each `color` must be valid CSS color (hex or keyword)
- ✅ Index 0 should be transparent
- ✅ `char` must match `base64Chars[index]`

**Validation:**
- ConfigLoader validates palette on app init
- Invalid config → error alert and app stops

---

## Security Guidelines

### Input Validation

**✅ DO**: Validate all user input

```javascript
// Canvas dimensions
const validation = validationUtils.validateCanvasDimensions(width, height);
if (!validation.valid) {
    return; // Don't proceed with invalid input
}

// Coordinates
if (!ToolHelpers.validateCoordinates(x, y, pixelData)) {
    return; // Out of bounds
}

// File names
const fileName = userInput.trim();
if (fileName.length > 100 || !/^[a-zA-Z0-9_\-\.]+$/.test(fileName)) {
    await Dialogs.alert('Invalid Name', 'File name contains invalid characters.');
    return;
}
```

### XSS Prevention

**❌ DON'T**: Use innerHTML with user content
```javascript
// ❌ BAD: XSS vulnerability
element.innerHTML = userFileName;

// ✅ GOOD: Use textContent
element.textContent = userFileName;
```

**✅ DO**: Sanitize before rendering
```javascript
// For structured content, create elements programmatically
const item = document.createElement('div');
item.className = 'file-item';

const name = document.createElement('div');
name.textContent = file.name; // Safe - no HTML parsing
item.appendChild(name);
```

### LocalStorage Safety

**✅ DO**: Handle quota exceeded
```javascript
try {
    StorageUtils.setJSON(STORAGE_KEY, data);
} catch (error) {
    if (StorageUtils.isQuotaExceeded()) {
        await Dialogs.alert('Storage Full', 'Please delete some files.');
    }
}
```

**✅ DO**: Check storage availability
```javascript
if (!StorageUtils.isStorageAvailable()) {
    await Dialogs.alert('Storage Unavailable', 'Browser may be in private mode.');
    return false;
}
```

### Safe Operations

- ✅ Confirm before destructive actions (clear canvas, delete file)
- ✅ Warn before closing unsaved tabs
- ✅ Validate file data before importing
- ✅ Handle malformed data gracefully

---

## Testing Guidelines

### Manual Testing Checklist

Run this checklist before committing major changes:

```bash
# 1. Build the project
npm run build

# 2. Open built file in browser
open docs/index.html  # macOS
# or: start docs/index.html  # Windows

# 3. Test core features:
```

**Drawing Tools:**
- [ ] Brush tool (all sizes: 1, 2, 3, 5)
- [ ] Pencil tool
- [ ] Eraser tool
- [ ] Line tool
- [ ] Rectangle tool (fill & stroke modes)
- [ ] Ellipse tool (fill & stroke modes)
- [ ] Fill tool (bucket)
- [ ] Hand tool (pan)

**Selection Tools:**
- [ ] Select tool (rectangular selection)
- [ ] Magic Wand tool (color-based selection)
- [ ] Move tool (move selected pixels)
- [ ] Copy/paste selection
- [ ] Delete selection (Backspace/Delete)
- [ ] Clear selection (Escape)

**File Operations:**
- [ ] Create new file (various sizes: 8×8, 16×16, 32×32, 64×64)
- [ ] Save to LocalStorage
- [ ] Load from LocalStorage
- [ ] Delete file
- [ ] Export as .txt
- [ ] Export as PNG (1×, 5×, 10×, 20× scales)
- [ ] Copy to clipboard
- [ ] Import from string

**History:**
- [ ] Undo (Ctrl+Z) - test multiple levels
- [ ] Redo (Ctrl+Y) - test multiple levels
- [ ] Undo/Redo UI button states update correctly

**UI Features:**
- [ ] Multi-tab functionality (create, switch, rename, close)
- [ ] Tab dirty state indicator (●)
- [ ] Canvas resize (various sizes, confirm dialog if has content)
- [ ] Color palette selection
- [ ] Zoom in/out (mouse wheel, UI buttons)
- [ ] Pan canvas (Space + drag, Hand tool)
- [ ] Grid toggle (G key)
- [ ] Autosave indicator (saves, timestamps)
- [ ] Context menus (canvas, palette, tabs, files)

**Welcome Screen:**
- [ ] Shows on first load (no autosaved tabs)
- [ ] "Create New" button opens new file dialog
- [ ] "Open File" button shows file grid (if files exist)
- [ ] Returns to welcome screen when last tab closed

**Keyboard Shortcuts:**
- [ ] Tool shortcuts (B=Brush, P=Pencil, E=Eraser, L=Line, R=Rectangle, etc.)
- [ ] Ctrl+N - New file
- [ ] Ctrl+S - Save
- [ ] Ctrl+O - Load
- [ ] Ctrl+Z - Undo
- [ ] Ctrl+Y / Ctrl+Shift+Z - Redo
- [ ] G - Toggle grid
- [ ] Escape - Clear selection

**Browser Compatibility:**
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest, if on macOS)

**Edge Cases:**
- [ ] Very small canvas (2×2)
- [ ] Very large canvas (128×128)
- [ ] Fill tool on large canvas (performance)
- [ ] LocalStorage quota exceeded
- [ ] Malformed import data

### Debugging

**Enable Debug Logging:**
```javascript
// In browser DevTools console:
logger.setLevel('debug');

// Check EventBus activity
eventBus.getStats();
// Returns: { totalEvents: 5, totalListeners: 12, events: {...} }

// Check tool registry
ToolRegistry.getStats();
// Returns: { totalTools: 11, currentToolId: 'brush', toolIds: [...] }

// Check history
History.getStats();
// Returns: { undoCount: 5, redoCount: 0, maxHistory: 50 }

// Export logs
logger.exportLogs();
// Returns formatted log string
```

**Common Issues & Solutions:**

| Issue | Cause | Solution |
|-------|-------|----------|
| Build fails | Outdated dependencies | `npm install` |
| Canvas not rendering | Missing DOM element | Check `index.html` for `id="pixelCanvas"` |
| Config validation error | Invalid colors/constants | Review `config/colors.js` and `config/constants.js` |
| Autosave not working | localStorage disabled | Enable localStorage in browser settings |
| Tools not responding | ToolRegistry not initialized | Check initialization order in `main.js` |
| Import fails | Malformed data string | Validate format: `WxH:DATA` or `WxH:RLE:DATA` |

---

## Deployment

### Option 1: GitHub Pages

1. Build the project:
```bash
npm run build
```

2. Commit the `docs/` folder:
```bash
git add docs/
git commit -m "build: Update production build"
git push origin main
```

3. Enable GitHub Pages:
- Go to repo Settings → Pages
- Source: Deploy from a branch
- Branch: `main`
- Folder: `/docs`
- Save

4. Access at: `https://username.github.io/inline.px/`

### Option 2: Netlify

**Drag and Drop:**
1. Build: `npm run build`
2. Drag `docs/` folder to Netlify

**Git Integration:**
1. Connect repo to Netlify
2. Build command: `npm run build`
3. Publish directory: `docs`

### Option 3: Vercel

1. Connect repo to Vercel
2. Build command: `npm run build`
3. Output directory: `docs`

### Option 4: Offline Use

The built file works completely offline:
```bash
npm run build
open docs/index.html  # Works without web server
```

---

## Quick Reference Commands

### Code Navigation

```bash
# Find a tool implementation
find js/tools/implementations -name "*Tool.js"

# Find core modules
ls js/core/

# Find utility modules
ls js/utils/

# Find all event emissions
rg -n "eventBus.emit" js/

# Find all logger calls
rg -n "logger\.(info|warn|error|debug)" js/

# Find tool configurations
rg -n "static CONFIG" js/tools/implementations/

# Find JSDoc typedefs
rg -n "@typedef" js/
```

### File Patterns

```bash
# Find specific patterns
rg -n "export default" js/        # All module exports
rg -n "addEventListener" js/       # Event listeners
rg -n "async function" js/         # Async functions
rg -n "class.*extends" js/         # Class inheritance
```

---

## Common Workflows

### Adding a New Feature

1. **Create feature branch:**
```bash
git checkout -b feature/my-feature
```

2. **Implement feature:**
   - Create new module or modify existing
   - Add JSDoc comments
   - Use EventBus for cross-module communication
   - Update CLAUDE.md if architecture changes

3. **Manual testing:**
```bash
npm run dev  # Test in dev server
npm run build  # Test built version
open docs/index.html
```

4. **Commit changes:**
```bash
git add .
git commit -m "feat: Add my feature

- Detailed description
- Additional notes

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

5. **Update CLAUDE.md (if needed):**
```bash
# Edit CLAUDE.md to document new patterns/modules
git add CLAUDE.md
git commit -m "docs: Update CLAUDE.md for new feature

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

6. **Push and create PR:**
```bash
git push origin feature/my-feature
# Create PR on GitHub
```

### Fixing a Bug

1. **Create fix branch:**
```bash
git checkout -b fix/bug-description
```

2. **Fix bug:**
   - Identify root cause
   - Implement fix
   - Test thoroughly

3. **Commit:**
```bash
git add .
git commit -m "fix: Fix bug description

- Explain what was wrong
- Explain how fix works

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

4. **Test and push:**
```bash
npm run build
# Manual testing
git push origin fix/bug-description
```

### Refactoring Code

1. **Create refactor branch:**
```bash
git checkout -b refactor/component-name
```

2. **Refactor:**
   - Extract common code into utilities
   - Improve naming
   - Add documentation
   - **Do NOT change functionality**

3. **Verify no regression:**
```bash
npm run build
# Full manual testing checklist
```

4. **Commit:**
```bash
git add .
git commit -m "refactor: Extract common logic into utility

- No functional changes
- Improved readability

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

---

## Specialized Context

When working in specific directories, refer to relevant code:

### Frontend Canvas Work
- **Main controller**: `js/canvas/PixelCanvas.js`
- **Rendering**: `js/canvas/CanvasRenderer.js`
- **Data management**: `js/canvas/PixelData.js`
- **Events**: `js/canvas/CanvasEvents.js`
- **Selection overlay**: `js/canvas/SelectionOverlay.js`

### Tool Development
- **Base class**: `js/tools/BaseTool.js`
- **Registry**: `js/tools/ToolRegistry.js`
- **Examples**: `js/tools/implementations/`
- **Mixins**: `js/tools/mixins/`

### UI Components
- **Tabs**: `js/tabManager.js`
- **Dialogs**: `js/dialogs.js`
- **File operations**: `js/fileManager.js`
- **Color palette**: `js/colorPalette.js`
- **Context menus**: `js/contextMenu.js`

### System Features
- **Undo/Redo**: `js/history.js`
- **Autosave**: `js/autosave.js`
- **Compression**: `js/compression.js`
- **PNG export**: `js/pngExport.js`

---

## Contributing Guidelines

### Code Style

- Use **ES6+ features** (arrow functions, destructuring, template literals)
- Add **JSDoc comments** for all public functions and classes
- Keep **files under 500 lines** (split if larger)
- Use **logger** instead of `console.log`
- Follow **existing naming conventions**:
  - Functions: `camelCase` (`createNewTab`)
  - Classes: `PascalCase` (`BaseTool`)
  - Constants: `UPPER_SNAKE_CASE` (`MAX_HISTORY`)
  - Private methods: prefix with `_` or mark with `@private`

### Commit Message Format

See **Git Workflow** section above for detailed examples.

**Summary:**
- Use Conventional Commits format
- Include emoji: 🤖 Generated with Claude Code
- Be descriptive in body
- Reference issues if applicable

### Pull Request Process

1. **Create descriptive PR title:**
   - `feat: Add context menu system`
   - `fix: Fix canvas zoom calculation`
   - `refactor: Simplify tool event handling`

2. **Include in PR description:**
   - What changed
   - Why it changed
   - How to test
   - Screenshots/GIFs if UI change

3. **Checklist:**
   - [ ] Code follows style guidelines
   - [ ] JSDoc comments added/updated
   - [ ] Manual testing completed
   - [ ] Build succeeds (`npm run build`)
   - [ ] CLAUDE.md updated (if needed)
   - [ ] No console errors in browser

---

## Resources

### Internal Documentation
- **README.md** - User-facing documentation
- **DEVELOPMENT_PLAN.md** - Project roadmap
- **generate-claude.md** - Template for this file
- **js/types.js** - JSDoc type definitions

### External Links
- [Vite Documentation](https://vitejs.dev/)
- [MDN: LocalStorage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage)
- [MDN: Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)
- [JSDoc Specification](https://jsdoc.app/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

## FAQ

**Q: Why ES6 modules instead of TypeScript?**
A: Zero-dependency, no build step for development, works in modern browsers natively. JSDoc provides type safety without compilation overhead.

**Q: Why single-file build?**
A: Portable, works offline, easy to deploy/share, no server required.

**Q: Why LocalStorage instead of backend?**
A: Zero server costs, privacy-first (data never leaves browser), works offline.

**Q: How to add more than 64 colors?**
A: Not possible with current Base64 encoding. Would require format change (breaking change).

**Q: Why no automated tests?**
A: Currently manual testing only. Future: Add Vitest for unit tests, Playwright for E2E.

**Q: How to add new keyboard shortcuts?**
A: Add to `setupKeyboardShortcuts()` in `js/main.js`. Tool shortcuts auto-registered from `CONFIG.shortcut`.

**Q: Can I use this commercially?**
A: Yes, MIT license. See LICENSE file.

---

## Version History

**Current**: v1.0.0 (Initial release)

**Features:**
- 11 drawing tools (Brush, Pencil, Eraser, Line, Rectangle, Ellipse, Fill, Select, Magic Wand, Move, Hand)
- 64-color Base64 palette
- Multi-tab workspace
- Undo/Redo (50 states)
- Autosave (30s interval)
- LocalStorage persistence
- Export: .txt, PNG (1×-20×), clipboard
- RLE compression
- Zoom & Pan
- Grid toggle
- Context menus
- Welcome screen
- Single-file build (~34KB gzipped)

---

**Made with ❤️ for pixel artists and developers**

*This CLAUDE.md was generated following the template in generate-claude.md and is the authoritative source for development guidelines.*
