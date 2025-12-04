<script>
	/**
	 * App.svelte - Main Application Entry Point
	 *
	 * This is a minimal test entry point for verifying the Svelte 5 setup.
	 * The full UI will be built incrementally using atomic components.
	 */
	import MenuButton from '$lib/components/ui/atoms/MenuButton.svelte';
	import { editor } from '$lib/stores/editor-simple.svelte.js';

	// Subscribe to stores directly
	const canvasStore = editor.canvas;
	const toolStore = editor.tool;
	const fileStore = editor.file;

	function handleNew() {
		editor.canvas.clear();
		editor.file.setFileName('Untitled');
		editor.file.markClean();
		console.log('New file created');
	}

	function handleSave() {
		console.log('Save clicked');
	}

	function handleGridToggle() {
		editor.canvas.toggleGrid();
	}
</script>

<div class="app">
	<header class="menu-bar">
		<div class="menu-section">
			<MenuButton icon="FileText" label="New" shortcut="Ctrl+N" onclick={handleNew} />
			<MenuButton icon="Save" label="Save" shortcut="Ctrl+S" onclick={handleSave} />
			<MenuButton
				icon="Grid3x3"
				label="Grid"
				shortcut="G"
				variant={$canvasStore.gridVisible ? 'primary' : 'default'}
				onclick={handleGridToggle}
			/>
		</div>
	</header>

	<main class="workspace">
		<div class="canvas-placeholder">
			<p>Canvas will render here</p>
			<p>✨ Svelte 5 Setup Complete ✨</p>
		</div>
	</main>

	<aside class="info-panel">
		<div class="info-group">
			<span class="info-label">File:</span>
			<span class="info-value">{$fileStore.currentFileName}</span>
			{#if $fileStore.isDirty}
				<span class="dirty-indicator">●</span>
			{/if}
		</div>
		<div class="info-group">
			<span class="info-label">Size:</span>
			<span class="info-value">{$canvasStore.width}×{$canvasStore.height}</span>
		</div>
		<div class="info-group">
			<span class="info-label">Tool:</span>
			<span class="info-value">{$toolStore.currentToolId}</span>
		</div>
	</aside>
</div>

<style>
	:global(:root) {
		/* CSS Variables - Match existing theme */
		--bg-primary: #0f0f0f;
		--bg-secondary: #1a1a1a;
		--bg-tertiary: #2a2a2a;
		--text-primary: #ffffff;
		--text-secondary: #a0a0a0;
		--border: #333333;
		--border-hover: #444444;
		--primary: #4a9eff;
		--primary-hover: #3a8eef;
		--danger-text: #ff4a4a;
		--danger-bg: rgba(255, 74, 74, 0.1);
		--danger-border: #ff4a4a;
		--danger-border-hover: #ff6a6a;
		--canvas-bg: #0a0a0a;
		--radius-sm: 4px;
		--radius-md: 6px;
		--radius-lg: 8px;
	}

	:global(body) {
		margin: 0;
		padding: 0;
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
			sans-serif;
		background: var(--bg-primary);
		color: var(--text-primary);
	}

	.app {
		display: grid;
		grid-template-rows: auto 1fr auto;
		height: 100vh;
		width: 100vw;
		overflow: hidden;
	}

	.menu-bar {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 12px 16px;
		background: var(--bg-secondary);
		border-bottom: 1px solid var(--border);
	}

	.menu-section {
		display: flex;
		gap: 8px;
	}

	.workspace {
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--canvas-bg);
		padding: 24px;
		overflow: hidden;
	}

	.canvas-placeholder {
		width: 100%;
		height: 100%;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 16px;
		font-size: 20px;
		color: var(--text-secondary);
	}

	.info-panel {
		display: flex;
		align-items: center;
		gap: 24px;
		padding: 12px 16px;
		background: var(--bg-secondary);
		border-top: 1px solid var(--border);
	}

	.info-group {
		display: flex;
		align-items: center;
		gap: 8px;
	}

	.info-label {
		font-size: 12px;
		color: var(--text-secondary);
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.info-value {
		font-size: 14px;
		font-weight: 500;
		font-family: 'Courier New', monospace;
	}

	.dirty-indicator {
		color: var(--danger-text);
		font-size: 20px;
		line-height: 1;
	}
</style>
