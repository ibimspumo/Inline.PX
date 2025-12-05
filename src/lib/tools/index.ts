/**
 * Tools Module - Public API
 *
 * Centralized exports for the tool system.
 * Import from here in application code.
 */

// Base classes and interfaces
export { BaseTool } from './base/BaseTool';
export type { ToolConfig, ToolCategory, ToolCursor, ToolMetadata, IconName } from './base/ToolConfig';
export type { ToolContext, MouseEventContext, CanvasContext, ColorContext } from './base/ToolContext';
export type { ToolConfigExtended } from './base/ToolMetadata';
export type { CategoryConfig } from './base/ToolCategories';

// Registry
export { toolRegistry } from './registry/ToolRegistry';
export { loadAllTools, loadToolsSync } from './registry/ToolLoader';
export { categoryRegistry } from './base/ToolCategories';

// State Management
export { toolStateManager } from './state/ToolStateManager.svelte';

// Utils
export { resolveIcon } from './utils/iconResolver.svelte';
export { searchTools, filterByCategory, filterByTags, getAllTags } from './utils/toolSearch';
