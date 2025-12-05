<!--
  @component Toolbar

  Dynamic toolbar that automatically displays all registered tools organized by category.
  Tools are loaded from the tool registry and grouped by their category configuration.
  Keyboard shortcuts are automatically shown in tooltips.

  @example
  ```svelte
  <Toolbar />
  ```

  @remarks
  - Fixed width: 52px for compact layout
  - Tool groups dynamically generated from tool registry
  - Categories: draw, edit, select, view, shape
  - Connected to canvasStore.activeTool for global tool state
  - Keyboard shortcuts automatically shown in tooltips from tool config
  - Active tool displays with accent background
  - Auto-updates when new tools are registered
  - Tools sorted by category and order
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { canvasStore } from '$lib/stores/canvasStore.svelte';
	import IconButton from '$lib/components/atoms/buttons/IconButton.svelte';
	import Divider from '$lib/components/atoms/display/Divider.svelte';
	import { toolRegistry, loadAllTools } from '$lib/tools';
	import type { ToolCategory } from '$lib/tools';

	let toolsLoaded = $state(false);
	let toolsByCategory = $state<Map<ToolCategory, any[]>>(new Map());

	// Category display order
	const categoryOrder: ToolCategory[] = ['view', 'draw', 'edit', 'shape', 'select'];

	onMount(async () => {
		// Load tools if not already loaded
		if (toolRegistry.count === 0) {
			await loadAllTools();
		}

		// Get tools grouped by category
		toolsByCategory = toolRegistry.getToolsGroupedByCategory();
		toolsLoaded = true;

		console.log('Toolbar: Loaded tools by category:', toolsByCategory);
	});

	/**
	 * Get tooltip text for a tool
	 */
	function getToolTooltip(tool: any): string {
		const shortcut = tool.config.shortcut ? ` (${tool.config.shortcut})` : '';
		return `${tool.config.name}${shortcut}`;
	}

	/**
	 * Handle tool selection
	 */
	function selectTool(toolId: string) {
		canvasStore.setActiveTool(toolId as any);
	}

	/**
	 * Get filtered and ordered categories with tools
	 */
	function getOrderedCategories(): ToolCategory[] {
		return categoryOrder.filter(category => toolsByCategory.has(category));
	}
</script>

<div class="toolbar">
	{#if !toolsLoaded}
		<div class="toolbar-loading">Loading tools...</div>
	{:else}
		{#each getOrderedCategories() as category, index}
			{#if index > 0}
				<Divider orientation="horizontal" />
			{/if}

			<div class="toolbar-section">
				{#each toolsByCategory.get(category) || [] as tool}
					<IconButton
						icon={tool.config.icon}
						title={getToolTooltip(tool)}
						active={canvasStore.activeTool === tool.config.id}
						onclick={() => selectTool(tool.config.id)}
					/>
				{/each}
			</div>
		{/each}
	{/if}
</div>

<style>
	.toolbar {
		display: flex;
		flex-direction: column;
		width: 52px;
		background-color: var(--color-bg-secondary);
		border-right: 1px solid var(--color-border);
		padding: var(--spacing-sm);
		gap: var(--spacing-xs);
		user-select: none;
	}

	.toolbar-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.toolbar-loading {
		padding: var(--spacing-sm);
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
		text-align: center;
	}
</style>
