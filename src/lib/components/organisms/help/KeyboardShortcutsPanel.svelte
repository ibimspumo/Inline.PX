<!--
  @component KeyboardShortcutsPanel

  Displays all available keyboard shortcuts in the application.

  @example
  ```svelte
  <KeyboardShortcutsPanel
    isOpen={showShortcuts}
    onclose={() => showShortcuts = false}
  />
  ```

  @remarks
  - Shows tool shortcuts organized by category
  - Shows application-wide shortcuts
  - Searchable list
  - Keyboard shortcut: ? to open
-->
<script lang="ts">
	import { X, Keyboard, Search } from '@lucide/svelte';
	import { toolRegistry } from '$lib/tools/registry/ToolRegistry';
	import { categoryRegistry } from '$lib/tools/base/ToolCategories';

	/**
	 * Props interface for KeyboardShortcutsPanel component
	 */
	interface Props {
		/** Whether the panel is visible */
		isOpen: boolean;
		/** Callback when panel is closed */
		onclose?: () => void;
	}

	let { isOpen = false, onclose }: Props = $props();

	// Local state
	let searchQuery = $state('');

	/**
	 * Application-wide shortcuts
	 */
	const appShortcuts = [
		{ key: 'F1', description: 'Open Help Panel', category: 'General' },
		{ key: '?', description: 'Show Keyboard Shortcuts', category: 'General' },
		{ key: 'Escape', description: 'Close Dialog/Panel', category: 'General' },
		{ key: 'X', description: 'Swap Primary/Secondary Colors', category: 'Colors' },
		{ key: 'Cmd/Ctrl + K', description: 'Search Tools', category: 'Tools' }
	];

	/**
	 * Get all tool shortcuts organized by category
	 */
	let toolShortcuts = $derived(() => {
		const tools = toolRegistry.getAllTools();
		const shortcuts: Record<string, Array<{ key: string; description: string; tool: string }>> = {};

		for (const tool of tools) {
			if (tool.config.shortcut) {
				const category = tool.config.category;
				const categoryConfig = categoryRegistry.getCategory(category);
				const categoryName = categoryConfig?.name || category;

				if (!shortcuts[categoryName]) {
					shortcuts[categoryName] = [];
				}

				shortcuts[categoryName].push({
					key: tool.config.shortcut,
					description: tool.config.description,
					tool: tool.config.name
				});
			}
		}

		return shortcuts;
	});

	/**
	 * Filter shortcuts based on search query
	 */
	let filteredAppShortcuts = $derived(() => {
		if (!searchQuery.trim()) {
			return appShortcuts;
		}

		const query = searchQuery.toLowerCase();
		return appShortcuts.filter(
			(s) =>
				s.key.toLowerCase().includes(query) ||
				s.description.toLowerCase().includes(query) ||
				s.category.toLowerCase().includes(query)
		);
	});

	let filteredToolShortcuts = $derived(() => {
		if (!searchQuery.trim()) {
			return toolShortcuts();
		}

		const query = searchQuery.toLowerCase();
		const filtered: Record<string, Array<{ key: string; description: string; tool: string }>> = {};

		for (const [category, shortcuts] of Object.entries(toolShortcuts())) {
			const matchingShortcuts = shortcuts.filter(
				(s) =>
					s.key.toLowerCase().includes(query) ||
					s.description.toLowerCase().includes(query) ||
					s.tool.toLowerCase().includes(query) ||
					category.toLowerCase().includes(query)
			);

			if (matchingShortcuts.length > 0) {
				filtered[category] = matchingShortcuts;
			}
		}

		return filtered;
	});

	/**
	 * Handle close button click
	 */
	function handleClose() {
		onclose?.();
		searchQuery = '';
	}
</script>

{#if isOpen}
	<div class="shortcuts-overlay" onclick={handleClose}>
		<div class="shortcuts-panel" onclick={(e) => e.stopPropagation()}>
			<!-- Header -->
			<div class="shortcuts-header">
				<div class="shortcuts-title">
					<Keyboard size={24} />
					<h2>Keyboard Shortcuts</h2>
				</div>
				<button class="close-button" onclick={handleClose} title="Close (Esc)">
					<X size={20} />
				</button>
			</div>

			<!-- Search -->
			<div class="search-box">
				<Search size={16} />
				<input
					type="text"
					placeholder="Search shortcuts..."
					bind:value={searchQuery}
					class="search-input"
				/>
			</div>

			<!-- Content -->
			<div class="shortcuts-content">
				<!-- Application Shortcuts -->
				{#if filteredAppShortcuts().length > 0}
					<div class="shortcuts-section">
						<h3>Application</h3>

						{#each Object.entries(
							filteredAppShortcuts().reduce(
								(acc, s) => {
									if (!acc[s.category]) acc[s.category] = [];
									acc[s.category].push(s);
									return acc;
								},
								{} as Record<string, typeof appShortcuts>
							)
						) as [category, shortcuts]}
							<div class="shortcuts-category">
								<h4>{category}</h4>
								<div class="shortcuts-list">
									{#each shortcuts as shortcut}
										<div class="shortcut-item">
											<kbd class="shortcut-key">{shortcut.key}</kbd>
											<span class="shortcut-description">{shortcut.description}</span>
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				{/if}

				<!-- Tool Shortcuts -->
				{#if Object.keys(filteredToolShortcuts()).length > 0}
					<div class="shortcuts-section">
						<h3>Tools</h3>

						{#each Object.entries(filteredToolShortcuts()) as [category, shortcuts]}
							<div class="shortcuts-category">
								<h4>{category}</h4>
								<div class="shortcuts-list">
									{#each shortcuts as shortcut}
										<div class="shortcut-item">
											<kbd class="shortcut-key">{shortcut.key}</kbd>
											<div class="shortcut-info">
												<span class="shortcut-tool">{shortcut.tool}</span>
												<span class="shortcut-description">{shortcut.description}</span>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				{/if}

				{#if filteredAppShortcuts().length === 0 && Object.keys(filteredToolShortcuts()).length === 0}
					<div class="no-results">No shortcuts found</div>
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	.shortcuts-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		z-index: 1000;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 20px;
	}

	.shortcuts-panel {
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 8px;
		width: 100%;
		max-width: 800px;
		height: 80vh;
		max-height: 700px;
		display: flex;
		flex-direction: column;
		box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
	}

	.shortcuts-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 16px 20px;
		border-bottom: 1px solid var(--color-border);
	}

	.shortcuts-title {
		display: flex;
		align-items: center;
		gap: 12px;
		color: var(--color-text-primary);
	}

	.shortcuts-title h2 {
		margin: 0;
		font-size: 18px;
		font-weight: 600;
	}

	.close-button {
		background: none;
		border: none;
		padding: 8px;
		cursor: pointer;
		border-radius: 4px;
		color: var(--color-text-secondary);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.2s;
	}

	.close-button:hover {
		background: var(--color-bg-hover);
		color: var(--color-text-primary);
	}

	.search-box {
		padding: 16px 20px;
		display: flex;
		align-items: center;
		gap: 8px;
		border-bottom: 1px solid var(--color-border);
		color: var(--color-text-secondary);
	}

	.search-input {
		flex: 1;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		padding: 6px 10px;
		color: var(--color-text-primary);
		font-size: 14px;
	}

	.search-input::placeholder {
		color: var(--color-text-tertiary);
	}

	.search-input:focus {
		outline: none;
		border-color: var(--color-accent);
	}

	.shortcuts-content {
		flex: 1;
		overflow-y: auto;
		padding: 20px;
	}

	.shortcuts-section {
		margin-bottom: 32px;
	}

	.shortcuts-section:last-child {
		margin-bottom: 0;
	}

	.shortcuts-section h3 {
		margin: 0 0 16px 0;
		font-size: 16px;
		font-weight: 600;
		color: var(--color-text-primary);
		padding-bottom: 8px;
		border-bottom: 2px solid var(--color-accent);
	}

	.shortcuts-category {
		margin-bottom: 24px;
	}

	.shortcuts-category:last-child {
		margin-bottom: 0;
	}

	.shortcuts-category h4 {
		margin: 0 0 12px 0;
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.shortcuts-list {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	.shortcut-item {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 10px 12px;
		background: var(--color-bg-secondary);
		border-radius: 6px;
		transition: background 0.2s;
	}

	.shortcut-item:hover {
		background: var(--color-bg-hover);
	}

	.shortcut-key {
		min-width: 80px;
		padding: 6px 12px;
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: 4px;
		font-size: 13px;
		font-weight: 600;
		font-family: monospace;
		text-align: center;
		color: var(--color-text-primary);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	}

	.shortcut-info {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 4px;
	}

	.shortcut-tool {
		font-size: 14px;
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.shortcut-description {
		font-size: 13px;
		color: var(--color-text-secondary);
	}

	.no-results {
		padding: 40px 20px;
		text-align: center;
		color: var(--color-text-tertiary);
		font-size: 14px;
	}
</style>
