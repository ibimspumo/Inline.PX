/**
 * Tool Categories Configuration
 *
 * Extensible category system for organizing tools in the toolbar.
 * Categories can be customized with icons, colors, and display order.
 */

import type { IconName } from './ToolConfig';

/**
 * Category configuration interface
 */
export interface CategoryConfig {
	/** Unique category identifier */
	id: string;

	/** Display name */
	name: string;

	/** Category description */
	description: string;

	/** Icon for category header */
	icon?: IconName;

	/** Category color (CSS color value) */
	color?: string;

	/** Display order (lower = first) */
	order: number;

	/** Whether category is collapsible in UI */
	collapsible?: boolean;

	/** Whether category is collapsed by default */
	defaultCollapsed?: boolean;
}

/**
 * Built-in category configurations
 */
export const builtInCategories: CategoryConfig[] = [
	{
		id: 'view',
		name: 'View Tools',
		description: 'Tools for navigating and viewing the canvas',
		icon: 'Hand',
		color: '#10b981',
		order: 1,
		collapsible: true,
		defaultCollapsed: false
	},
	{
		id: 'draw',
		name: 'Drawing Tools',
		description: 'Tools for drawing and painting',
		icon: 'Pencil',
		color: '#3b82f6',
		order: 2,
		collapsible: true,
		defaultCollapsed: false
	},
	{
		id: 'edit',
		name: 'Editing Tools',
		description: 'Tools for modifying existing pixels',
		icon: 'Eraser',
		color: '#f59e0b',
		order: 3,
		collapsible: true,
		defaultCollapsed: false
	},
	{
		id: 'shape',
		name: 'Shape Tools',
		description: 'Tools for drawing geometric shapes',
		icon: 'Square',
		color: '#8b5cf6',
		order: 4,
		collapsible: true,
		defaultCollapsed: false
	},
	{
		id: 'select',
		name: 'Selection Tools',
		description: 'Tools for selecting regions',
		icon: 'Lasso',
		color: '#ec4899',
		order: 5,
		collapsible: true,
		defaultCollapsed: false
	}
];

/**
 * Category Registry
 *
 * Manages custom categories with extensibility
 */
export class CategoryRegistry {
	private categories = new Map<string, CategoryConfig>();

	constructor() {
		// Register built-in categories
		builtInCategories.forEach(cat => this.registerCategory(cat));
	}

	/**
	 * Register a category
	 */
	registerCategory(config: CategoryConfig): void {
		this.categories.set(config.id, config);
	}

	/**
	 * Get category configuration
	 */
	getCategory(id: string): CategoryConfig | undefined {
		return this.categories.get(id);
	}

	/**
	 * Get all categories sorted by order
	 */
	getAllCategories(): CategoryConfig[] {
		return Array.from(this.categories.values()).sort((a, b) => a.order - b.order);
	}

	/**
	 * Get category IDs in display order
	 */
	getCategoryOrder(): string[] {
		return this.getAllCategories().map(cat => cat.id);
	}

	/**
	 * Check if category exists
	 */
	hasCategory(id: string): boolean {
		return this.categories.has(id);
	}

	/**
	 * Unregister a category
	 */
	unregisterCategory(id: string): void {
		this.categories.delete(id);
	}

	/**
	 * Update category configuration
	 */
	updateCategory(id: string, updates: Partial<CategoryConfig>): void {
		const existing = this.categories.get(id);
		if (existing) {
			this.categories.set(id, { ...existing, ...updates });
		}
	}
}

// Export singleton instance
export const categoryRegistry = new CategoryRegistry();
