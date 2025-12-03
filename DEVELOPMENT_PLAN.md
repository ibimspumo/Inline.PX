# Development Plan - Inline.px

**Last Updated**: 2025-12-03
**Status**: Production-Ready

---

## 🎯 Current Status

**Architecture**: Fully refactored and modernized
**Build**: Single-file HTML (128KB, gzipped: 34KB)
**Modules**: 43+ ES6 modules
**Type Coverage**: ~21% (9/43 modules with JSDoc)
**Code Quality**: All files <500 lines ✅

---

## ✅ Completed Work

### Phase 1-5: Complete Refactoring (DONE)
- ✅ Split large files (BaseTool, dialogs, ToolRegistry)
- ✅ Created StorageUtils for localStorage management
- ✅ Implemented mixin pattern for tools
- ✅ Added JSDoc TypeDefs to core modules
- ✅ Created ConfigValidator for runtime validation
- ✅ Migrated inline styles to CSS classes
- ✅ Improved event listener cleanup
- ✅ Extended TypeDef coverage to 9 modules

---

## 📋 Remaining Improvements

### 🔴 Priority: High

#### 1. Extend TypeDef Coverage
**Goal**: Add JSDoc TypeDefs to remaining modules

**Modules needing TypeDefs (34 remaining):**
- `js/canvas/` modules (PixelCanvas, CanvasRenderer, etc.)
- `js/tools/` individual tool classes (PenTool, LineTool, etc.)
- `js/core/` modules (EventBus, Logger, etc.)

**Steps:**
1. Create TypeDefs for each module's data structures
2. Add function parameter and return type annotations
3. Import relevant types from `js/types.js`

**Benefits:**
- Better IntelliSense support
- Fewer runtime errors
- Improved refactoring safety

---

#### 2. Add Unit Tests
**Goal**: Implement testing framework for core functionality

**Testing Framework Options:**
- Vitest (recommended - Vite integration)
- Jest
- Mocha + Chai

**Critical Modules to Test:**
- `compression.js` - RLE compression/decompression
- `colorPalette.js` - Base64 color conversions
- `StorageUtils.js` - localStorage operations
- `ConfigValidator.js` - Config validation logic
- `History.js` - Undo/redo stack management

**Setup Steps:**
1. Install testing framework: `npm install -D vitest`
2. Create `tests/` directory
3. Write tests for core utilities
4. Add test command to `package.json`
5. Set up GitHub Actions for CI

---

#### 3. PNG Import Functionality
**Goal**: Allow users to import PNG files and convert to pixel art

**Implementation:**
1. Create `js/importers/PNGImporter.js`
2. Use Canvas API to read PNG data
3. Implement color quantization to 64-color palette
4. Add dithering options (optional)
5. Create import dialog with preview
6. Add file input handler in main.js

**UI Changes:**
- Add "Import PNG" button to menu
- Create import dialog with:
  - File picker
  - Preview canvas
  - Size adjustment options
  - Color quantization settings

---

### 🟡 Priority: Medium

#### 4. Layer System
**Goal**: Support multiple layers for complex artwork

**Features:**
- Layer stack management (add, delete, reorder)
- Layer visibility toggle
- Layer opacity control
- Merge layers functionality
- Background layer lock

**Data Structure:**
```javascript
/**
 * @typedef {Object} Layer
 * @property {string} id
 * @property {string} name
 * @property {Array<Array<number>>} pixelData
 * @property {boolean} visible
 * @property {number} opacity (0-1)
 * @property {boolean} locked
 */
```

**Implementation:**
1. Create `js/LayerManager.js`
2. Modify canvas rendering to composite layers
3. Update tool drawing to target active layer
4. Add layer panel UI
5. Update export to flatten layers

---

#### 5. Custom Keyboard Shortcuts
**Goal**: Allow users to customize tool shortcuts

**Implementation:**
1. Create `js/KeyboardManager.js`
2. Load/save shortcuts to localStorage
3. Add shortcut configuration dialog
4. Handle conflicts (warn user)
5. Add reset to defaults option

**UI:**
- Settings dialog with shortcut editor
- Click to record new shortcut
- Conflict detection and warning

---

#### 6. Animation/Frame Support
**Goal**: Create simple sprite animations

**Features:**
- Frame timeline
- Onion skinning
- Play/pause preview
- Export as GIF or sprite sheet
- Frame duration control

**Data Structure:**
```javascript
/**
 * @typedef {Object} Animation
 * @property {string} id
 * @property {string} name
 * @property {Array<Frame>} frames
 * @property {number} fps
 */

/**
 * @typedef {Object} Frame
 * @property {string} id
 * @property {string} data - Pixel data
 * @property {number} duration - Frame duration in ms
 */
```

---

### 🟢 Priority: Low

#### 7. Grid Overlay Options
**Goal**: Add customizable grid overlay

**Features:**
- Toggle grid on/off
- Adjust grid size
- Change grid color
- Grid opacity control

**Implementation:**
- Add grid rendering in `CanvasRenderer.js`
- Create grid settings in viewport module
- Add toggle button to UI

---

#### 8. Symmetry Drawing Modes
**Goal**: Mirror drawing for symmetrical sprites

**Modes:**
- Horizontal symmetry
- Vertical symmetry
- Quad symmetry (both axes)
- Radial symmetry (4, 8, 16 points)

**Implementation:**
1. Create `js/SymmetryManager.js`
2. Modify tool drawing to mirror strokes
3. Add symmetry mode selector to UI
4. Visual indicator for symmetry axis

---

#### 9. Color Palette Import/Export
**Goal**: Share custom color palettes

**Features:**
- Export palette as JSON
- Import palette from JSON
- Load popular palette presets (Pico-8, Game Boy, etc.)
- Create palette from image

**Implementation:**
1. Add export function to `colorPalette.js`
2. Create palette import dialog
3. Add preset palettes to `config/palettes/`
4. Validate imported palettes

---

#### 10. Brush Texture Support
**Goal**: Create custom brush shapes

**Features:**
- Load brush texture from image
- Create brush from selection
- Brush library management
- Brush size scaling

**Implementation:**
1. Create `js/BrushManager.js`
2. Store brush textures in memory
3. Apply texture pattern during drawing
4. Add brush selector UI

---

## 🚀 Future Feature Ideas

### Advanced Features (Backlog)
- [ ] Plugin system for extensions
- [ ] SVG export option
- [ ] Gradient fill tool
- [ ] Perspective/3D projection tools
- [ ] Color adjustment tools (hue shift, contrast, etc.)
- [ ] Selection transformation (rotate, scale, skew)
- [ ] Pattern fill tool
- [ ] Text tool with pixel fonts
- [ ] Auto-outline/stroke generator

---

## 🔧 Technical Debt

### Performance Optimizations
- [ ] Canvas rendering optimization for large canvases (>128x128)
- [ ] Implement virtual scrolling for file list
- [ ] Lazy-load tool modules (code splitting)
- [ ] Web Worker for compression/decompression
- [ ] IndexedDB for large file storage (supplement localStorage)

### Code Quality
- [ ] Complete JSDoc coverage (100%)
- [ ] Add ESLint configuration
- [ ] Set up Prettier for code formatting
- [ ] Create component-level documentation
- [ ] Add inline code examples in comments

### Testing
- [ ] Unit tests for all utility modules
- [ ] Integration tests for core workflows
- [ ] E2E tests with Playwright
- [ ] Performance benchmarks
- [ ] Cross-browser testing suite

---

## 📊 Metrics & Goals

### Current Metrics
- **Lines of Code**: ~8,000 (excluding dependencies)
- **Module Count**: 43 modules
- **Largest File**: 473 lines (tabManager.js)
- **TypeDef Coverage**: 21% (9/43 modules)
- **Bundle Size**: 128KB (34KB gzipped)
- **Test Coverage**: 0% (no tests yet)

### Target Metrics (6 months)
- **TypeDef Coverage**: 80%+ (35/43 modules)
- **Test Coverage**: 60%+ (core modules)
- **Bundle Size**: <150KB (with new features)
- **Load Time**: <2s on 3G connection
- **Lighthouse Score**: 95+ (Performance, Accessibility)

---

## 🎯 Roadmap

### Q1 2025
- [ ] Complete TypeDef coverage for core modules
- [ ] Implement unit testing framework
- [ ] Add PNG import functionality
- [ ] Create comprehensive documentation

### Q2 2025
- [ ] Implement layer system
- [ ] Add custom keyboard shortcuts
- [ ] Create animation/frame support
- [ ] Performance optimizations

### Q3 2025
- [ ] Add symmetry drawing modes
- [ ] Implement grid overlay options
- [ ] Create palette import/export
- [ ] Plugin system foundation

### Q4 2025
- [ ] Advanced selection tools
- [ ] Color adjustment tools
- [ ] Text tool with fonts
- [ ] Community features (gallery, sharing)

---

## 📝 Notes

### Development Workflow
1. Always run `npm run build` after changes
2. Test manually in browser before committing
3. Update CLAUDE.md if architecture changes
4. Keep files under 400 lines (split if larger)
5. Add JSDoc comments for all public functions

### Release Process
1. Update version in `package.json`
2. Create git tag: `git tag v1.x.x`
3. Build production: `npm run build`
4. Test `docs/index.html` thoroughly
5. Push to GitHub: `git push --tags`
6. GitHub Pages auto-deploys from `docs/`

---

**Repository**: https://github.com/ibimspumo/Inline.PX
**License**: MIT
**Last Major Refactor**: 2025-12-03
