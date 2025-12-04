# Svelte 5 Migration - Inline.PX

**Status:** 🟢 Phase 1 Complete - Foundation Setup
**Branch:** `svelte-migration`
**Date:** 2024-12-04

---

## 📋 Migration Overview

This document tracks the migration of **Inline.PX** from Vanilla JavaScript to **Svelte 5** with an atomic design architecture.

### Goals
- ✅ Migrate to Svelte 5 with Runes syntax
- ✅ Implement atomic design pattern (atoms → molecules → organisms)
- ✅ Maintain existing canvas rendering logic (PixelCanvas.js)
- ✅ Create reactive state management with Svelte stores
- ⏳ Progressively migrate UI components
- ⏳ Preserve all existing features

---

## 🎯 Phase 1: Foundation Setup (COMPLETE ✅)

### Tech Stack
- **Framework:** Svelte 5.45.5 (with `mount()` API)
- **Build Tool:** Vite 7.2.6
- **Icons:** @lucide/svelte 0.555.0
- **Styling:** Scoped CSS + CSS Variables
- **State Management:** Svelte Writable Stores

### Project Structure

```
inline.px/
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   │   ├── atoms/              # Atomic UI components
│   │   │   │   │   └── MenuButton.svelte ✅
│   │   │   │   ├── molecules/          # Composite components
│   │   │   │   └── organisms/          # Complex UI sections
│   │   │   ├── canvas/                 # Canvas-related components
│   │   │   │   └── CanvasWrapper.svelte (prepared)
│   │   │   ├── palette/                # Color palette components
│   │   │   ├── toolbar/                # Tool UI components
│   │   │   ├── modals/                 # Modal dialogs
│   │   │   └── welcome/                # Welcome screen
│   │   ├── stores/
│   │   │   ├── editor-simple.svelte.js ✅ (active)
│   │   │   └── editor.svelte.js        (Runes - prepared)
│   │   └── utils/                      # Utility functions
│   ├── App.svelte                      ✅ Main app component
│   ├── main.js                         ✅ Entry point (mount API)
│   └── app.css                         ✅ Global styles
├── js/                                 📦 Legacy JS (preserved)
│   ├── canvas/                         # PixelCanvas.js - PRESERVED
│   ├── tools/                          # Tool implementations
│   └── ...
├── index.html                          ✅ Svelte entry point
├── index-vanilla.html                  📦 Original (backup)
├── vite.config.js                      ✅ Configured for Svelte
├── svelte.config.js                    ✅ Svelte compiler config
└── package.json                        ✅ Updated dependencies
```

---

## 🔧 Key Changes

### 1. Entry Point Migration

**Before (Vanilla JS):**
```javascript
// js/main.js
import PixelCanvas from './canvas/PixelCanvas.js';
PixelCanvas.init('pixelCanvas', 16, 16);
```

**After (Svelte 5):**
```javascript
// src/main.js
import { mount } from 'svelte';
import App from './App.svelte';

const app = mount(App, {
    target: document.getElementById('app')
});
```

### 2. State Management

**Created reactive stores:**
```javascript
// src/lib/stores/editor-simple.svelte.js
import { writable } from 'svelte/store';

export const editor = {
    canvas: createCanvasStore(),  // width, height, pixels, gridVisible, zoom
    tool: createToolStore(),       // currentToolId, brushSize, shapeMode, selectedColor
    file: createFileStore()        // currentFileName, isDirty, lastSaved
};
```

**Usage in components:**
```svelte
<script>
    import { editor } from '$lib/stores/editor-simple.svelte.js';
    const canvasStore = editor.canvas;
</script>

<div>Size: {$canvasStore.width}×{$canvasStore.height}</div>
```

### 3. Atomic UI Components

**MenuButton.svelte** - Reusable button atom:
```svelte
<script>
    import * as icons from '@lucide/svelte';
    export let icon = 'FileText';
    export let label = 'Action';
    export let shortcut = null;
    export let variant = 'default';
    export let onclick = () => {};
</script>

<button on:click={onclick}>
    <svelte:component this={icons[icon]} size={18} />
    <span>{label}</span>
    {#if shortcut}<span class="shortcut">{shortcut}</span>{/if}
</button>
```

### 4. Configuration Updates

**vite.config.js:**
```javascript
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
  plugins: [svelte()],
  resolve: {
    alias: { $lib: path.resolve(__dirname, './src/lib') }
  }
});
```

**package.json:**
```json
{
  "type": "module",
  "devDependencies": {
    "@lucide/svelte": "^0.555.0",
    "@sveltejs/vite-plugin-svelte": "^6.2.1",
    "svelte": "^5.45.5",
    "vite": "^7.2.6"
  }
}
```

---

## ✅ Completed Features

### Working Components
- ✅ **MenuButton** - Atomic button component with Lucide icons
- ✅ **App.svelte** - Main application shell
- ✅ **Reactive stores** - Canvas, Tool, File state management
- ✅ **Global styling** - CSS variables preserved from original

### Working Functionality
- ✅ New button (clears canvas state)
- ✅ Save button (console log)
- ✅ Grid toggle button (reactive variant change)
- ✅ Info panel with reactive data display
- ✅ Hot Module Replacement (HMR)

---

## 📦 Preserved Legacy Code

The following JavaScript modules are **preserved** and will be **gradually integrated**:

### Canvas System (Priority: HIGH)
- `js/canvas/PixelCanvas.js` - Main canvas orchestrator
- `js/canvas/CanvasRenderer.js` - Rendering engine
- `js/canvas/PixelData.js` - Data management
- `js/canvas/CanvasEvents.js` - Input handling
- `js/canvas/SelectionOverlay.js` - Selection visualization

### Tool System (Priority: MEDIUM)
- `js/tools/ToolRegistry.js` - Tool management
- `js/tools/BaseTool.js` - Tool base class
- `js/tools/implementations/*.js` - All tool implementations

### UI Managers (Priority: MEDIUM)
- `js/tabManager.js` - Multi-tab interface
- `js/fileManager.js` - File operations
- `js/colorPalette.js` - Color palette UI
- `js/dialogs.js` - Modal dialogs
- `js/contextMenu.js` - Context menus
- `js/layerUI.js` - Layer management UI

### Core Systems (Priority: LOW - Can be replaced)
- `js/core/EventBus.js` - Event system (→ Svelte events)
- `js/core/Logger.js` - Logging (→ Console)
- `js/history.js` - Undo/Redo (→ Store-based)
- `js/autosave.js` - Auto-saving (→ Store-based)

---

## 🚀 Next Steps

### Phase 2: Canvas Integration (Next)
1. **Integrate PixelCanvas.js with Svelte**
   - Create `CanvasWrapper.svelte` that wraps PixelCanvas
   - Use `$effect` to sync Svelte state → Canvas
   - Emit events from Canvas → Svelte stores

2. **Canvas Component Structure**
   ```svelte
   <!-- CanvasWrapper.svelte -->
   <script>
       import { onMount } from 'svelte';
       import PixelCanvas from '../../../js/canvas/PixelCanvas.js';
       import { editor } from '$lib/stores/editor-simple.svelte.js';

       let canvasElement;

       onMount(() => {
           PixelCanvas.init('pixel-canvas', $canvasStore.width, $canvasStore.height);
       });
   </script>

   <canvas id="pixel-canvas" bind:this={canvasElement}></canvas>
   ```

### Phase 3: UI Components Migration
1. **Color Palette**
   - `ColorPalette.svelte` (organism)
   - `ColorSwatch.svelte` (atom)

2. **Toolbox**
   - `Toolbox.svelte` (organism)
   - `ToolButton.svelte` (atom)

3. **Properties Panel**
   - `PropertiesPanel.svelte` (organism)
   - `SizePresets.svelte` (molecule)
   - `InputGroup.svelte` (molecule)

### Phase 4: Advanced Features
1. **Tab System** (TabManager → Svelte)
2. **File Management** (FileManager → Svelte)
3. **Modal Dialogs** (Dialogs → Svelte components)
4. **Layer System** (LayerUI → Svelte)

### Phase 5: Optimization
1. Enable Svelte 5 Runes mode
2. Replace Writable stores with `$state` runes
3. Performance profiling and optimization
4. Bundle size optimization

---

## 🐛 Known Issues & Solutions

### Issue 1: Lucide Icons Compatibility
**Problem:** `lucide-svelte` not compatible with Svelte 5
**Solution:** ✅ Use `@lucide/svelte` instead

### Issue 2: Component Initialization
**Problem:** `new App()` syntax invalid in Svelte 5
**Solution:** ✅ Use `mount(App, { target })` API

### Issue 3: Store Access Pattern
**Problem:** `$editor.canvas.width` fails (editor is object, not store)
**Solution:** ✅ Destructure stores: `const canvasStore = editor.canvas`

---

## 📊 Migration Progress

### Overall Progress: 15%
```
Phase 1: Foundation Setup     ████████████████████ 100% ✅
Phase 2: Canvas Integration   ░░░░░░░░░░░░░░░░░░░░   0%
Phase 3: UI Components        ░░░░░░░░░░░░░░░░░░░░   0%
Phase 4: Advanced Features    ░░░░░░░░░░░░░░░░░░░░   0%
Phase 5: Optimization         ░░░░░░░░░░░░░░░░░░░░   0%
```

### Component Checklist
- [x] MenuButton (atom)
- [x] App shell
- [x] Global stores
- [ ] CanvasWrapper
- [ ] ColorSwatch (atom)
- [ ] ToolButton (atom)
- [ ] ColorPalette (organism)
- [ ] Toolbox (organism)
- [ ] PropertiesPanel (organism)
- [ ] Modal (molecule)
- [ ] TabBar (organism)
- [ ] WelcomeScreen (organism)

---

## 🎨 Atomic Design Principles

### Design System Hierarchy

**Atoms** (Smallest, reusable building blocks)
- Buttons, Icons, Input fields, Color swatches
- Single-purpose, highly reusable
- Example: `MenuButton.svelte`, `ColorSwatch.svelte`

**Molecules** (Simple component groups)
- Input groups, Button groups, Card layouts
- Combine atoms with simple logic
- Example: `SizePresets.svelte`, `ToolOptions.svelte`

**Organisms** (Complex, feature-complete sections)
- Toolbox, Color palette, Properties panel
- Combine molecules with business logic
- Example: `Toolbox.svelte`, `ColorPalette.svelte`

**Pages/Views** (Complete app views)
- Full application layouts
- Combine organisms
- Example: `App.svelte`

---

## 📝 Development Guidelines

### Adding New Components

1. **Determine component level** (atom/molecule/organism)
2. **Create file in correct directory**
   ```
   src/lib/components/ui/atoms/MyButton.svelte
   ```

3. **Follow naming conventions**
   - PascalCase for component files
   - Descriptive, specific names

4. **Use scoped styling**
   ```svelte
   <style>
       .my-component { /* scoped styles */ }
   </style>
   ```

5. **Document component**
   ```svelte
   <script>
       /**
        * MyButton - Description
        * @component
        */
       export let label = 'Click me';
   </script>
   ```

### Store Updates

1. **Keep stores simple and flat**
2. **Provide update methods on store objects**
3. **Use descriptive method names**
   ```javascript
   canvas: {
       subscribe,
       resize(width, height) { /* ... */ },
       clear() { /* ... */ },
       toggleGrid() { /* ... */ }
   }
   ```

---

## 🔗 Resources

### Documentation
- [Svelte 5 Docs](https://svelte.dev/docs/svelte/overview)
- [Svelte 5 Runes](https://svelte.dev/docs/svelte/what-are-runes)
- [Lucide Icons](https://lucide.dev/)
- [Atomic Design](https://bradfrost.com/blog/post/atomic-web-design/)

### Original Project
- Original architecture documented in `CLAUDE.md`
- Vanilla JS implementation preserved in `js/` directory
- Original HTML backed up as `index-vanilla.html`

---

## 🤝 Contributing to Migration

### Pull Request Checklist
- [ ] Component follows atomic design principles
- [ ] JSDoc comments added
- [ ] Styling uses CSS variables
- [ ] Component is responsive
- [ ] Tested in dev server (HMR works)
- [ ] No console errors
- [ ] Migration progress updated in this document

### Testing
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

---

**Last Updated:** 2024-12-04
**Next Review:** After Phase 2 completion
**Maintainer:** Claude Code + User
