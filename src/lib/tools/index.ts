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

// Registry
export { toolRegistry } from './registry/ToolRegistry';
export { loadAllTools, loadToolsSync } from './registry/ToolLoader';

// Utils
export { resolveIcon } from './utils/iconResolver.svelte';
