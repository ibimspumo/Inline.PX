# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**inline.px** is a browser-based pixel art editor built with SvelteKit 2 and Svelte 5. It features a 64-color indexed palette system with Base64 encoding for compact storage, multi-layer support, and a modular rendering pipeline.

## Key Technologies

- **SvelteKit 2** - Full-stack framework
- **Svelte 5** - Using new Runes API (`$state`, `$derived`, `$effect`)
- **TypeScript** - Strict mode enabled
- **Vite** - Build tool and dev server
- **Lucide Svelte** - Icon library

## Development Commands

```bash
# Install dependencies
npm install

# Development server (http://localhost:5173)
npm run dev

# Development server with auto-open browser
npm run dev -- --open

# Type checking
npm run check

# Type checking with watch mode
npm run check:watch

# Production build
npm run build

# Preview production build
npm run preview
```

## Architecture Overview

### State Management (Svelte 5 Runes)

All stores use Svelte 5's new Runes API instead of traditional stores:

**canvasStore** (`src/lib/stores/canvasStore.svelte.ts`)
- Canvas dimensions and layer management
- Multi-layer pixel data (2D arrays of color indices)
- Active layer tracking
- Zoom and pan state
- Layer operations: add, remove, toggle visibility, lock
- Pixel operations: setPixel, getPixel, clearCanvas
- Layer compositing: getFlattenedPixels()

**colorStore** (`src/lib/stores/colorStore.svelte.ts`)
- Primary and secondary color selection (indices 0-63)
- Color swapping functionality

**projectStore** (`src/lib/stores/projectStore.svelte.ts`)
- Project metadata (name, dimensions, timestamps)
- Project lifecycle (create, load, close)

### Color System

**64-Color Indexed Palette** (`src/lib/constants/colorPalette.ts`)
- Index 0: Transparent
- Index 1: Black
- Index 2: White
- Indices 3-63: Fixed color palette (grays, reds, oranges, yellows, greens, cyans, blues, purples, magentas)

**Base64 Encoding Format**: `WIDTHxHEIGHT:BASE64DATA`
- Each pixel's color index maps to a Base64 character (A-Z, a-z, 0-9, +, /)
- Example: `8x8:AAABBBCCCDDDEEE...`
- Enables compact storage and easy copy/paste sharing

### Render Pipeline

**CanvasRenderer** (`src/lib/utils/renderPipeline.ts`)
- Professional rendering system with dirty-checking and RAF optimization
- Layer compositing from bottom-to-top
- Checkerboard background for transparency visualization
- Optional grid overlay
- Optional pixel borders for non-transparent pixels
- Image smoothing disabled for crisp pixel rendering
- Configurable pixel size, colors, and display options

**Rendering Flow**:
1. Checkerboard background
2. Layer compositing (bottom-to-top, respecting visibility and opacity)
3. Grid overlay (optional)
4. Pixel borders (optional)

### Component Architecture (Atomic Design)

```
src/lib/components/
├── atoms/           # Smallest UI elements (IconButton, ColorSwatch, etc.)
├── molecules/       # Combinations of atoms (PixelGrid, dialogs, etc.)
├── organisms/       # Complex UI sections (Canvas, Toolbar, Panels)
└── templates/       # Layout templates (EditorLayout)
```

**Key Components**:
- `PixelGrid.svelte` - Interactive canvas with mouse drawing
- `Canvas.svelte` - Main drawing area organism
- `ColorPanel.svelte` - 64-color palette selector
- `LayersPanel.svelte` - Layer management UI
- `Toolbar.svelte` - Tool selection
- `EditorLayout.svelte` - Main application layout

### Svelte 5 Runes Patterns

**State Declaration**:
```typescript
let value = $state(initialValue);
let layers = $state<Layer[]>([]);
```

**Derived State**:
```typescript
let activeLayer = $derived(layers.find(l => l.id === activeLayerId));
```

**Effects**:
```typescript
$effect(() => {
  // Runs when dependencies change
  renderer.render(width, height, layers);
});
```

**Props**:
```typescript
let { color = '#000000', onclick }: Props = $props();
```

## Important Implementation Details

### Layer System

- Each layer contains a 2D array of color indices: `pixels: number[][]`
- Layers are rendered bottom-to-top
- Index 0 (transparent) pixels are skipped during compositing
- Active layer receives drawing operations
- Locked layers cannot be modified
- At least one layer must exist at all times

### Canvas Coordinate System

- Origin (0,0) is top-left
- X increases right, Y increases down
- All coordinates are in pixel units (not screen pixels)
- Mouse coordinates are converted via `CanvasRenderer.getPixelCoordinates()`

### Type Safety

- Strict TypeScript mode enabled
- All canvas types defined in `src/lib/types/canvas.types.ts`
- Project types in `src/lib/types/project.types.ts`
- Use interfaces for data structures, types for unions

### Path Aliases

- `$lib` - Maps to `src/lib/`
- Example: `import { canvasStore } from '$lib/stores/canvasStore.svelte';`

## Common Development Tasks

### Adding a New Tool

1. Add tool type to `Tool` union in `src/lib/types/canvas.types.ts`
2. Create tool button in `Toolbar.svelte`
3. Implement tool logic in `PixelGrid.svelte` or create dedicated tool handler
4. Add tool-specific properties panel in `ToolPropertiesPanel.svelte` if needed

### Adding a New Layer Operation

1. Add method to `canvasStore` in `src/lib/stores/canvasStore.svelte.ts`
2. Update UI in `LayersPanel.svelte` if needed
3. Consider undo/redo implications (when implemented)

### Modifying the Color Palette

- Edit `COLOR_PALETTE` array in `src/lib/constants/colorPalette.ts`
- Keep 64 colors to maintain Base64 encoding compatibility
- Update color names and hex values as needed

### Extending the Render Pipeline

- Add methods to `CanvasRenderer` class
- Call `requestRedraw()` to trigger re-render
- Use `this.ctx` for Canvas 2D context operations
- Maintain performance with dirty-checking pattern

## Code Documentation Standards

**IMPORTANT**: All Svelte components in this project are fully documented with JSDoc-style comments. When making changes or adding new code, you **MUST** follow these documentation standards:

### Component Documentation

Every Svelte component must include:

1. **Component-level comment block** at the top with:
   - `@component` tag with component name
   - Description of component purpose and functionality
   - `@example` block showing typical usage
   - `@remarks` section listing important implementation details

2. **Props interface documentation** with JSDoc comments for each property

3. **Function documentation** with JSDoc comments explaining:
   - Purpose of the function
   - Parameters (if not obvious from TypeScript)
   - Return values (if applicable)

4. **Inline comments** for complex logic or non-obvious implementation details

### Documentation Example

```svelte
<!--
  @component IconButton

  A reusable button component that displays a Lucide icon with configurable size and state.

  @example
  ```svelte
  <IconButton
    icon={Pencil}
    onclick={handleClick}
    title="Draw (B)"
    active={activeTool === 'pencil'}
  />
  ```

  @remarks
  - Supports three sizes: 'sm' (24px), 'md' (32px), 'lg' (40px)
  - Active state applies accent color background
  - Uses CSS custom properties for theming
-->
<script lang="ts">
  /**
   * Props interface for IconButton component
   */
  interface Props {
    /** Click handler function */
    onclick?: () => void;
    /** Tooltip text shown on hover */
    title?: string;
    /** Whether the button is in active/selected state */
    active?: boolean;
    /** Lucide icon component to display */
    icon: Component;
  }

  let { onclick, title, active = false, icon }: Props = $props();

  /**
   * Handles button click event
   */
  function handleClick() {
    onclick?.();
  }
</script>
```

### When to Document

- **Always** add documentation when creating new components
- **Always** update documentation when modifying component behavior
- **Always** add JSDoc comments to new functions
- **Always** update existing comments when changing functionality

## Git Workflow & Branching Strategy

**CRITICAL**: This project uses a **feature-branch workflow** for all development.

### Branch Structure

```
main (production-ready code)
└── svelte-migration (development base branch)
    ├── feature/tool-system
    ├── feature/undo-redo
    ├── feature/keyboard-shortcuts
    └── fix/layer-reordering-bug
```

### Workflow Rules

1. **Never commit directly to `svelte-migration`**
   - All new features must be developed in separate feature branches

2. **Creating a Feature Branch**
   ```bash
   # Make sure you're on svelte-migration
   git checkout svelte-migration
   git pull origin svelte-migration

   # Create new feature branch
   git checkout -b feature/your-feature-name
   # or for bug fixes
   git checkout -b fix/bug-description
   ```

3. **Development in Feature Branch**
   - Make **micro commits** for every logical change
   - Commit frequently during development
   - Keep commits atomic and focused
   - Each commit must leave the codebase in a working state

4. **Merging Back to svelte-migration**
   - Only merge when the feature is **complete and tested**
   - Merge via Pull Request or direct merge:
   ```bash
   git checkout svelte-migration
   git merge feature/your-feature-name
   git push origin svelte-migration
   ```

5. **Branch Naming Convention**
   - `feature/` - New features or enhancements
   - `fix/` - Bug fixes
   - `refactor/` - Code refactoring
   - `docs/` - Documentation updates
   - Use kebab-case: `feature/layer-blend-modes`

### When to Create a Feature Branch

**Always create a new branch for:**
- Adding a new tool (pencil, eraser, bucket, etc.)
- Implementing a new system (undo/redo, keyboard shortcuts)
- Adding a new panel or UI component
- Significant refactoring
- Bug fixes that require multiple commits

**Example workflow:**
```bash
# Starting work on selection tool
git checkout svelte-migration
git checkout -b feature/selection-tool

# Make changes and commit
git add src/lib/components/...
git commit -m "feat: Add rectangle selection tool component"

# More changes and commits
git add src/lib/stores/...
git commit -m "feat: Add selection state to canvas store"

# Feature complete, merge back
git checkout svelte-migration
git merge feature/selection-tool
git push origin svelte-migration

# Optionally delete feature branch
git branch -d feature/selection-tool
```

## Git Commit Guidelines

**IMPORTANT**: After every meaningful code change or group of related changes, create a **micro commit** with a descriptive message.

### Commit Message Format

```
<type>: <short description>

<optional detailed description>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Commit Types

- `feat:` - New feature or functionality
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring without behavior change
- `style:` - Formatting, whitespace changes
- `test:` - Adding or updating tests
- `chore:` - Build process, dependencies, tooling

### Micro Commit Philosophy

- **After every small change**: Don't batch multiple unrelated changes
- **Descriptive messages**: Explain what changed and why
- **Atomic commits**: Each commit should represent one logical change
- **Working state**: Every commit should leave the codebase in a working state
- **Within feature branches**: Commit frequently during development

### Examples

Good commit messages:
```
docs: Add JSDoc documentation to ColorPanel component

Added comprehensive component documentation including @component tag,
usage examples, and JSDoc comments for all props and functions.
```

```
feat: Add keyboard shortcut for color swapping

Implemented 'X' key to swap primary and secondary colors.
Only triggers when not in input field.
```

```
fix: Prevent layer deletion when only one layer exists

Added check to disable delete button and prevent accidental
deletion of the last remaining layer.
```

## Important Implementation Notes

### Current State & Limitations

**Tools System**
- ✅ Pencil tool is fully implemented in `PixelGrid.svelte`
- ⚠️ Other tools (Eraser, Bucket, Eyedropper, etc.) are **UI-only placeholders**
- ⚠️ Toolbar state is **local only**, not connected to global state
- 🔜 Tool system needs global state management and actual implementations

**Canvas Interaction**
- ✅ Left-click draws with primary color
- ✅ Right-click draws with secondary color
- ✅ Click-and-drag drawing works correctly
- ⚠️ No eraser functionality yet (draws color index 0 as workaround)

**Layer System**
- ✅ Fully implemented: add, remove, reorder, visibility, lock, duplicate
- ✅ Drag & drop reordering works
- ✅ Layer thumbnails with checkerboard backgrounds
- ✅ Inline name editing with double-click
- ⚠️ No layer blending modes
- ⚠️ Layer opacity is stored but not used in rendering

**Color System**
- ✅ 64-color indexed palette fully functional
- ✅ Primary/secondary color selection
- ✅ Keyboard shortcut 'X' to swap colors
- ✅ Active color mode toggle (primary/secondary)
- ⚠️ No custom color picker
- ⚠️ Palette is fixed, cannot be modified by user

**Import/Export**
- ✅ Base64 export/import works correctly
- ✅ JSON project file format implemented
- ✅ PNG export for individual layers
- ⚠️ Multi-layer PNG export composites all visible layers
- ⚠️ No GIF export yet

**Missing Features (Prepared Architecture)**
- ❌ Undo/Redo system (types exist, not implemented)
- ❌ Selection tools (Rectangle, Lasso)
- ❌ Transform tools (Move, Rotate, Scale)
- ❌ Copy/Paste functionality
- ❌ Keyboard shortcuts (except color swap)
- ❌ Zoom controls (UI exists, not functional)
- ❌ Pan/Hand tool
- ❌ Layer effects (shadows, glow, etc.)

### Critical Code Patterns

**Store Mutations**
```typescript
// ❌ WRONG - Direct mutation breaks reactivity
canvasStore.layers[0].pixels[0][0] = 5;

// ✅ CORRECT - Use store methods
canvasStore.setPixel(0, 0, 5);

// ❌ WRONG - Mutating derived state
activeLayer.pixels = newPixels;

// ✅ CORRECT - Get layer, then use store method
const layer = canvasStore.layers.find(l => l.id === layerId);
if (layer) {
  canvasStore.setPixelInLayer(layerId, x, y, colorIndex);
}
```

**Component Communication**
```typescript
// ✅ CORRECT - Props down, callbacks up
<LayerItem
  {layer}
  onRename={(name) => canvasStore.renameLayer(layer.id, name)}
/>

// ❌ WRONG - Accessing store inside child component
// Components should receive data via props and emit events via callbacks
```

**Reactive Rendering**
```typescript
// ✅ CORRECT - Use $effect for reactive re-rendering
$effect(() => {
  const { width, height, layers } = canvasStore;
  renderer.render(width, height, layers);
});

// ❌ WRONG - Manual re-render calls
// Svelte handles reactivity, avoid imperative updates
```

**Canvas Rendering**
```typescript
// ✅ CORRECT - Use CanvasRenderer dirty-checking
renderer.requestRedraw();
renderer.render(width, height, layers);

// ❌ WRONG - Direct canvas context manipulation
// Always go through CanvasRenderer for consistency
```

### Performance Considerations

**Critical Performance Rules**
1. **Never iterate over all pixels on every render** - Use dirty-checking
2. **Layer compositing is expensive** - Only re-composite when layers change
3. **Thumbnail generation is expensive** - Use $derived for caching
4. **Store getters are cheap** - Svelte's fine-grained reactivity is efficient

**Optimization Checklist**
- ✅ Canvas rendering uses dirty-checking (`needsRedraw` flag)
- ✅ Image smoothing is disabled for crisp pixels
- ✅ Layer thumbnails use $derived for automatic caching
- ✅ RequestAnimationFrame prepared (not fully utilized yet)
- ⚠️ Large canvases (128×128) may need additional optimization

### Type System Best Practices

**Always use existing types:**
```typescript
import type { Layer, Pixel, Tool } from '$lib/types/canvas.types';
import type { ProjectSize } from '$lib/types/project.types';

// ✅ CORRECT - Use defined types
const layer: Layer = { ... };
const tool: Tool = 'pencil';

// ❌ WRONG - Inline types or any
const layer: any = { ... };
const tool = 'pencil'; // Missing type annotation
```

**Props Interface Pattern:**
```typescript
// ✅ CORRECT - Named interface with JSDoc
interface Props {
  /** Layer to display */
  layer: Layer;
  /** Whether layer is active */
  isActive: boolean;
}

let { layer, isActive }: Props = $props();
```

## Project Structure Notes

- **No test files**: Testing setup not yet implemented
- **Documentation**: All Svelte components are fully documented with JSDoc-style comments
- **Static assets**: Place in `static/` directory
- **Routes**: SvelteKit file-based routing in `src/routes/`
- **Main entry**: `src/routes/+page.svelte` shows WelcomeScreen or EditorLayout based on project state
- **Architecture**: Atomic Design pattern (Atoms → Molecules → Organisms → Templates)
- **Styling**: CSS custom properties for theming, no CSS preprocessor

## Performance Considerations

- Canvas rendering uses dirty-checking (`needsRedraw` flag)
- RequestAnimationFrame for smooth updates (prepared but not fully utilized)
- Image smoothing disabled for crisp pixels
- Layers only re-render when store changes trigger `$effect`
- Avoid unnecessary layer iterations in hot paths

## Future-Ready Architecture

The codebase is prepared for:
- Selection tools (rectangle, lasso)
- Transform tools (move, rotate, scale)
- Layer effects (shadows, glow)
- Blending modes
- Undo/redo history system
- Keyboard shortcuts
- Copy/paste functionality

These features have placeholder types and architectural considerations but are not yet implemented.
