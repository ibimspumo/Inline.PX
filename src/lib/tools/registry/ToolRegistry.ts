/**
 * Tool Registry - Central registry for all tools
 *
 * Manages tool registration, lookup, and provides metadata for UI generation.
 * Implements singleton pattern for global access.
 */

import type { BaseTool } from '../base/BaseTool';
import type { ToolMetadata, ToolCategory } from '../base/ToolConfig';

/**
 * Tool Registry Class
 * Singleton that manages all registered tools
 */
class ToolRegistry {
	private static instance: ToolRegistry;
	private tools: Map<string, BaseTool> = new Map();

	private constructor() {
		// Private constructor for singleton
	}

	/**
	 * Get singleton instance
	 */
	public static getInstance(): ToolRegistry {
		if (!ToolRegistry.instance) {
			ToolRegistry.instance = new ToolRegistry();
		}
		return ToolRegistry.instance;
	}

	/**
	 * Register a new tool
	 * @param tool - Tool instance to register
	 */
	public register(tool: BaseTool): void {
		const id = tool.config.id;

		if (this.tools.has(id)) {
			console.warn(`Tool with id "${id}" is already registered. Overwriting.`);
		}

		this.tools.set(id, tool);
		console.log(`✓ Registered tool: ${tool.config.name} (${id})`);
	}

	/**
	 * Register multiple tools at once
	 * @param tools - Array of tool instances
	 */
	public registerMany(tools: BaseTool[]): void {
		tools.forEach(tool => this.register(tool));
	}

	/**
	 * Get tool by ID
	 * @param id - Tool ID
	 * @returns Tool instance or undefined
	 */
	public getTool(id: string): BaseTool | undefined {
		return this.tools.get(id);
	}

	/**
	 * Get all registered tools
	 * @returns Array of all tool instances
	 */
	public getAllTools(): BaseTool[] {
		return Array.from(this.tools.values());
	}

	/**
	 * Get all tool IDs
	 * @returns Array of tool IDs
	 */
	public getAllToolIds(): string[] {
		return Array.from(this.tools.keys());
	}

	/**
	 * Get tools by category
	 * @param category - Tool category
	 * @returns Array of tools in that category, sorted by order
	 */
	public getToolsByCategory(category: ToolCategory): BaseTool[] {
		return Array.from(this.tools.values())
			.filter(tool => tool.config.category === category)
			.sort((a, b) => a.config.order - b.config.order);
	}

	/**
	 * Get all tool categories with their tools
	 * @returns Map of category to tools
	 */
	public getToolsGroupedByCategory(): Map<ToolCategory, BaseTool[]> {
		const grouped = new Map<ToolCategory, BaseTool[]>();

		this.tools.forEach(tool => {
			const category = tool.config.category;
			if (!grouped.has(category)) {
				grouped.set(category, []);
			}
			grouped.get(category)!.push(tool);
		});

		// Sort tools within each category by order
		grouped.forEach((tools, category) => {
			grouped.set(category, tools.sort((a, b) => a.config.order - b.config.order));
		});

		return grouped;
	}

	/**
	 * Get tool metadata for UI purposes
	 * @returns Array of tool metadata
	 */
	public getToolMetadata(): ToolMetadata[] {
		return Array.from(this.tools.values()).map(tool => ({
			id: tool.config.id,
			name: tool.config.name,
			description: tool.config.description,
			iconName: tool.config.iconName,
			category: tool.config.category,
			shortcut: tool.config.shortcut,
			order: tool.config.order
		}));
	}

	/**
	 * Find tool by keyboard shortcut
	 * @param key - Keyboard key
	 * @returns Tool instance or undefined
	 */
	public getToolByShortcut(key: string): BaseTool | undefined {
		return Array.from(this.tools.values()).find(
			tool => tool.config.shortcut?.toLowerCase() === key.toLowerCase()
		);
	}

	/**
	 * Check if tool exists
	 * @param id - Tool ID
	 * @returns true if tool is registered
	 */
	public hasTool(id: string): boolean {
		return this.tools.has(id);
	}

	/**
	 * Unregister a tool (useful for testing)
	 * @param id - Tool ID
	 */
	public unregister(id: string): boolean {
		return this.tools.delete(id);
	}

	/**
	 * Clear all registered tools (useful for testing)
	 */
	public clear(): void {
		this.tools.clear();
	}

	/**
	 * Get count of registered tools
	 */
	public get count(): number {
		return this.tools.size;
	}
}

// Export singleton instance
export const toolRegistry = ToolRegistry.getInstance();
