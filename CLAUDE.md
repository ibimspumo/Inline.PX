# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Inline.px is a browser-based pixel art editor that generates ultra-compact text strings using Base64 encoding. It consists of:
1. **Editor Application** (`index.html` + modular JS/CSS) - Professional pixel art creation tool
2. **Standalone Library** (`inline-px.js`) - Drop-in Web Component for rendering pixel art anywhere

**Version 2.0** features a complete architectural refactoring with modular tool system, JSON-based configuration, and event-driven architecture. See `CLAUDE_REFACTORING.md` for detailed documentation.

## Development Setup

**No build process, no dependencies, no server required.**

⚠️ **IMPORTANT:** Serve via HTTP server (not `file://`) for JSON config loading:
```bash
python3 -m http.server 8000
# Then open http://localhost:8000
```

For testing the standalone library integration, open `example.html`.

## Core Architecture

### Data Format Specification

**Critical: This is the heart of the project.**

Pixel art is stored as text strings in two formats:

#### Standard Format
```
WxH:DATA
```
- `W` = Width (2-128 pixels)
- `H` = Height (2-128 pixels)
- `DATA` = Exactly W×H Base64 characters (0-9, A-Z, a-z, +, /)

Each character represents one pixel mapped to a 64-color palette:
- `0` = Transparent
- `1-9, A-Z, a-z, +, /` = 63 colors

Example: `8x8:0000000001101100133133101531015310013314013160140` (64 chars for 8×8 grid)

#### RLE Compressed Format
```
WxH:RLE:COMPRESSED_DATA
```

**CRITICAL RLE Encoding Rules:**
- Fixed 2-digit COUNT + 1 CHAR format (exactly 3 bytes per run)
- `CCCHAR` where `CC` = zero-padded 2-digit count (01-99), `CHAR` = Base64 character
- Maximum run length: 99
- Runs longer than 99 are split into multiple runs

**Examples:**
- `03a` = "aaa" (3×'a')
- `15B` = "BBBBBBBBBBBBBBB" (15×'B')
- `01x` = "x" (1×'x')

**Why Fixed-Width Format:**
The fixed 2-digit format eliminates parsing ambiguity. The parser reads exactly 2 digits as COUNT, then exactly 1 character as CHAR, then advances exactly 3 positions. There is no ambiguity about where runs start/end.

**Example:** `991991581` decompresses to:
1. Position 0-2: `991` → 99×'1'
2. Position 3-5: `991` → 99×'1'
3. Position 6-8: `581` → 58×'1'
Total: 256 characters (16×16 grid)

**Decompression Algorithm (MUST use this approach):**
```javascript
while (i < compressed.length) {
    if (i + 2 < compressed.length) {
        const countStr = compressed.substring(i, i + 2); // Exactly 2 digits
        const count = parseInt(countStr);
        const char = compressed[i + 2]; // Exactly 1 char
        decompressed += char.repeat(count);
        i += 3; // Always advance by exactly 3
    } else {
        break; // Malformed data
    }
}
```

### Module System

The editor uses **vanilla JavaScript IIFE modules** with explicit public APIs. No bundler, no imports.

**Load Order Matters** (see `index.html`):
```html
<script src="js/dialogs.js"></script>        <!-- Must load first (used by all) -->
<script src="js/compression.js"></script>     <!-- Needed before canvas -->
<script src="js/pngExport.js"></script>
<script src="js/colorPalette.js"></script>    <!-- Core palette system -->
<script src="js/tools.js"></script>           <!-- Drawing tools -->
<script src="js/canvas.js"></script>          <!-- Depends on Tools + ColorPalette -->
<script src="js/fileManager.js"></script>
<script src="js/tabManager.js"></script>
<script src="js/autosave.js"></script>
<script src="js/viewport.js"></script>
<script src="js/history.js"></script>
<script src="js/app.js"></script>             <!-- Must load last (orchestrates all) -->
```

**Module Communication Pattern:**
```javascript
const ModuleName = (function() {
    'use strict';

    // Private state
    let privateVar = null;

    // Public API
    return {
        publicMethod,
        PUBLIC_CONSTANT
    };
})();
```

Modules communicate through:
1. **Direct calls** - `ColorPalette.getColor(index)`
2. **Callbacks** - `init(containerId, onChangeCallback)`
3. **Global checks** - `if (Compression) { ... }` for optional modules

### Key Module Responsibilities

**ColorPalette** (`js/colorPalette.js`)
- Manages the 64-color Base64 palette
- Maps indices (0-63) ↔ Base64 chars (0-9A-Za-z+/) ↔ hex colors
- `BASE64_CHARS` constant used throughout for encoding/decoding

**Tools** (`js/tools.js`)
- Implements 11 Photoshop-style tools (Brush, Line, Rectangle, Fill, etc.)
- Maintains tool state: current tool, brush size, shape mode
- Drawing operations modify `pixelData` 2D array directly
- **Selection Persistence:** Selection stays active across tool switches (users can select an area then use any tool within it)

**PixelCanvas** (`js/canvas.js`)
- Renders `pixelData` (2D array of color indices) to HTML canvas
- Handles mouse/touch events, delegates to Tools module
- Manages zoom/pan integration with Viewport module
- Import/export using Base64 format with RLE support
- **Selection Overlay:** Separate canvas layer for pixel-perfect selection visualization

**Compression** (`js/compression.js`)
- RLE compression/decompression with fixed 2-digit COUNT format
- `compress()` returns stats: savings percentage, original/compressed sizes
- `smartCompress()` only compresses if beneficial (file size reduction)

**History** (`js/history.js`)
- Undo/redo system with stack-based state management
- Stores canvas data strings (WxH:DATA format)
- Debounced state saving (500ms) triggered by canvas changes
- Maximum 50 history states

**Dialogs** (`js/dialogs.js`)
- Custom modal system replacing browser `alert()`, `confirm()`, `prompt()`
- Returns Promises for async/await pattern
- Special `exportDialog()` with compression preview and format selection (Copy String, Download TXT, Download PNG)

**TabManager** (`js/tabManager.js`)
- Photoshop-style multi-document interface
- Each tab stores independent canvas state
- LocalStorage integration for tab persistence

**app.js** - Main orchestrator:
- Initializes all modules in correct order
- Wires up event handlers for menu buttons
- Implements keyboard shortcuts (tool shortcuts B/P/E/L/R/O/F/M/W/V/H, Ctrl+Z/Y for undo/redo, etc.)
- Manages canvas change events with debounced history saving

### CSS Architecture

Modular CSS loaded via `style.css`:
```css
@import url('css/variables.css');   /* Design tokens - colors, spacing, fonts */
@import url('css/layout.css');      /* 3-panel Photoshop-style layout */
@import url('css/dialogs.css');     /* Custom modal system */
/* ... 12 total CSS modules */
```

**Layout Structure:**
```
.app-container (flexbox)
├── .toolbox (left sidebar)
├── .workspace (center)
│   ├── .menu-bar (top)
│   ├── .info-bar (tool options)
│   ├── .canvas-container (main canvas)
│   └── .export-panel (live preview)
└── .properties-panel (right sidebar)
```

## Important Implementation Details

### When Modifying the RLE Compression

**NEVER change the fixed 2-digit format.** It's critical for unambiguous parsing. If you need longer runs:
- Keep splitting at 99 (current behavior)
- OR create a new compression format version (e.g., `WxH:RLE2:...`) but maintain backward compatibility

### When Adding New Tools

1. Add to `TOOL_TYPES` constant in `js/tools.js`
2. Add metadata to `TOOL_INFO` object (name, icon, shortcut, options)
3. Implement drawing logic in `startDrawing()`, `continueDrawing()`, `endDrawing()`
4. Add keyboard shortcut in `app.js` event listener
5. Tool icon uses Material Symbols (loaded via Google Fonts CDN)

### When Modifying Color Palette

The palette is **fixed at 64 colors** to match Base64 character set. To change:
1. Update `COLORS` array in `colorPalette.js`
2. Update `COLOR_NAMES` array for tooltips
3. Update palette documentation in README
4. Update `inline-px.js` standalone library to match

**Do NOT change:**
- Base64 character mapping (breaks all existing pixel art)
- Index 0 = transparent (required by format)

### Selection Tool Behavior

The selection tool has specific requirements:
- Selection MUST persist when switching tools (allows using tools within selection)
- Selection cleared only by: Escape key, clicking outside canvas, or explicit clear action
- Selection overlay must align to pixel grid using `Math.floor()` on positions
- Separate overlay canvas prevents z-index issues with main canvas

### History System Integration

Canvas modifications trigger history through debounced callback:
```javascript
// In app.js
clearTimeout(window.historyDebounceTimer);
window.historyDebounceTimer = setTimeout(() => {
    const currentState = PixelCanvas.exportToString();
    History.pushState(currentState, 'Paint');
}, 500); // 500ms debounce
```

**Don't save history for:**
- Every pixel change (too many states)
- Read-only operations (zoom, pan, tool switch)
- Import operations (separate history clear)

### Export Dialog Compression Logic

The export dialog shows compression option with dynamic feedback:
```javascript
// Always show compression checkbox (even if it increases size)
// Auto-check only when beneficial (savings > 0)
<input type="checkbox" ${compressionStats.savings > 0 ? 'checked' : ''} />

// Show warning when compression adds size
<span class="export-savings ${compressionStats.savings > 0 ? '' : 'export-warning'}">
    ${compressionStats.savings > 0 ? 'Save' : 'Adds'} ${Math.abs(compressionStats.savings)}%
</span>
```

## Testing Approach

**Manual testing workflow:**

1. **Format Integrity:** Export → Copy string → Import → Verify identical
2. **RLE Correctness:** Create sprite with long runs (e.g., 16×16 all black = `16x16:RLE:991991581`) → Export with compression → Import → Verify
3. **Tool Behavior:** Test each tool with different brush sizes and modes
4. **History:** Make changes → Undo → Redo → Verify state restoration
5. **Selection:** Select area → Switch tools → Draw within selection → Verify
6. **Standalone Library:** Copy sprite string → Use in `example.html` → Verify rendering

**Common test sprites:**
- All transparent: `8x8:0000000000000000000000000000000000000000000000000000000000000000`
- All black: `8x8:1111111111111111111111111111111111111111111111111111111111111111`
- All black (RLE): `8x8:RLE:641`
- Heart: `8x8:RLE:090021010021020011023011023011010011053011010011053011020011033011040011013011060011040`

## Common Pitfalls

1. **RLE Parsing:** Don't read variable-length counts. Always read exactly 2 digits.
2. **Module Order:** Loading modules out of order causes undefined errors. Follow index.html order.
3. **Color Index vs Char:** Use `ColorPalette.getBase64Char(index)` for export, `ColorPalette.getIndexFromChar(char)` for import.
4. **Canvas Events:** Touch events must preventDefault() to avoid scrolling during drawing.
5. **Selection Overlay:** Must update size when canvas resizes (zoom, resize canvas, etc).
6. **Dialogs:** Use `await Dialogs.confirm()` pattern, not browser `confirm()` which blocks.

## File Organization (v2.0 - Refactored)

```
inline.px/
├── index.html              # Editor (main app entry point)
├── inline-px.js            # Standalone library (Web Component)
├── example.html            # Integration examples
├── CLAUDE_REFACTORING.md   # Detailed refactoring documentation
├── style.css               # CSS module loader
│
├── config/                 # JSON Configuration
│   ├── colors.json         # 64-color palette (user-editable!)
│   └── constants.json      # App-wide constants
│
├── js/                     # Editor modules (modular architecture)
│   ├── core/               # Core infrastructure
│   │   ├── Logger.js       # Unified logging system
│   │   ├── EventBus.js     # Event-driven communication
│   │   └── ConfigLoader.js # JSON configuration loader
│   │
│   ├── utils/              # Utility modules
│   │   ├── ClipboardUtils.js    # Clipboard operations
│   │   ├── ValidationUtils.js   # Input validation
│   │   └── FormatUtils.js       # String formatting
│   │
│   ├── tools/              # Tool system (26 modules total!)
│   │   ├── BaseTool.js     # Abstract base class (600+ lines)
│   │   ├── ToolRegistry.js # Dynamic tool management
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
│   │
│   ├── canvas/             # Canvas system (split into 5 modules)
│   │   ├── PixelData.js    # Data management
│   │   ├── CanvasRenderer.js    # Rendering engine
│   │   ├── CanvasEvents.js      # Event handling
│   │   ├── SelectionOverlay.js  # Selection visualization
│   │   └── PixelCanvas.js       # Orchestrator
│   │
│   ├── app.js              # Main controller (refactored)
│   ├── colorPalette.js     # JSON-based palette (refactored)
│   ├── compression.js      # RLE compression
│   ├── dialogs.js          # Modal system
│   ├── history.js          # Undo/redo
│   ├── fileManager.js      # Save/load
│   ├── tabManager.js       # Multi-tab
│   ├── autosave.js         # Auto-saving
│   ├── viewport.js         # Zoom/pan
│   └── pngExport.js        # PNG export
│
└── css/                    # Modular stylesheets (unchanged)
    ├── variables.css
    ├── layout.css
    └── ...                 # 12 total CSS modules
```

**Old monolithic files** (kept as `_old.js` for reference):
- `js/tools_old.js` (696 lines → 11 separate files)
- `js/canvas_old.js` (595 lines → 5 separate modules)
- `js/colorPalette_old.js` (hardcoded → JSON-based)
- `js/app_old.js` (761 lines → modern architecture)

## Integration Guide

For developers using `inline-px.js` in their projects:

```html
<!-- Include library -->
<script src="inline-px.js"></script>

<!-- Use custom element -->
<inline-px
    data="8x8:RLE:090021010021020011023011023..."
    scale="8"
    alt="Heart sprite"
></inline-px>
```

The Web Component:
- Registers `<inline-px>` custom element
- Handles both standard and RLE formats automatically
- Renders to data URL (no external image requests)
- Shadow DOM prevents style conflicts
- Attributes trigger re-render on change

## Language and Culture

The project uses German in some user-facing areas (commit messages may contain German). When continuing work:
- Keep English for all code, comments, and documentation
- German is acceptable in commit messages or user communication
- README is in English (developer-focused documentation)
