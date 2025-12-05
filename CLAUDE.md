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

## Project Structure Notes

- **No test files**: Testing setup not yet implemented
- **Documentation**: All Svelte components are fully documented with JSDoc-style comments
- **Static assets**: Place in `static/` directory
- **Routes**: SvelteKit file-based routing in `src/routes/`
- **Main entry**: `src/routes/+page.svelte` shows WelcomeScreen or EditorLayout based on project state

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
