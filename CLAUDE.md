# CLAUDE.md - AI Development Guide for Inline.px

This document provides context and guidance for AI assistants (Claude Code, GitHub Copilot, etc.) working on the Inline.px project.

---

## 🎯 Project Overview

**Inline.px** is a browser-based pixel art editor built with vanilla JavaScript and ES6 modules. The application compiles to a single HTML file (~128KB, gzipped: 34KB) using Vite and runs entirely client-side with zero backend dependencies.

**Key Characteristics:**
- **Modular Architecture**: 43+ ES6 modules with clear separation of concerns
- **Type Safety**: JSDoc TypeDefs for IntelliSense without TypeScript compilation
- **Event-Driven**: EventBus for decoupled inter-module communication
- **Config Validation**: Runtime validation for all configuration files
- **Single-File Build**: Vite + vite-plugin-singlefile for distribution

---

## 🏗️ Architecture Overview

### Module Organization

```
js/
├── main.js                      # Application entry point
├── types.js                     # Global JSDoc type definitions
│
├── core/                        # Core systems (8 modules)
│   ├── EventBus.js              # Event-driven communication
│   ├── Logger.js                # Logging system with levels
│   ├── ConfigLoader.js          # ES module config loader
│   └── ...
│
├── canvas/                      # Canvas rendering (5 modules)
│   ├── PixelCanvas.js           # Main canvas controller
│   ├── CanvasRenderer.js        # Drawing operations
│   ├── CanvasInputHandler.js   # Mouse/touch input
│   └── ...
│
├── tools/                       # Drawing tools (15+ modules)
│   ├── BaseTool.js              # Base tool class (379 lines)
│   ├── ToolRegistry.js          # Tool management (325 lines)
│   ├── ToolStateManager.js      # Shared state management
│   ├── ToolDrawingProxy.js      # Drawing delegation
│   ├── mixins/                  # Tool composition
│   │   ├── ToolHelpers.js       # Helper functions
│   │   ├── ToolSelectionMixin.js # Selection support
│   │   └── ToolEventMixin.js    # Event handling
│   ├── PenTool.js               # Pen implementation
│   ├── LineTool.js              # Line tool
│   └── ...
│
├── dialogs/                     # Dialog system (3 modules)
│   ├── DialogCore.js            # Core dialog functionality
│   ├── DialogHelpers.js         # Utility functions
│   └── ExportDialog.js          # Export dialog (232 lines)
│
├── utils/                       # Utility modules (5 modules)
│   ├── StorageUtils.js          # localStorage wrapper
│   ├── ConfigValidator.js       # Config validation
│   └── ...
│
├── fileManager.js               # File operations (403 lines)
├── tabManager.js                # Multi-tab interface (473 lines)
├── autosave.js                  # Autosave system
├── viewport.js                  # Zoom & pan
├── colorPalette.js              # Color management
├── compression.js               # RLE compression
└── History.js                   # Undo/redo
```

---

## 🔑 Key Design Patterns

### 1. Mixin Pattern (BaseTool)

BaseTool uses composition over inheritance:

```javascript
import { withEvents } from './mixins/ToolEventMixin.js';
import { withSelection } from './mixins/ToolSelectionMixin.js';

// Compose mixins
class BaseTool extends withEvents(withSelection(BaseToolCore)) {
    // Tool implementation
}
```

### 2. Delegation Pattern (ToolRegistry)

ToolRegistry delegates to specialized modules:

```javascript
const ToolRegistry = {
    // State management delegated
    setToolOption: StateManager.setToolOption,
    getToolOption: StateManager.getToolOption,

    // Drawing operations delegated
    startDrawing: DrawingProxy.startDrawing,
    continueDrawing: DrawingProxy.continueDrawing
};
```

### 3. Facade Pattern (Dialogs)

Dialogs provides a clean API wrapping complex dialog logic:

```javascript
// Simple API
await Dialogs.alert('Title', 'Message', 'success');
const confirmed = await Dialogs.confirm('Title', 'Message');
const value = await Dialogs.prompt('Title', 'Message', 'default');

// Complex logic hidden in DialogCore
```

### 4. Event-Driven Architecture

EventBus enables decoupled communication:

```javascript
// Module A emits event
eventBus.emit('canvas:change', { width: 32, height: 32 });

// Module B subscribes
eventBus.on('canvas:change', (data) => {
    console.log('Canvas changed:', data);
});
```

---

## 📦 Data Structures

### Pixel Data Format

**Standard Format:**
```
WxH:DATA
```
Example: `16x16:0000111122223333...` (256 characters)

**Compressed Format (RLE):**
```
WxH:RLE:COMPRESSED_DATA
```
Example: `16x16:RLE:1601115012203230...` (count+char pairs)

### Base64 Color System

- **64 colors** mapped to Base64 characters: `0-9A-Za-z+/`
- Each character represents a color index (0-63)
- Index 0: Transparent (`#00000000`)
- Index 1: Black (`#000000`)
- Index 63: White (`#FFFFFF`)

### Common TypeDefs

```javascript
/**
 * @typedef {Object} TabData
 * @property {string} id - Unique tab identifier
 * @property {string} name - Display name
 * @property {number} width - Canvas width
 * @property {number} height - Canvas height
 * @property {string} data - Pixel data string
 * @property {boolean} isDirty - Unsaved changes flag
 * @property {number} created - Creation timestamp
 * @property {number} modified - Last modified timestamp
 */

/**
 * @typedef {Object} ToolConfig
 * @property {string} id - Unique tool identifier
 * @property {string} name - Display name
 * @property {string} icon - SVG path data
 * @property {string} cursor - CSS cursor name
 * @property {string} shortcut - Keyboard shortcut key
 * @property {string} description - Tool description
 * @property {boolean} supportsSelection - Selection support flag
 */

/**
 * @typedef {Object} DrawingContext
 * @property {Array<Array<number>>} pixelData - 2D pixel array
 * @property {number} width - Canvas width
 * @property {number} height - Canvas height
 * @property {number} color - Current color index
 */
```

All TypeDefs are in `js/types.js`.

---

## 🛠️ Common Development Tasks

### Adding a New Tool

See detailed instructions in README.md, section "Creating New Tools".

**Quick steps:**
1. Create `js/tools/MyTool.js` extending `BaseTool`
2. Define `static CONFIG` with tool metadata
3. Implement `onStart()`, `onMove()`, `onEnd()`
4. Register in `js/main.js`: `ToolRegistry.registerTools([..., MyTool])`
5. Add button to `index.html`

### Adding a New Module

```javascript
// 1. Create module file
// js/myModule.js

import logger from './core/Logger.js';

/**
 * MyModule - Description
 *
 * @typedef {Object} MyDataType
 * @property {string} id
 * @property {string} name
 */

let moduleState = null;

function init() {
    logger.info?.('MyModule initialized');
}

const MyModule = {
    init,
    // Export public API
};

export default MyModule;

// 2. Import in main.js
import MyModule from './myModule.js';

// 3. Initialize in init sequence
MyModule.init();
```

### Modifying Configuration

**Colors (`config/colors.js`):**
- Must have exactly 64 colors
- Each color needs: `index`, `char`, `color`, `name`, `category`
- Validated by `ConfigValidator.validateColorsConfig()`

**Constants (`config/constants.js`):**
- Canvas settings: `minSize`, `maxSize`, `defaultWidth`, `defaultHeight`, `minPixelSize`, `maxPixelSize`, `defaultPixelSize`
- History settings: `maxStates`, `debounceTime`
- Autosave settings: `interval`, `debounceTime`
- Validated by `ConfigValidator.validateConstantsConfig()`

**Validation happens at startup** - check browser console for errors.

### Adding JSDoc Types

```javascript
// 1. Add typedef to js/types.js
/**
 * @typedef {Object} MyNewType
 * @property {string} id
 * @property {number} value
 */

// 2. Import in your module
/**
 * @typedef {import('./types.js').MyNewType} MyNewType
 */

// 3. Use in function signatures
/**
 * Process data
 * @param {MyNewType} data - Data to process
 * @returns {boolean} Success flag
 */
function processData(data) {
    // Full IntelliSense support
}
```

---

## 🔍 Code Quality Standards

### File Size Guidelines

- **Optimal**: 150-300 lines per file
- **Maximum**: 400 lines per file
- **Critical**: >500 lines (must be refactored)

**Current largest files:**
- `BaseTool.js`: 379 lines ✅
- `fileManager.js`: 403 lines ✅
- `tabManager.js`: 473 lines ✅

### Coding Conventions

1. **ES6+ Features**: Use arrow functions, destructuring, template literals
2. **JSDoc Comments**: All public functions must have JSDoc
3. **Logger Usage**: Use `logger.debug?.()`, `logger.info?.()`, etc. (never `console.log`)
4. **Optional Chaining**: Always use `?.` for logger methods
5. **Error Handling**: Use try-catch blocks, handle localStorage quota
6. **CSS Classes**: Prefer CSS classes over inline styles
7. **Event Cleanup**: Remove event listeners in destroy/cleanup methods

### Example: Proper Function Documentation

```javascript
/**
 * Create a new tab with specified dimensions
 * @param {string|null} name - Tab name (null for auto-generated)
 * @param {number} width - Canvas width in pixels
 * @param {number} height - Canvas height in pixels
 * @param {string|null} data - Optional pixel data string
 * @returns {TabData} Created tab object
 */
function createNewTab(name = null, width = 16, height = 16, data = null) {
    // Validate inputs
    if (width < 2 || height < 2) {
        logger.error?.('Invalid canvas dimensions');
        return null;
    }

    // Implementation
    const tab = {
        id: generateId(),
        name: name || `Untitled-${++tabCounter}`,
        width,
        height,
        data: data || generateEmptyData(width, height),
        isDirty: false,
        created: Date.now(),
        modified: Date.now()
    };

    logger.info?.(`Tab created: ${tab.name}`);
    return tab;
}
```

---

## 🚀 Build & Development

### Development Commands

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev

# Build for production (output: docs/index.html)
npm run build

# Preview build locally
npm run preview
```

### Build Configuration

**vite.config.js:**
```javascript
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
    plugins: [viteSingleFile()],
    build: {
        outDir: 'docs',
        assetsInlineLimit: 100000000
    }
});
```

**Important**: The build output (`docs/index.html`) is a single, self-contained HTML file that includes all CSS and JS inline.

### Testing Before Commit

```bash
# 1. Build the project
npm run build

# 2. Check build output
ls -lh docs/index.html

# 3. Open in browser
open docs/index.html

# 4. Test core features
# - Draw with tools
# - Undo/Redo
# - Multi-tab workflow
# - Save/Load
# - Export
# - Zoom/Pan
```

---

## 🐛 Common Issues & Solutions

### Issue: Build fails with module resolution error

**Cause**: Missing or incorrect import path

**Solution**: Ensure all imports use `.js` extension
```javascript
// ✅ Correct
import logger from './core/Logger.js';

// ❌ Wrong
import logger from './core/Logger';
```

### Issue: Config validation error on startup

**Cause**: Invalid `colors.js` or `constants.js`

**Solution**: Check browser console for specific validation errors. Common issues:
- Wrong number of colors (must be 64)
- Missing required properties
- Invalid property types

### Issue: Tool not registering

**Cause**: Missing `static CONFIG` or not imported in `main.js`

**Solution**:
1. Verify tool has `static CONFIG` property
2. Import tool in `main.js`
3. Add to `ToolRegistry.registerTools()` array

### Issue: Memory leak with event listeners

**Cause**: Event listeners not removed on cleanup

**Solution**: Track and remove listeners:
```javascript
function showDialog() {
    // Store handler references
    const closeHandler = () => { /* ... */ };

    // Add listeners
    button.addEventListener('click', closeHandler);

    // Remove on cleanup
    button.removeEventListener('click', closeHandler);
}
```

### Issue: localStorage quota exceeded

**Cause**: Too many saved files or large canvas sizes

**Solution**: Use `StorageUtils.isQuotaExceeded()` to detect and handle:
```javascript
if (!StorageUtils.setJSON(key, data)) {
    if (StorageUtils.isQuotaExceeded()) {
        await Dialogs.alert('Storage Full', 'Please delete some files.');
    }
}
```

---

## 📋 Refactoring History

### Completed Refactorings

**Phase 1: Large File Splitting**
- `BaseTool.js`: 619 → 379 lines (-38.8%)
  - Created mixins: `ToolHelpers.js`, `ToolSelectionMixin.js`, `ToolEventMixin.js`
- `dialogs.js`: 476 → 180 lines (-62.2%)
  - Split into: `DialogCore.js`, `DialogHelpers.js`, `ExportDialog.js`
- Created `StorageUtils.js` for localStorage abstraction

**Phase 2: Tool System Refactoring**
- `ToolRegistry.js`: 485 → 325 lines (-33%)
  - Created: `ToolStateManager.js`, `ToolDrawingProxy.js`
- Created `utilities.css` with 50+ utility classes
- Migrated 36% of inline styles to CSS classes

**Phase 3: Type Safety & Validation**
- Created `types.js` with 14 global TypeDefs
- Added JSDoc to 9 core modules
- Created `ConfigValidator.js` for runtime validation
- Integrated validation into `ConfigLoader.js`

**Phase 4 & 5: Polish & Coverage**
- Migrated remaining inline styles in `main.js`
- Improved event listener cleanup in `fileManager.js`
- Extended TypeDef coverage to 6 additional modules

**Current Status:**
- ✅ No files >500 lines
- ✅ All core modules have TypeDefs
- ✅ Config validation active
- ✅ Clean event listener management
- ✅ Minimal inline styles (only dynamic values)

---

## 🎯 Future Enhancement Ideas

### Priority: High
- [ ] Add PNG import functionality
- [ ] Implement layer system
- [ ] Add custom keyboard shortcuts
- [ ] Create tool presets system

### Priority: Medium
- [ ] Add animation/frame support
- [ ] Implement symmetry drawing modes
- [ ] Add grid overlay options
- [ ] Create color palette import/export

### Priority: Low
- [ ] Add brush texture support
- [ ] Implement gradient fill tool
- [ ] Add SVG export option
- [ ] Create plugin system for extensions

---

## 📚 Useful References

### Documentation
- **README.md**: User-facing documentation with quick start guide
- **js/types.js**: All TypeDef definitions
- **config/**: Configuration file examples

### External Resources
- [Vite Documentation](https://vitejs.dev/)
- [JSDoc Reference](https://jsdoc.app/)
- [MDN Web APIs](https://developer.mozilla.org/en-US/docs/Web/API)

---

## 🤖 Tips for AI Assistants

### When Modifying Code

1. **Always read files before editing** - Don't guess file contents
2. **Use JSDoc TypeDefs** - Check `types.js` for existing types
3. **Follow naming conventions** - Analyze existing code patterns
4. **Test builds** - Run `npm run build` after changes
5. **Check browser console** - Config validation runs on startup

### When Creating New Features

1. **Check existing patterns** - Look for similar implementations
2. **Add TypeDefs** - Document all new data structures
3. **Use EventBus** - Prefer events over direct coupling
4. **Handle errors gracefully** - Use try-catch and logger
5. **Keep files small** - Split if approaching 400 lines

### When Refactoring

1. **Identify dependencies** - Use grep to find all usages
2. **Maintain backward compatibility** - Don't break existing APIs
3. **Test incrementally** - Build and test after each change
4. **Update documentation** - Modify this file if architecture changes
5. **Preserve types** - Maintain or improve JSDoc coverage

---

**Last Updated**: 2025-12-03
**Architecture Version**: 5.0 (Post-refactoring)
**Module Count**: 43+ modules
**Largest File**: 473 lines (tabManager.js)
**TypeDef Coverage**: ~21% (9/43 modules)
