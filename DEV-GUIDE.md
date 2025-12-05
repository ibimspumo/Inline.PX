# Development Guide - Quick Reference

Essential guidelines for developing inline.px. Load this file into context for all development sessions.

## Component Architecture (Atomic Design)

### Structure
```
atoms/       → Smallest UI elements (Button, ColorSwatch)
molecules/   → Atom combinations (ToolButton, LayerItem)
organisms/   → Complex sections (Canvas, Toolbar, LayersPanel)
templates/   → Layouts (EditorLayout)
```

### Component Creation Rules

**Atoms**: Not divisible, no business logic, props only
```svelte
<!-- ColorSwatch.svelte - Example atom -->
<script lang="ts">
  interface Props {
    /** Hex color value */
    color: string;
    /** Click handler */
    onclick?: () => void;
  }
  let { color, onclick }: Props = $props();
</script>
```

**Molecules**: 2+ atoms, specific purpose, can have local state
```svelte
<!-- ToolButton.svelte - Example molecule -->
<script lang="ts">
  let isHovered = $state(false); // Local state OK
</script>
```

**Organisms**: Complex UI, business logic, access stores
```svelte
<!-- Canvas.svelte - Example organism -->
<script lang="ts">
  import { canvasStore } from '$lib/stores/canvasStore.svelte';
  // Store access OK at this level
</script>
```

## Documentation Standards

**CRITICAL**: Every component MUST have JSDoc documentation.

### Required Documentation
```svelte
<!--
  @component ComponentName

  Brief description of purpose and functionality.

  @example
  ```svelte
  <ComponentName
    prop1="value"
    prop2={handler}
  />
  ```

  @remarks
  - Important implementation detail 1
  - Important implementation detail 2
-->
<script lang="ts">
  /**
   * Props interface for ComponentName
   */
  interface Props {
    /** Description of prop1 */
    prop1: string;
    /** Description of prop2 */
    prop2?: () => void;
  }

  let { prop1, prop2 }: Props = $props();

  /**
   * Handles user click interaction
   */
  function handleClick() {
    // Implementation
  }
</script>
```

### Documentation Checklist
- Component-level comment with @component, @example, @remarks
- Props interface with JSDoc for each property
- Function JSDoc for all non-trivial functions
- Inline comments for complex logic

## Git Workflow

### Branch Strategy
```
main (production)
└── svelte-migration (dev base)
    ├── feature/new-feature
    ├── fix/bug-name
    └── refactor/code-improvement
```

### Critical Rules
1. **NEVER commit directly to `svelte-migration`**
2. **ALWAYS work in feature branches**
3. **ALWAYS make micro commits**

### Feature Branch Workflow
```bash
# 1. Create feature branch
git checkout svelte-migration
git checkout -b feature/selection-tool

# 2. Make changes and commit frequently
git add .
git commit -m "feat: Add selection tool component"

# 3. Continue with micro commits
git add .
git commit -m "feat: Add selection state to store"

# 4. Feature complete? Merge back
git checkout svelte-migration
git merge feature/selection-tool
git push origin svelte-migration

# 5. Delete feature branch (optional)
git branch -d feature/selection-tool
```

### Commit Message Format
```
<type>: <short description>

<optional detailed description>

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### Commit Types
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation
- `refactor:` - Code refactoring
- `style:` - Formatting
- `chore:` - Build/tooling

### Micro Commit Philosophy
- Commit after every small logical change
- Each commit = one atomic change
- Every commit must leave code in working state
- Descriptive messages (what + why)

## Svelte 5 Runes Patterns

### State Management
```typescript
// Local state
let count = $state(0);
let items = $state<Item[]>([]);

// Derived state
let total = $derived(items.reduce((sum, item) => sum + item.value, 0));

// Effects
$effect(() => {
  console.log('Count changed:', count);
});

// Props
let { color = '#000000', onclick }: Props = $props();
```

### Store Access
```typescript
// ✅ CORRECT - Use store methods
canvasStore.setPixel(x, y, colorIndex);

// ❌ WRONG - Direct mutation
canvasStore.layers[0].pixels[0][0] = 5;
```

## Critical Code Patterns

### Component Communication
```typescript
// ✅ Props down, callbacks up
<ChildComponent
  data={parentData}
  onchange={(value) => handleChange(value)}
/>

// ❌ Avoid direct store access in atoms/molecules
```

### Type Safety
```typescript
// ✅ Use existing types
import type { Layer, Tool } from '$lib/types/canvas.types';

// ✅ Named Props interface with JSDoc
interface Props {
  /** Layer to display */
  layer: Layer;
}
```

### Rendering
```typescript
// ✅ Use $effect for reactive rendering
$effect(() => {
  renderer.render(width, height, layers);
});
```

## Common Tasks

### Adding a New Component
1. Determine atomic level (atom/molecule/organism)
2. Create file in appropriate directory
3. Add JSDoc documentation (component + props + functions)
4. Implement with Svelte 5 Runes
5. Use TypeScript strict mode
6. Commit immediately after completion

### Adding Store Functionality
1. Add method to appropriate store in `src/lib/stores/`
2. Update TypeScript types if needed
3. Document with JSDoc
4. Test reactivity with $effect
5. Commit immediately

### Implementing a New Feature
1. Create feature branch: `git checkout -b feature/name`
2. Break into small tasks
3. Implement with micro commits after each task
4. Document all new components
5. Merge back to svelte-migration when complete

## Performance Rules
- Never iterate all pixels on every render
- Use dirty-checking for canvas operations
- Use $derived for expensive computations
- Keep layer compositing minimal
- Avoid direct canvas context manipulation

## Quick Reminders
- Path alias: `$lib` → `src/lib/`
- TypeScript strict mode enabled
- No test files yet (testing not implemented)
- Lucide Svelte for icons
- CSS custom properties for theming
- Color palette: 64 indexed colors (0-63)
- Base64 encoding: `WIDTHxHEIGHT:BASE64DATA`
