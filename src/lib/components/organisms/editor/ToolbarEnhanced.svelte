<!--
  @component ToolbarEnhanced

  Enhanced dynamic toolbar with search, favorites, recent tools, and category filtering.
  Automatically displays all registered tools organized by category with advanced features.

  @example
  ```svelte
  <ToolbarEnhanced />
  ```

  @remarks
  - Dynamic width: expands for search (200px), collapses for icons only (52px)
  - Search with Cmd+K / Ctrl+K keyboard shortcut
  - Favorites system with star icons
  - Recent tools quick access
  - Category filtering and collapsible sections
  - Connected to canvasStore.activeTool for global tool state
  - All features persist to localStorage
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { canvasStore } from '$lib/stores/canvasStore.svelte';
	import IconButton from '$lib/components/atoms/buttons/IconButton.svelte';
	import Divider from '$lib/components/atoms/display/Divider.svelte';
	import SearchInput from '$lib/components/atoms/input/SearchInput.svelte';
	import { toolRegistry, loadAllTools, toolStateManager } from '$lib/tools';
	import { resolveIcon } from '$lib/tools';
	import { searchTools } from '$lib/tools/utils/toolSearch';
	import { categoryRegistry } from '$lib/tools/base/ToolCategories';
	import type { ToolCategory } from '$lib/tools';
	import type { BaseTool } from '$lib/tools/base/BaseTool';
	import { Star, ChevronDown, ChevronRight, Clock, Search } from '@lucide/svelte/icons';

	let toolsLoaded = $state(false);
	let toolsByCategory = $state<Map<ToolCategory, any[]>>(new Map());
	let allTools = $state<BaseTool[]>([]);
	let searchQuery = $state('');
	let searchResults = $state<BaseTool[]>([]);
	let collapsedCategories = $state<Set<string>>(new Set());
	let showSearch = $state(false);

	// Get category order from registry
	let categoryOrder = $derived(categoryRegistry.getCategoryOrder() as ToolCategory[]);

	/**
	 * Initialize toolbar
	 */
	onMount(async () => {
		// Load tools (singleton pattern ensures only one load)
		await loadAllTools();

		// Initialize tool state manager
		toolStateManager.initialize();

		// Get all tools
		allTools = toolRegistry.getAllTools();

		// Get tools grouped by category
		toolsByCategory = toolRegistry.getToolsGroupedByCategory();
		toolsLoaded = true;
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
		toolStateManager.recordToolUsage(toolId);
	}

	/**
	 * Toggle favorite status
	 */
	function toggleFavorite(toolId: string, event: MouseEvent) {
		event.stopPropagation();
		toolStateManager.toggleFavorite(toolId);
	}

	/**
	 * Handle search query change
	 */
	function handleSearch(query: string) {
		searchQuery = query;

		if (query.trim()) {
			const results = searchTools(allTools, query);
			searchResults = results.map(r => r.tool);
		} else {
			searchResults = [];
		}
	}

	/**
	 * Toggle category collapsed state
	 */
	function toggleCategory(categoryId: string) {
		if (collapsedCategories.has(categoryId)) {
			collapsedCategories.delete(categoryId);
		} else {
			collapsedCategories.add(categoryId);
		}
		// Trigger reactivity
		collapsedCategories = new Set(collapsedCategories);
	}

	/**
	 * Get filtered and ordered categories with tools
	 */
	function getOrderedCategories(): ToolCategory[] {
		return categoryOrder.filter(category => toolsByCategory.has(category));
	}

	/**
	 * Get favorite tools
	 */
	let favoriteTools = $derived<BaseTool[]>(() => {
		const favoriteIds = toolStateManager.getFavorites();
		return allTools.filter(tool => favoriteIds.includes(tool.config.id));
	});

	/**
	 * Get recent tools
	 */
	let recentTools = $derived<BaseTool[]>(() => {
		const recentIds = toolStateManager.getRecentTools();
		return recentIds
			.map(id => allTools.find(tool => tool.config.id === id))
			.filter((tool): tool is BaseTool => tool !== undefined);
	});

	/**
	 * Check if tool is favorite
	 */
	function isFavorite(toolId: string): boolean {
		return toolStateManager.isFavorite(toolId);
	}

	/**
	 * Get category configuration
	 */
	function getCategoryConfig(categoryId: string) {
		return categoryRegistry.getCategory(categoryId);
	}

	/**
	 * Check if category is collapsed
	 */
	function isCategoryCollapsed(categoryId: string): boolean {
		return collapsedCategories.has(categoryId);
	}

	/**
	 * Get tools to display based on search
	 */
	let displayTools = $derived<BaseTool[]>(() => {
		if (searchQuery.trim()) {
			return searchResults;
		}
		return allTools;
	});

	/**
	 * Toggle search panel
	 */
	function toggleSearch() {
		showSearch = !showSearch;
		if (!showSearch) {
			searchQuery = '';
			searchResults = [];
		}
	}
</script>

<div class="toolbar" class:expanded={showSearch}>
	<div class="toolbar-header">
		<button
			class="search-toggle"
			onclick={toggleSearch}
			title="Search tools (Cmd+K)"
			class:active={showSearch}
		>
			<Search size={16} />
		</button>
	</div>

	{#if showSearch}
		<div class="search-section">
			<SearchInput
				bind:value={searchQuery}
				placeholder="Search tools..."
				onchange={handleSearch}
				shortcutHint="Cmd+K"
				autofocus={true}
			/>
		</div>
	{/if}

	{#if !toolsLoaded}
		<div class="toolbar-loading">Loading...</div>
	{:else if searchQuery.trim()}
		<!-- Search results -->
		<div class="toolbar-section">
			{#if searchResults.length === 0}
				<div class="no-results">No tools found</div>
			{:else}
				{#each searchResults as tool}
					<div class="tool-item">
						<IconButton
							icon={resolveIcon(tool.config.iconName)}
							title={getToolTooltip(tool)}
							active={canvasStore.activeTool === tool.config.id}
							onclick={() => selectTool(tool.config.id)}
						/>
						{#if showSearch}
							<span class="tool-name">{tool.config.name}</span>
						{/if}
						<button
							class="favorite-btn"
							class:favorited={isFavorite(tool.config.id)}
							onclick={(e) => toggleFavorite(tool.config.id, e)}
							title={isFavorite(tool.config.id) ? 'Remove from favorites' : 'Add to favorites'}
						>
							<Star size={12} fill={isFavorite(tool.config.id) ? 'currentColor' : 'none'} />
						</button>
					</div>
				{/each}
			{/if}
		</div>
	{:else}
		<!-- Favorites section -->
		{#if favoriteTools.length > 0}
			<div class="section-header">
				<Star size={14} />
				<span>Favorites</span>
			</div>
			<div class="toolbar-section">
				{#each favoriteTools as tool}
					<div class="tool-item">
						<IconButton
							icon={resolveIcon(tool.config.iconName)}
							title={getToolTooltip(tool)}
							active={canvasStore.activeTool === tool.config.id}
							onclick={() => selectTool(tool.config.id)}
						/>
						{#if showSearch}
							<span class="tool-name">{tool.config.name}</span>
						{/if}
						<button
							class="favorite-btn favorited"
							onclick={(e) => toggleFavorite(tool.config.id, e)}
							title="Remove from favorites"
						>
							<Star size={12} fill="currentColor" />
						</button>
					</div>
				{/each}
			</div>
			<Divider orientation="horizontal" />
		{/if}

		<!-- Recent tools section -->
		{#if recentTools.length > 0}
			<div class="section-header">
				<Clock size={14} />
				<span>Recent</span>
			</div>
			<div class="toolbar-section">
				{#each recentTools as tool}
					<div class="tool-item">
						<IconButton
							icon={resolveIcon(tool.config.iconName)}
							title={getToolTooltip(tool)}
							active={canvasStore.activeTool === tool.config.id}
							onclick={() => selectTool(tool.config.id)}
						/>
						{#if showSearch}
							<span class="tool-name">{tool.config.name}</span>
						{/if}
						<button
							class="favorite-btn"
							class:favorited={isFavorite(tool.config.id)}
							onclick={(e) => toggleFavorite(tool.config.id, e)}
							title={isFavorite(tool.config.id) ? 'Remove from favorites' : 'Add to favorites'}
						>
							<Star size={12} fill={isFavorite(tool.config.id) ? 'currentColor' : 'none'} />
						</button>
					</div>
				{/each}
			</div>
			<Divider orientation="horizontal" />
		{/if}

		<!-- Categories -->
		{#each getOrderedCategories() as category, index}
			{@const categoryConfig = getCategoryConfig(category)}
			{@const isCollapsed = isCategoryCollapsed(category)}
			{@const tools = toolsByCategory.get(category) || []}

			{#if index > 0 && (favoriteTools.length === 0 && recentTools.length === 0)}
				<Divider orientation="horizontal" />
			{/if}

			{#if categoryConfig}
				<button class="section-header collapsible" onclick={() => toggleCategory(category)}>
					{#if isCollapsed}
						<ChevronRight size={14} />
					{:else}
						<ChevronDown size={14} />
					{/if}
					<span>{categoryConfig.name}</span>
				</button>
			{/if}

			{#if !isCollapsed}
				<div class="toolbar-section">
					{#each tools as tool}
						<div class="tool-item">
							<IconButton
								icon={resolveIcon(tool.config.iconName)}
								title={getToolTooltip(tool)}
								active={canvasStore.activeTool === tool.config.id}
								onclick={() => selectTool(tool.config.id)}
							/>
							{#if showSearch}
								<span class="tool-name">{tool.config.name}</span>
							{/if}
							<button
								class="favorite-btn"
								class:favorited={isFavorite(tool.config.id)}
								onclick={(e) => toggleFavorite(tool.config.id, e)}
								title={isFavorite(tool.config.id) ? 'Remove from favorites' : 'Add to favorites'}
							>
								<Star size={12} fill={isFavorite(tool.config.id) ? 'currentColor' : 'none'} />
							</button>
						</div>
					{/each}
				</div>
			{/if}

			{#if !isCollapsed && index < getOrderedCategories().length - 1}
				<Divider orientation="horizontal" />
			{/if}
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
		transition: width 0.3s ease;
		overflow-y: auto;
		overflow-x: hidden;
	}

	.toolbar.expanded {
		width: 240px;
	}

	.toolbar-header {
		display: flex;
		align-items: center;
		justify-content: center;
		margin-bottom: var(--spacing-xs);
	}

	.search-toggle {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		background-color: var(--color-bg-tertiary);
		color: var(--color-text-secondary);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.search-toggle:hover {
		background-color: var(--color-bg-hover);
		color: var(--color-text-primary);
	}

	.search-toggle.active {
		background-color: var(--color-accent);
		color: white;
	}

	.search-section {
		padding: 0;
		margin-bottom: var(--spacing-sm);
	}

	.toolbar:not(.expanded) .search-section {
		display: none;
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

	.no-results {
		padding: var(--spacing-md);
		font-size: var(--font-size-sm);
		color: var(--color-text-tertiary);
		text-align: center;
	}

	.section-header {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-xs) var(--spacing-sm);
		font-size: 10px;
		font-weight: 600;
		color: var(--color-text-tertiary);
		text-transform: uppercase;
		letter-spacing: 0.08em;
		white-space: nowrap;
		overflow: hidden;
	}

	.toolbar:not(.expanded) .section-header span {
		display: none;
	}

	.section-header.collapsible {
		background: transparent;
		border: none;
		cursor: pointer;
		transition: all 0.2s ease;
		border-radius: var(--radius-sm);
		width: 100%;
		text-align: left;
	}

	.section-header.collapsible:hover {
		background-color: var(--color-bg-hover);
		color: var(--color-text-primary);
	}

	.tool-item {
		position: relative;
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		width: 100%;
	}

	.tool-name {
		flex: 1;
		font-size: var(--font-size-sm);
		color: var(--color-text-primary);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		user-select: none;
		pointer-events: none;
	}

	.favorite-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		min-width: 24px;
		height: 24px;
		border: none;
		background-color: transparent;
		color: var(--color-text-tertiary);
		border-radius: var(--radius-sm);
		cursor: pointer;
		opacity: 0;
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.toolbar.expanded .tool-item:hover .favorite-btn {
		opacity: 1;
	}

	.toolbar:not(.expanded) .favorite-btn {
		display: none;
	}

	.favorite-btn.favorited {
		opacity: 1;
		color: #fbbf24;
	}

	.favorite-btn:hover {
		background-color: var(--color-bg-hover);
		transform: scale(1.1);
	}

	.favorite-btn.favorited:hover {
		background-color: rgba(251, 191, 36, 0.15);
	}

	/* Scrollbar styling */
	.toolbar::-webkit-scrollbar {
		width: 6px;
	}

	.toolbar::-webkit-scrollbar-track {
		background: transparent;
	}

	.toolbar::-webkit-scrollbar-thumb {
		background: var(--color-border);
		border-radius: 3px;
	}

	.toolbar::-webkit-scrollbar-thumb:hover {
		background: var(--color-text-tertiary);
	}
</style>
