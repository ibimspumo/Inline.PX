# Tool System Roadmap - Future-Proofing Plan

**Status**: Planning Phase
**Created**: 2025-12-05
**Last Updated**: 2025-12-05
**Version**: 1.0

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current State Analysis](#current-state-analysis)
3. [Cleanup Report](#cleanup-report)
4. [Enhancement Phases](#enhancement-phases)
5. [Detailed Implementation Plans](#detailed-implementation-plans)
6. [File Structure](#file-structure)
7. [Migration Strategy](#migration-strategy)
8. [Success Metrics](#success-metrics)
9. [Risk Assessment](#risk-assessment)

---

## Executive Summary

The inline.px tool system has been successfully migrated to a **plugin-based architecture** with auto-discovery and centralized registry. This roadmap outlines a comprehensive plan to transform it from "good" to "exceptional" through 10 strategic enhancement phases.

### Current Architecture Strengths
- ✅ Clean plugin-based architecture with auto-loading
- ✅ Type-safe interfaces with TypeScript
- ✅ Singleton registry pattern
- ✅ Svelte 5 integration with proper reactivity
- ✅ No legacy code or old tool system artifacts

### Key Limitations to Address
- ⚠️ Fixed configuration schema (no extensibility)
- ⚠️ No tool state persistence
- ⚠️ Limited lifecycle hooks
- ⚠️ Basic validation system
- ⚠️ No testing infrastructure
- ⚠️ Fixed categories (not extensible)

### Goals
1. **Extensibility**: Tools can be extended without modifying core code
2. **State Management**: Tool settings persist between sessions
3. **Type Safety**: Eliminate string-based tool references
4. **Testing**: Comprehensive test coverage (>80%)
5. **Performance**: Sub-16ms tool activation, lazy loading
6. **Developer Experience**: New tools in <30 minutes

---

## Current State Analysis

### Tool System Architecture

```
/src/lib/tools/
├── base/
│   ├── BaseTool.ts              ✅ Abstract base class
│   ├── ToolConfig.ts            ✅ Configuration interface
│   └── ToolContext.ts           ✅ Runtime context
├── implementations/
│   ├── PencilTool.ts           ✅ Fully implemented
│   ├── EraserTool.ts           ✅ Fully implemented
│   ├── BucketTool.ts           ✅ Fully implemented (flood fill)
│   ├── EyedropperTool.ts       🚧 Partial (missing colorStore)
│   ├── HandTool.ts             📝 Placeholder only
│   └── MoveTool.ts             📝 Placeholder only
├── registry/
│   ├── ToolRegistry.ts         ✅ Singleton pattern
│   └── ToolLoader.ts           ✅ Auto-loading with glob imports
└── utils/
    └── iconResolver.svelte.ts  ✅ Icon mapping
```

### Implementation Status

| Tool | Status | Lines | Features |
|------|--------|-------|----------|
| PencilTool | ✅ Complete | 58 | Drawing with primary/secondary color |
| EraserTool | ✅ Complete | 49 | Erase (set to transparent) |
| BucketTool | ✅ Complete | 123 | Flood fill algorithm |
| EyedropperTool | 🚧 Incomplete | 47 | Missing colorStore integration |
| HandTool | 📝 Placeholder | 30 | Pan logic not implemented |
| MoveTool | 📝 Placeholder | 30 | Waiting for selection system |

### Strengths

**Architecture**
- Clean separation of concerns (base/implementations/registry/utils)
- Plugin-based with zero hardcoded tool logic
- Auto-discovery via Vite glob imports
- Singleton pattern prevents duplicate loading

**Type Safety**
- Strong TypeScript types throughout
- JSDoc documentation on all classes
- Type-safe icon resolution

**Developer Experience**
- New tools auto-appear in toolbar
- Consistent interface via BaseTool
- Clear lifecycle hooks

### Weaknesses & Gaps

**1. Configuration Limitations**
```typescript
// Current: Fixed schema
interface ToolConfig {
  id: string;
  name: string;
  description: string;
  iconName: IconName;
  category: ToolCategory;  // ❌ Fixed union type
  shortcut?: string;
  cursor: ToolCursor;
  supportsDrag: boolean;
  worksOnLockedLayers: boolean;
  order: number;
}
// ❌ No way to add custom properties
// ❌ No tool options (brush size, opacity, etc.)
// ❌ No version/author/license info
```

**2. State Management**
```typescript
// ❌ No persistent state
// ❌ Tool settings reset on tool switch
// ❌ Can't save/restore tool preferences
// ❌ No per-tool storage pattern
```

**3. Lifecycle Hooks**
```typescript
abstract class BaseTool {
  onActivate?(context: ToolContext): void;
  onDeactivate?(context: ToolContext): void;
  onMouseDown?(mouse: MouseEventContext, tool: ToolContext): void;
  onMouseMove?(mouse: MouseEventContext, tool: ToolContext): void;
  onMouseUp?(mouse: MouseEventContext, tool: ToolContext): void;
  onClick?(mouse: MouseEventContext, tool: ToolContext): void;
}
// ❌ No beforeActivate/afterDeactivate
// ❌ No render hooks
// ❌ No canvas lifecycle hooks
// ❌ No undo/redo integration
```

**4. Validation**
```typescript
canUse?(toolContext: ToolContext): { valid: boolean; reason?: string };
// ❌ Simple boolean result
// ❌ No error levels (error/warning/info)
// ❌ No suggested actions
// ❌ No permission system
```

**5. Type Safety Issues**
```typescript
// src/lib/types/canvas.types.ts
export type Tool =
  | 'pencil'
  | 'eraser'
  | 'bucket'
  | 'eyedropper'
  | 'move'
  | 'hand'
  | 'zoom'      // ❌ No implementation exists
  | 'rectangle' // ❌ No implementation exists
  | 'ellipse'   // ❌ No implementation exists
  | 'select';   // ❌ No implementation exists

// ❌ Type allows setting tools that don't exist
// ❌ String-based, not type-safe
```

---

## Cleanup Report

### ✅ Good News: Clean Migration

**No old tool system artifacts found!** The migration to the plugin system was executed cleanly:
- ✅ No old hardcoded tool logic in components
- ✅ No redundant files to delete
- ✅ PixelGrid fully refactored to use BaseTool system
- ✅ Toolbar dynamically generated from registry
- ✅ canvasStore is tool-agnostic

### ⚠️ Issues Found

#### 1. Type System Inconsistency (CRITICAL)
**File**: `/src/lib/types/canvas.types.ts` (lines 50-60)

**Issue**: Tool type union includes non-existent tools
```typescript
export type Tool =
  | 'pencil'      // ✅ Exists
  | 'eraser'      // ✅ Exists
  | 'bucket'      // ✅ Exists
  | 'eyedropper'  // ✅ Exists (partial)
  | 'move'        // ✅ Exists (placeholder)
  | 'hand'        // ✅ Exists (placeholder)
  | 'zoom'        // ❌ Does not exist
  | 'rectangle'   // ❌ Does not exist
  | 'ellipse'     // ❌ Does not exist
  | 'select';     // ❌ Does not exist
```

**Impact**: Type system allows referencing tools that will cause runtime errors

**Solution**: Either remove non-existent tools from type OR create placeholder implementations

---

#### 2. Incomplete Tool Implementations

**EyedropperTool** - Missing ColorStore Integration
File: `/src/lib/tools/implementations/EyedropperTool.ts` (line 33)

```typescript
onClick(mouseContext: MouseEventContext, toolContext: ToolContext): void {
  const colorIndex = toolContext.getPixel(x, y);

  // TODO: Set this as primary or secondary color
  // This requires access to colorStore, which we'll add to ToolContext
  console.log(`Eyedropper: Sampled color index ${colorIndex}`);
}
```

**HandTool** - No Pan Implementation
File: `/src/lib/tools/implementations/HandTool.ts` (lines 25-26)

```typescript
// TODO: Implement pan functionality
// Requires enhanced pan system in canvasStore
```

Note: canvasStore has `panX`, `panY`, and `setPan()` but HandTool doesn't use them

**MoveTool** - No Implementation
File: `/src/lib/tools/implementations/MoveTool.ts` (lines 25-26)

```typescript
// TODO: Implement move functionality
// Requires selection system to be implemented first
```

---

#### 3. Debug Console Statements

**Should be removed or wrapped in DEBUG flag:**

1. `/src/lib/components/organisms/editor/Toolbar.svelte:46`
   ```typescript
   console.log('Toolbar: Loaded tools by category:', toolsByCategory);
   ```

2. `/src/lib/tools/implementations/EyedropperTool.ts:35`
   ```typescript
   console.log(`Eyedropper: Sampled color index ${colorIndex}`);
   ```

**Can keep (useful for debugging):**

3. `/src/lib/tools/registry/ToolLoader.ts:36,61`
   ```typescript
   console.log('🔧 Loading tools...');
   console.log(`✓ Loaded ${tools.length} tools`);
   ```

4. `/src/lib/tools/registry/ToolRegistry.ts:45`
   ```typescript
   console.log(`✓ Registered tool: ${tool.config.name}`);
   ```

---

## Enhancement Phases

### Priority Matrix

| Phase | Priority | Effort | Impact | Breaking Changes |
|-------|----------|--------|--------|------------------|
| **Phase 1: Foundation** | 🔴 CRITICAL | High | Very High | Partial |
| 1. Enhanced Configuration | HIGH | Medium | Very High | No |
| 2. Tool State Management | HIGH | High | Very High | No |
| 3. Enhanced Type Safety | HIGH | Medium | High | Yes |
| **Phase 2: Features** | 🟡 HIGH | Medium | High | Minimal |
| 4. Lifecycle & Events | MEDIUM | Medium | High | No |
| 5. Advanced Validation | MEDIUM | Medium | Medium | Partial |
| 6. Testing Infrastructure | MEDIUM | High | Medium | No |
| **Phase 3: Polish** | 🟢 MEDIUM | Medium | Medium | Some |
| 7. Dynamic Categories | LOW | Low | Medium | Yes |
| 8. Tool Composition | LOW | Medium | Medium | No |
| **Phase 4: Nice to Have** | 🔵 LOW | Variable | Low | No |
| 9. Auto Documentation | LOW | Medium | Low | No |
| 10. Performance | LOW | Low | Low | No |

---

## Detailed Implementation Plans

---

## Phase 1: Foundation (CRITICAL PRIORITY)

### 1.1 Enhanced Tool Configuration

**Goal**: Make tool configuration extensible and support tool options

**Problem**: Current ToolConfig has fixed schema. Can't add custom properties or tool-specific options without modifying the interface.

**Solution**: Introduce extensible metadata and tool options system

#### New Files to Create

**`/src/lib/tools/base/ToolOptions.ts`**
```typescript
/**
 * Tool Option Schema
 *
 * Defines configurable options for tools (e.g., brush size, opacity)
 */

export type OptionType = 'number' | 'boolean' | 'string' | 'color' | 'select' | 'slider';

export interface ToolOption<T = any> {
  /** Unique option identifier */
  id: string;

  /** Display label */
  label: string;

  /** Option description/tooltip */
  description?: string;

  /** Option type determines UI control */
  type: OptionType;

  /** Default value */
  defaultValue: T;

  /** For number/slider: minimum value */
  min?: number;

  /** For number/slider: maximum value */
  max?: number;

  /** For number/slider: step increment */
  step?: number;

  /** For select: available options */
  options?: Array<{ value: T; label: string }>;

  /** Validation function */
  validation?: (value: T) => boolean | string;

  /** Whether option is visible in UI */
  visible?: boolean | ((context: ToolContext) => boolean);
}

/**
 * Example tool options
 */
export const commonToolOptions = {
  brushSize: {
    id: 'brushSize',
    label: 'Brush Size',
    description: 'Size of the brush in pixels',
    type: 'slider' as const,
    defaultValue: 1,
    min: 1,
    max: 64,
    step: 1
  },

  opacity: {
    id: 'opacity',
    label: 'Opacity',
    description: 'Brush opacity (0-100%)',
    type: 'slider' as const,
    defaultValue: 100,
    min: 0,
    max: 100,
    step: 1
  },

  antiAlias: {
    id: 'antiAlias',
    label: 'Anti-Aliasing',
    description: 'Smooth edges',
    type: 'boolean' as const,
    defaultValue: false
  }
};
```

**`/src/lib/tools/base/ToolMetadata.ts`**
```typescript
/**
 * Extended Tool Metadata
 *
 * Additional metadata for professional tool system
 */

import type { ToolConfig } from './ToolConfig';
import type { ToolOption } from './ToolOptions';

export interface ToolConfigExtended extends ToolConfig {
  /** Tool version (semver) */
  version: string;

  /** Tool author */
  author?: string;

  /** License (e.g., 'MIT', 'GPL-3.0') */
  license?: string;

  /** Tags for search/filtering */
  tags?: string[];

  /** Tool dependencies (other tool IDs) */
  dependencies?: string[];

  /** Configurable options */
  options?: ToolOption[];

  /** Custom metadata (escape hatch for future extensions) */
  metadata?: Record<string, any>;

  /** Documentation */
  documentation?: {
    description: string;
    usage: string;
    examples?: ToolExample[];
    tips?: string[];
    relatedTools?: string[];
    videoUrl?: string;
  };
}

export interface ToolExample {
  title: string;
  description: string;
  steps: string[];
  expectedResult: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}
```

#### Files to Modify

**`/src/lib/tools/base/BaseTool.ts`**
```typescript
import type { ToolConfigExtended } from './ToolMetadata';

export abstract class BaseTool {
  // Change from ToolConfig to ToolConfigExtended
  public abstract readonly config: ToolConfigExtended;

  // Add options getter
  getOption<T = any>(optionId: string): T | undefined {
    const option = this.config.options?.find(opt => opt.id === optionId);
    return option?.defaultValue as T;
  }

  // ... rest remains same
}
```

**`/src/lib/tools/implementations/PencilTool.ts`**
```typescript
import { commonToolOptions } from '../base/ToolOptions';

class PencilTool extends BaseTool {
  public readonly config: ToolConfigExtended = {
    id: 'pencil',
    name: 'Pencil',
    description: 'Draw pixel by pixel',
    iconName: 'Pencil',
    category: 'draw',
    shortcut: 'B',
    cursor: 'crosshair',
    supportsDrag: true,
    worksOnLockedLayers: false,
    order: 1,

    // NEW: Version and metadata
    version: '1.0.0',
    author: 'inline.px',
    license: 'MIT',
    tags: ['drawing', 'basic', 'pixel'],

    // NEW: Tool options
    options: [
      commonToolOptions.brushSize,
      commonToolOptions.opacity
    ],

    // NEW: Documentation
    documentation: {
      description: 'The Pencil tool allows you to draw individual pixels on the canvas.',
      usage: 'Click to draw a single pixel, or click and drag to draw continuously.',
      tips: [
        'Hold Shift while dragging to draw straight lines',
        'Use right-click to draw with secondary color'
      ]
    }
  };
}
```

#### UI Component

**`/src/lib/components/molecules/tools/ToolOptionsPanel.svelte`**
```svelte
<!--
  @component ToolOptionsPanel

  Displays configurable options for the active tool.
  Dynamically generates UI controls based on tool option schemas.
-->
<script lang="ts">
  import { toolRegistry } from '$lib/tools';
  import { canvasStore } from '$lib/stores/canvasStore.svelte';
  import type { ToolOption } from '$lib/tools/base/ToolOptions';

  let activeTool = $derived(
    toolRegistry.getTool(canvasStore.activeTool)
  );

  let options = $derived(activeTool?.config.options || []);

  function renderOption(option: ToolOption) {
    // Dynamically render based on option.type
  }
</script>

<div class="tool-options-panel">
  {#if options.length > 0}
    <h3>Tool Options</h3>
    {#each options as option}
      {@const visible = typeof option.visible === 'function'
        ? option.visible(toolContext)
        : option.visible !== false}

      {#if visible}
        <div class="option">
          <label for={option.id}>{option.label}</label>

          {#if option.type === 'slider'}
            <input
              type="range"
              id={option.id}
              min={option.min}
              max={option.max}
              step={option.step}
              value={option.defaultValue}
            />
          {/if}

          {#if option.type === 'boolean'}
            <input
              type="checkbox"
              id={option.id}
              checked={option.defaultValue}
            />
          {/if}

          <!-- Add more option types... -->
        </div>
      {/if}
    {/each}
  {:else}
    <p class="no-options">No options for this tool</p>
  {/if}
</div>
```

#### Implementation Steps

1. ✅ Create `ToolOptions.ts` with option schema types
2. ✅ Create `ToolMetadata.ts` with extended config
3. ✅ Update `BaseTool.ts` to use `ToolConfigExtended`
4. ✅ Add `getOption()` method to BaseTool
5. ✅ Migrate PencilTool to use new config (example)
6. ✅ Create `ToolOptionsPanel.svelte` component
7. ✅ Integrate options panel into UI (Toolbar or sidebar)
8. ✅ Update CLAUDE.md documentation

**Estimated Time**: 4-6 hours
**Priority**: HIGH
**Breaking Changes**: No (backward compatible, ToolConfig extended not replaced)

---

### 1.2 Tool State Management

**Goal**: Persistent tool state with localStorage integration

**Problem**: Tool settings reset when switching tools. No way to save user preferences.

**Solution**: Centralized state manager with persistence

#### New Files to Create

**`/src/lib/tools/state/ToolStateManager.svelte.ts`**
```typescript
/**
 * Tool State Manager
 *
 * Manages persistent state for all tools using Svelte 5 runes.
 * Automatically persists to localStorage.
 */

import { toolRegistry } from '../registry/ToolRegistry';

export interface ToolState {
  /** Tool ID */
  toolId: string;

  /** Tool option values */
  options: Record<string, any>;

  /** Last time tool was used */
  lastUsed?: Date;

  /** Number of times tool has been used */
  useCount?: number;

  /** Custom state (tool-specific) */
  custom?: Record<string, any>;
}

class ToolStateManager {
  private states = $state(new Map<string, ToolState>());
  private storageKey = 'inline-px:tool-states';

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Get state for a tool
   */
  getToolState(toolId: string): ToolState {
    if (!this.states.has(toolId)) {
      // Initialize with defaults from tool config
      const tool = toolRegistry.getTool(toolId);
      const defaultOptions: Record<string, any> = {};

      tool?.config.options?.forEach(option => {
        defaultOptions[option.id] = option.defaultValue;
      });

      this.states.set(toolId, {
        toolId,
        options: defaultOptions,
        useCount: 0
      });
    }

    return this.states.get(toolId)!;
  }

  /**
   * Set state for a tool
   */
  setToolState(toolId: string, updates: Partial<ToolState>): void {
    const current = this.getToolState(toolId);
    const updated = { ...current, ...updates };
    this.states.set(toolId, updated);
    this.persistToStorage();
  }

  /**
   * Update a specific option value
   */
  setToolOption(toolId: string, optionId: string, value: any): void {
    const state = this.getToolState(toolId);
    state.options[optionId] = value;
    this.setToolState(toolId, state);
  }

  /**
   * Get a specific option value
   */
  getToolOption<T = any>(toolId: string, optionId: string): T | undefined {
    const state = this.getToolState(toolId);
    return state.options[optionId] as T;
  }

  /**
   * Reset tool state to defaults
   */
  resetToolState(toolId: string): void {
    this.states.delete(toolId);
    this.persistToStorage();
  }

  /**
   * Increment use count and update last used
   */
  recordToolUsage(toolId: string): void {
    const state = this.getToolState(toolId);
    state.useCount = (state.useCount || 0) + 1;
    state.lastUsed = new Date();
    this.setToolState(toolId, state);
  }

  /**
   * Persist states to localStorage
   */
  private persistToStorage(): void {
    try {
      const serialized: Record<string, any> = {};

      this.states.forEach((state, toolId) => {
        serialized[toolId] = {
          ...state,
          lastUsed: state.lastUsed?.toISOString()
        };
      });

      localStorage.setItem(this.storageKey, JSON.stringify(serialized));
    } catch (error) {
      console.error('Failed to persist tool states:', error);
    }
  }

  /**
   * Load states from localStorage
   */
  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) return;

      const parsed = JSON.parse(stored);

      Object.entries(parsed).forEach(([toolId, state]: [string, any]) => {
        this.states.set(toolId, {
          ...state,
          lastUsed: state.lastUsed ? new Date(state.lastUsed) : undefined
        });
      });
    } catch (error) {
      console.error('Failed to load tool states:', error);
    }
  }

  /**
   * Subscribe to state changes for a specific tool
   */
  subscribeToToolState(
    toolId: string,
    callback: (state: ToolState) => void
  ): () => void {
    // Use Svelte's $effect to watch for changes
    const unsubscribe = $effect(() => {
      const state = this.getToolState(toolId);
      callback(state);
    });

    return unsubscribe;
  }

  /**
   * Export all states as JSON
   */
  exportStates(): string {
    const serialized: Record<string, any> = {};
    this.states.forEach((state, toolId) => {
      serialized[toolId] = state;
    });
    return JSON.stringify(serialized, null, 2);
  }

  /**
   * Import states from JSON
   */
  importStates(json: string): void {
    try {
      const parsed = JSON.parse(json);
      Object.entries(parsed).forEach(([toolId, state]: [string, any]) => {
        this.states.set(toolId, state as ToolState);
      });
      this.persistToStorage();
    } catch (error) {
      console.error('Failed to import tool states:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const toolStateManager = new ToolStateManager();
```

**`/src/lib/tools/state/ToolStorage.ts`**
```typescript
/**
 * Tool Storage Adapter
 *
 * Abstracts storage mechanism (localStorage, IndexedDB, etc.)
 */

export interface StorageAdapter {
  get(key: string): Promise<string | null>;
  set(key: string, value: string): Promise<void>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

/**
 * localStorage adapter (default)
 */
export class LocalStorageAdapter implements StorageAdapter {
  async get(key: string): Promise<string | null> {
    return localStorage.getItem(key);
  }

  async set(key: string, value: string): Promise<void> {
    localStorage.setItem(key, value);
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    localStorage.clear();
  }
}

/**
 * IndexedDB adapter (for larger data)
 */
export class IndexedDBAdapter implements StorageAdapter {
  private dbName = 'inline-px';
  private storeName = 'tool-states';

  private async getDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName);
        }
      };
    });
  }

  async get(key: string): Promise<string | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.get(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result || null);
    });
  }

  async set(key: string, value: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(value, key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async remove(key: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(key);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }

  async clear(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.clear();

      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve();
    });
  }
}
```

#### Files to Modify

**`/src/lib/tools/base/ToolContext.ts`**
```typescript
import type { toolStateManager } from '../state/ToolStateManager.svelte';

export interface ToolContext {
  // Existing fields...
  canvas: CanvasContext;
  colors: ColorContext;
  renderer: CanvasRenderer | null;

  // NEW: State management
  state: typeof toolStateManager;

  // Helper methods remain...
  setPixel: (x: number, y: number, colorIndex: number) => void;
  getPixel: (x: number, y: number, layerId?: string) => number;
  requestRedraw: () => void;
}
```

**`/src/lib/components/molecules/canvas/PixelGrid.svelte`**
```typescript
import { toolStateManager } from '$lib/tools/state/ToolStateManager.svelte';

// Add to toolContext
const toolContext: ToolContext = {
  canvas: canvasContext,
  colors: colorContext,
  renderer,
  state: toolStateManager,  // NEW
  setPixel: (x, y, colorIndex) => canvasStore.setPixel(x, y, colorIndex),
  getPixel: (x, y, layerId) => canvasStore.getPixel(x, y, layerId),
  requestRedraw: () => renderer?.requestRedraw()
};
```

**`/src/lib/tools/base/BaseTool.ts`**
```typescript
export abstract class BaseTool {
  // Add state helpers

  /**
   * Get option value from persistent state
   */
  protected getOptionValue<T = any>(
    optionId: string,
    context: ToolContext
  ): T | undefined {
    return context.state.getToolOption(this.config.id, optionId);
  }

  /**
   * Set option value in persistent state
   */
  protected setOptionValue(
    optionId: string,
    value: any,
    context: ToolContext
  ): void {
    context.state.setToolOption(this.config.id, optionId, value);
  }

  /**
   * Called when tool is activated (override to add state logic)
   */
  onActivate?(context: ToolContext): void {
    // Record usage
    context.state.recordToolUsage(this.config.id);
  }
}
```

#### Implementation Steps

1. ✅ Create `ToolStateManager.svelte.ts` with Svelte 5 runes
2. ✅ Create `ToolStorage.ts` adapter pattern
3. ✅ Add `state` field to ToolContext
4. ✅ Update PixelGrid to provide state manager
5. ✅ Add state helpers to BaseTool
6. ✅ Update ToolOptionsPanel to read/write from state
7. ✅ Add settings UI for import/export/reset
8. ✅ Test state persistence across page reloads

**Estimated Time**: 6-8 hours
**Priority**: HIGH
**Breaking Changes**: No (additive to ToolContext)

---

### 1.3 Enhanced Type Safety

**Goal**: Eliminate string-based tool IDs, make tool system fully type-safe

**Problem**:
- Tool IDs are strings, not type-checked
- Tool type union manually maintained
- Possible to reference non-existent tools

**Solution**: Template literal types and auto-generated types from registry

#### New Files to Create

**`/src/lib/tools/base/ToolTypes.ts`**
```typescript
/**
 * Type-Safe Tool System
 *
 * Eliminates string-based tool references with template literal types
 */

import type { ToolConfig } from './ToolConfig';
import type { BaseTool } from './BaseTool';

/**
 * Extract tool ID from config
 */
export type ExtractToolId<T extends BaseTool> = T['config']['id'];

/**
 * Type-safe tool configuration
 */
export interface TypedToolConfig<TId extends string = string> extends ToolConfig {
  id: TId;
}

/**
 * Type-safe tool interface
 */
export interface TypedTool<TId extends string = string> extends BaseTool {
  config: TypedToolConfig<TId>;
}

/**
 * Tool ID brand type (nominal typing)
 */
export type ToolId<T extends string = string> = T & { readonly __brand: 'ToolId' };

/**
 * Create branded tool ID
 */
export function createToolId<T extends string>(id: T): ToolId<T> {
  return id as ToolId<T>;
}

/**
 * Type guard for tool ID
 */
export function isToolId(value: string): value is ToolId {
  // Runtime validation would check against registry
  return typeof value === 'string';
}
```

**`/scripts/generate-tool-types.ts`**
```typescript
/**
 * Generate Tool Type Union from Implementations
 *
 * Run this script to auto-generate the Tool type from actual implementations
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const toolsDir = path.join(__dirname, '../src/lib/tools/implementations');
const outputFile = path.join(__dirname, '../src/lib/types/generated-tool-types.ts');

async function generateToolTypes() {
  // Read all tool implementation files
  const files = fs.readdirSync(toolsDir).filter(f => f.endsWith('.ts'));

  const toolIds: string[] = [];

  for (const file of files) {
    const content = fs.readFileSync(path.join(toolsDir, file), 'utf-8');

    // Extract tool ID from config
    const idMatch = content.match(/id:\s*['"]([^'"]+)['"]/);
    if (idMatch) {
      toolIds.push(idMatch[1]);
    }
  }

  // Generate type file
  const output = `/**
 * Auto-generated Tool Types
 *
 * DO NOT EDIT MANUALLY - Generated by scripts/generate-tool-types.ts
 * Run: npm run generate:types
 */

export type Tool = ${toolIds.map(id => `'${id}'`).join('\n  | ')};

export const REGISTERED_TOOLS = [${toolIds.map(id => `'${id}'`).join(', ')}] as const;

export type RegisteredTool = typeof REGISTERED_TOOLS[number];
`;

  fs.writeFileSync(outputFile, output);
  console.log(`✓ Generated tool types: ${toolIds.length} tools`);
}

generateToolTypes();
```

**`/src/lib/tools/registry/TypedToolRegistry.ts`**
```typescript
/**
 * Type-Safe Tool Registry
 *
 * Enhanced registry with full type safety
 */

import type { BaseTool } from '../base/BaseTool';
import type { TypedTool, ToolId } from '../base/ToolTypes';
import type { Tool } from '@/lib/types/generated-tool-types';

export class TypedToolRegistry {
  private tools = new Map<ToolId, BaseTool>();

  /**
   * Register a tool (type-safe)
   */
  register<TId extends Tool>(tool: TypedTool<TId>): void {
    const id = tool.config.id as ToolId<TId>;

    if (this.tools.has(id)) {
      console.warn(`Tool with id "${id}" is already registered. Overwriting.`);
    }

    this.tools.set(id, tool);
  }

  /**
   * Get a tool by ID (type-safe)
   */
  getTool<TId extends Tool>(id: TId): TypedTool<TId> | undefined {
    return this.tools.get(id as ToolId<TId>) as TypedTool<TId> | undefined;
  }

  /**
   * Check if tool is registered
   */
  hasTool(id: Tool): boolean {
    return this.tools.has(id as ToolId);
  }

  /**
   * Get all registered tool IDs
   */
  getRegisteredToolIds(): Tool[] {
    return Array.from(this.tools.keys()) as Tool[];
  }
}
```

#### Files to Modify

**`/package.json`**
```json
{
  "scripts": {
    "generate:types": "tsx scripts/generate-tool-types.ts",
    "prebuild": "npm run generate:types"
  }
}
```

**`/src/lib/types/canvas.types.ts`**
```typescript
// Replace manual Tool type with generated one
export type { Tool } from './generated-tool-types';

// Or if you want to keep manual for now, fix it:
export type Tool =
  | 'pencil'
  | 'eraser'
  | 'bucket'
  | 'eyedropper'
  | 'move'
  | 'hand';
  // Remove: 'zoom', 'rectangle', 'ellipse', 'select'
```

**`/src/lib/stores/canvasStore.svelte.ts`**
```typescript
import type { Tool } from '$lib/types/canvas.types';

function setActiveTool(tool: Tool): void {  // Type-safe!
  activeTool = tool;
}
```

#### Implementation Steps

1. ✅ Create `ToolTypes.ts` with type utilities
2. ✅ Create `generate-tool-types.ts` script
3. ✅ Add npm script to package.json
4. ✅ Run generator to create `generated-tool-types.ts`
5. ✅ Update `canvas.types.ts` to use generated type
6. ✅ Create `TypedToolRegistry.ts` (optional, for future)
7. ✅ Remove invalid tool IDs from Tool union
8. ✅ Fix all type errors in codebase
9. ✅ Add pre-build hook to run generator

**Estimated Time**: 3-4 hours
**Priority**: HIGH
**Breaking Changes**: Yes (Tool type changes, but straightforward migration)

---

## Phase 2: Features (HIGH PRIORITY)

### 2.1 Enhanced Lifecycle & Event System

**Goal**: Rich event system for tool communication and comprehensive lifecycle hooks

**Current Limitations**:
- Only 2 lifecycle hooks (onActivate, onDeactivate)
- No inter-tool communication
- No way to hook into canvas/layer/color changes
- No undo/redo integration

**Solution**: Event bus with pub/sub pattern + extended lifecycle

#### New Files

**`/src/lib/tools/events/ToolEventBus.ts`** - 150 lines
**`/src/lib/tools/events/ToolEventTypes.ts`** - 80 lines
**`/src/lib/tools/base/ToolHooks.ts`** - 120 lines

#### Estimated Time
6-8 hours

#### Priority
MEDIUM

---

### 2.2 Advanced Validation & Permissions

**Goal**: Capability-based validation with detailed error reporting

#### New Files
**`/src/lib/tools/validation/ToolValidator.ts`** - 200 lines
**`/src/lib/tools/validation/ToolCapabilities.ts`** - 100 lines
**`/src/lib/tools/validation/ToolPermissions.ts`** - 80 lines

#### Estimated Time
5-6 hours

#### Priority
MEDIUM

---

### 2.3 Testing Infrastructure

**Goal**: Comprehensive test utilities and coverage

#### New Files
**`/src/lib/tools/testing/ToolTestHarness.ts`** - 250 lines
**`/src/lib/tools/testing/MockToolContext.ts`** - 150 lines
**`/src/lib/tools/testing/ToolFixtures.ts`** - 100 lines

#### Estimated Time
8-10 hours

#### Priority
MEDIUM

---

## Phase 3: Polish (MEDIUM PRIORITY)

### 3.1 Dynamic Categories & Tags

**Goal**: Flexible category system with search

#### New Files
**`/src/lib/tools/base/ToolTaxonomy.ts`**
**`/src/lib/tools/registry/CategoryRegistry.ts`**
**`/src/lib/tools/search/ToolSearchEngine.ts`**

#### Estimated Time
4-5 hours

#### Priority
LOW

---

### 3.2 Tool Composition & Variants

**Goal**: Mixin pattern for code reuse

#### New Files
**`/src/lib/tools/mixins/DrawingMixin.ts`**
**`/src/lib/tools/mixins/SelectionMixin.ts`**
**`/src/lib/tools/factory/ToolFactory.ts`**

#### Estimated Time
6-8 hours

#### Priority
LOW

---

## Phase 4: Nice to Have (LOW PRIORITY)

### 4.1 Auto-Generated Documentation

**Goal**: Generate docs from tool configs

#### New Files
**`/src/lib/tools/documentation/ToolDocGenerator.ts`**
**`/scripts/generate-tool-docs.ts`**

#### Estimated Time
5-6 hours

#### Priority
LOW

---

### 4.2 Performance Optimizations

**Goal**: Lazy loading and performance monitoring

#### New Files
**`/src/lib/tools/performance/ToolPerformanceMonitor.ts`**
**`/src/lib/tools/registry/LazyToolLoader.ts`**

#### Estimated Time
4-5 hours

#### Priority
LOW

---

## File Structure

### Complete Directory Tree After All Phases

```
/src/lib/tools/
├── base/
│   ├── BaseTool.ts                 ✅ Existing (modify)
│   ├── ToolConfig.ts               ✅ Existing (modify)
│   ├── ToolContext.ts              ✅ Existing (modify)
│   ├── ToolOptions.ts              🆕 Phase 1.1
│   ├── ToolMetadata.ts             🆕 Phase 1.1
│   ├── ToolTypes.ts                🆕 Phase 1.3
│   └── ToolHooks.ts                🆕 Phase 2.1
│
├── implementations/
│   ├── PencilTool.ts               ✅ Existing (update)
│   ├── EraserTool.ts               ✅ Existing (update)
│   ├── BucketTool.ts               ✅ Existing (update)
│   ├── EyedropperTool.ts           🚧 Existing (complete)
│   ├── HandTool.ts                 🚧 Existing (complete)
│   └── MoveTool.ts                 🚧 Existing (complete)
│
├── registry/
│   ├── ToolRegistry.ts             ✅ Existing (modify)
│   ├── ToolLoader.ts               ✅ Existing (modify)
│   ├── TypedToolRegistry.ts        🆕 Phase 1.3
│   ├── CategoryRegistry.ts         🆕 Phase 3.1
│   └── LazyToolLoader.ts           🆕 Phase 4.2
│
├── state/
│   ├── ToolStateManager.svelte.ts  🆕 Phase 1.2
│   ├── ToolStorage.ts              🆕 Phase 1.2
│   └── ToolStateSchema.ts          🆕 Phase 1.2
│
├── events/
│   ├── ToolEventBus.ts             🆕 Phase 2.1
│   ├── ToolEventTypes.ts           🆕 Phase 2.1
│   └── ToolEvent.ts                🆕 Phase 2.1
│
├── validation/
│   ├── ToolValidator.ts            🆕 Phase 2.2
│   ├── ToolCapabilities.ts         🆕 Phase 2.2
│   ├── ToolPermissions.ts          🆕 Phase 2.2
│   └── ValidationMessages.ts       🆕 Phase 2.2
│
├── mixins/
│   ├── DrawingMixin.ts             🆕 Phase 3.2
│   ├── SelectionMixin.ts           🆕 Phase 3.2
│   └── HistoryMixin.ts             🆕 Phase 3.2
│
├── factory/
│   ├── ToolFactory.ts              🆕 Phase 3.2
│   └── ToolVariants.ts             🆕 Phase 3.2
│
├── testing/
│   ├── ToolTestHarness.ts          🆕 Phase 2.3
│   ├── MockToolContext.ts          🆕 Phase 2.3
│   ├── ToolFixtures.ts             🆕 Phase 2.3
│   └── *.test.ts                   🆕 Phase 2.3
│
├── documentation/
│   ├── ToolDocGenerator.ts         🆕 Phase 4.1
│   └── DocTemplates.ts             🆕 Phase 4.1
│
├── performance/
│   ├── ToolPerformanceMonitor.ts   🆕 Phase 4.2
│   └── PerformanceMetrics.ts       🆕 Phase 4.2
│
├── cache/
│   ├── ToolCache.ts                🆕 Phase 4.2
│   └── QueryCache.ts               🆕 Phase 4.2
│
├── search/
│   └── ToolSearchEngine.ts         🆕 Phase 3.1
│
├── utils/
│   └── iconResolver.svelte.ts      ✅ Existing
│
└── index.ts                        ✅ Existing (update exports)
```

### New UI Components

```
/src/lib/components/
├── molecules/tools/
│   ├── ToolOptionsPanel.svelte         🆕 Phase 1.1
│   └── ToolValidationMessage.svelte    🆕 Phase 2.2
│
└── organisms/
    ├── ToolHelpPanel.svelte            🆕 Phase 4.1
    ├── ToolPalette.svelte              🆕 Phase 3.1
    └── PerformancePanel.svelte         🆕 Phase 4.2
```

---

## Migration Strategy

### Backward Compatibility Principles

1. **Additive Changes Preferred**: Extend existing interfaces rather than replacing
2. **Deprecation Period**: Old APIs marked deprecated for 6 months before removal
3. **Adapter Pattern**: Compatibility shims for breaking changes
4. **Version Markers**: Tool API version in config for compatibility checks

### Three-Phase Migration

#### Phase A: Addition (Months 1-3)
- Add new features alongside existing code
- No removals, only additions
- Mark old patterns as "legacy" in comments
- New tools use new patterns
- Old tools continue working

#### Phase B: Deprecation (Months 4-9)
- Add console warnings for deprecated APIs
- Update documentation to show "new way"
- Provide migration guides
- Gradually migrate existing tools
- Both old and new APIs work

#### Phase C: Removal (Month 10 - v2.0)
- Remove deprecated APIs
- Major version bump (v2.0)
- Complete documentation update
- All tools use new patterns

### Breaking Change Mitigation

**For Type Changes** (Phase 1.3):
```typescript
// Provide compatibility type
type ToolLegacy = string;
type ToolNew = 'pencil' | 'eraser' | 'bucket' | ...;

// Accept both during migration
function setActiveTool(tool: ToolLegacy | ToolNew): void {
  // Implementation accepts both
}
```

**For Config Changes** (Phase 1.1):
```typescript
// Old config still works
interface ToolConfig { ... }

// New config extends old
interface ToolConfigExtended extends ToolConfig {
  version: string;
  // ... new fields
}

// BaseTool accepts both
public abstract readonly config: ToolConfig | ToolConfigExtended;
```

---

## Success Metrics

### Quantitative Metrics

| Metric | Current | Target | Phase |
|--------|---------|--------|-------|
| Test Coverage | 0% | >80% | Phase 2.3 |
| Type Safety | ~85% | 100% | Phase 1.3 |
| Tool Activation Time | ~20ms | <16ms | Phase 4.2 |
| Bundle Size (tools) | ~45KB | <50KB | Phase 4.2 |
| Tools Documented | ~60% | 100% | Phase 4.1 |
| API "any" Count | 5 | 0 | Phase 1.3 |

### Qualitative Metrics

**Developer Experience**:
- ✅ New tool created in <30 minutes
- ✅ Tool options added without modifying BaseTool
- ✅ Clear error messages guide debugging
- ✅ Tests are easy to write

**Extensibility**:
- ✅ Custom tools don't require core changes
- ✅ Tool variants created without duplication
- ✅ Third-party tools possible (future)

**Maintainability**:
- ✅ Single Responsibility Principle followed
- ✅ Dependencies clearly defined
- ✅ Code is self-documenting

**User Experience**:
- ✅ Tool settings persist between sessions
- ✅ Validation errors are actionable
- ✅ Tool performance is imperceptible
- ✅ In-app help is comprehensive

---

## Risk Assessment

### High Risk Items

#### 1. Type System Overhaul (Phase 1.3)
**Risk**: Breaking changes cause widespread compilation errors
**Impact**: HIGH - Affects entire codebase
**Probability**: MEDIUM

**Mitigation**:
- Incremental rollout with feature flags
- Comprehensive test suite before changes
- Backward compatibility shims
- Detailed migration guide
- Auto-migration script where possible

**Contingency**:
- Keep old type system in parallel
- Gradual file-by-file migration
- Rollback plan if issues arise

---

#### 2. State Management Complexity (Phase 1.2)
**Risk**: Reactivity issues with Svelte 5 runes, state sync bugs
**Impact**: HIGH - Core feature
**Probability**: MEDIUM

**Mitigation**:
- Thorough testing of reactivity edge cases
- Clear documentation on state patterns
- Console warnings for misuse
- State validation on load

**Contingency**:
- Simpler localStorage-only approach
- Disable persistence if bugs detected
- Fallback to in-memory state

---

### Medium Risk Items

#### 3. Event System Performance (Phase 2.1)
**Risk**: Too many event listeners cause memory leaks or slowdown
**Impact**: MEDIUM - Performance degradation
**Probability**: LOW

**Mitigation**:
- Weak references where appropriate
- Automatic cleanup on tool deactivate
- Performance monitoring
- Event throttling/debouncing

---

#### 4. Testing Infrastructure (Phase 2.3)
**Risk**: Tests become flaky or hard to maintain
**Impact**: MEDIUM - Slows development
**Probability**: MEDIUM

**Mitigation**:
- Clear testing patterns
- Good test fixtures
- Isolated test environment
- CI/CD integration from start

---

### Low Risk Items

#### 5. Documentation Generation (Phase 4.1)
**Risk**: Generated docs are unclear or incomplete
**Impact**: LOW - Docs can be manually improved
**Probability**: LOW

**Mitigation**:
- Review generated docs
- Manual overrides supported
- Templates are customizable

---

#### 6. Performance Optimizations (Phase 4.2)
**Risk**: Optimizations introduce bugs
**Impact**: LOW - Not critical path
**Probability**: LOW

**Mitigation**:
- Comprehensive benchmarks
- A/B testing optimizations
- Easy to disable lazy loading

---

## Immediate Action Items

### Quick Wins (Can Do Now)

#### 1. Fix Type Inconsistency ⚡ 5 minutes
**File**: `/src/lib/types/canvas.types.ts`

```typescript
// Remove non-existent tools
export type Tool =
  | 'pencil'
  | 'eraser'
  | 'bucket'
  | 'eyedropper'
  | 'move'
  | 'hand';
  // REMOVED: 'zoom', 'rectangle', 'ellipse', 'select'
```

**Impact**: Prevents referencing non-existent tools
**Risk**: None
**Priority**: DO NOW

---

#### 2. Complete EyedropperTool ⚡ 30 minutes
**File**: `/src/lib/tools/implementations/EyedropperTool.ts`

Add colorStore integration:
```typescript
onClick(mouseContext: MouseEventContext, toolContext: ToolContext): void {
  const { x, y, button } = mouseContext;
  const colorIndex = toolContext.getPixel(x, y);

  // Set primary or secondary color based on button
  if (button === 0) {
    colorStore.setPrimaryColor(colorIndex);
  } else if (button === 2) {
    colorStore.setSecondaryColor(colorIndex);
  }
}
```

**Impact**: Completes a half-finished tool
**Risk**: Low
**Priority**: DO TODAY

---

#### 3. Remove Debug Console.logs ⚡ 10 minutes

Remove or wrap in DEBUG flag:
- `/src/lib/components/organisms/editor/Toolbar.svelte:46`
- `/src/lib/tools/implementations/EyedropperTool.ts:35`

**Impact**: Cleaner production code
**Risk**: None
**Priority**: DO TODAY

---

### This Week

#### 4. Implement Tool State Management 🔨 6-8 hours
**See**: Phase 1.2 detailed plan above

**Why First**: Critical for user experience, foundational for other features

**Steps**:
1. Create `ToolStateManager.svelte.ts`
2. Add to ToolContext
3. Update BaseTool with state helpers
4. Test persistence

**Deliverable**: Tool settings persist between sessions

---

#### 5. Add Tool Options System 🔨 4-6 hours
**See**: Phase 1.1 detailed plan above

**Why Next**: Enables configurable tools (brush size, etc.)

**Steps**:
1. Create `ToolOptions.ts` and `ToolMetadata.ts`
2. Update BaseTool config
3. Create `ToolOptionsPanel.svelte`
4. Integrate into UI

**Deliverable**: Pencil tool has configurable brush size

---

### This Month

#### 6. Enhanced Type Safety 🔨 3-4 hours
**See**: Phase 1.3 detailed plan above

**Why Important**: Prevents bugs, better DX

**Steps**:
1. Create type generation script
2. Generate Tool type from implementations
3. Fix type errors
4. Add to build process

**Deliverable**: Zero "any" types in tool system, type-safe tool IDs

---

## Conclusion

This roadmap provides a comprehensive, phased approach to transforming inline.px's tool system into a professional-grade, future-proof architecture.

**Key Takeaways**:

1. **Current State is Solid**: Clean architecture with no legacy code
2. **Clear Path Forward**: 10 phases with detailed implementation plans
3. **Prioritized Work**: Critical foundation (Phases 1-2) before polish (Phases 3-4)
4. **Manageable Scope**: Each phase is 3-8 hours of focused work
5. **Low Risk**: Incremental changes with backward compatibility
6. **High Impact**: Significant improvements to extensibility, type safety, and DX

**Recommended Start**:
1. Quick wins (Type fix, EyedropperTool) - TODAY
2. Phase 1.2 (State Management) - THIS WEEK
3. Phase 1.1 (Tool Options) - THIS WEEK
4. Phase 1.3 (Type Safety) - NEXT WEEK

**Total Estimated Time for Phase 1**: 15-20 hours of focused development

The system will be **dramatically improved** after just Phase 1, with the remaining phases adding polish and advanced features over time.

---

**Document Version**: 1.0
**Last Updated**: 2025-12-05
**Next Review**: After Phase 1 completion