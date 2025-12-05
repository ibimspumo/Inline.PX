<script lang="ts">
	import { projectStore } from '$lib/stores/projectStore.svelte';
	import { canvasStore } from '$lib/stores/canvasStore.svelte';
	import { exportAsBase64 } from '$lib/utils/projectIO';
	import ExportBase64Dialog from '$lib/components/molecules/dialogs/ExportBase64Dialog.svelte';
	import ImportDialog from '$lib/components/molecules/dialogs/ImportDialog.svelte';

	let showFileMenu = $state(false);
	let showExportDialog = $state(false);
	let showImportDialog = $state(false);
	let exportedBase64 = $state('');

	function handleSave() {
		if (!projectStore.metadata) return;

		const base64 = exportAsBase64(canvasStore.width, canvasStore.height, canvasStore.layers);
		exportedBase64 = base64;
		showExportDialog = true;
		showFileMenu = false;
	}

	function handleLoad() {
		showImportDialog = true;
		showFileMenu = false;
	}

	function handleImportSubmit(name: string, width: number, height: number, pixels: number[][]) {
		// Update project name if provided
		if (projectStore.metadata) {
			projectStore.updateMetadata({ name });
		}

		// Resize canvas
		canvasStore.resizeCanvas(width, height);

		// Import pixels
		const activeLayer = canvasStore.activeLayer;
		if (activeLayer) {
			activeLayer.pixels = pixels;
		}

		showImportDialog = false;
	}
</script>

<div class="menubar">
	<div class="menu-items">
		<div class="menu-item-container">
			<button class="menu-item" onclick={() => (showFileMenu = !showFileMenu)}>File</button>
			{#if showFileMenu}
				<div class="dropdown-menu">
					<button class="dropdown-item" onclick={handleSave}>
						Export as Base64
						<span class="shortcut">Ctrl+E</span>
					</button>
					<button class="dropdown-item" onclick={handleLoad}>
						Import from Base64
						<span class="shortcut">Ctrl+I</span>
					</button>
				</div>
			{/if}
		</div>
		<button class="menu-item">Edit</button>
		<button class="menu-item">Image</button>
		<button class="menu-item">Layer</button>
		<button class="menu-item">View</button>
		<button class="menu-item">Help</button>
	</div>
	<div class="app-title">{projectStore.metadata?.name || 'inline.px'}</div>
</div>

{#if showFileMenu}
	<button class="menu-overlay" onclick={() => (showFileMenu = false)}></button>
{/if}

{#if showExportDialog}
	<ExportBase64Dialog
		base64String={exportedBase64}
		projectName={projectStore.metadata?.name || 'Untitled'}
		onclose={() => (showExportDialog = false)}
	/>
{/if}

{#if showImportDialog}
	<ImportDialog
		onsubmit={handleImportSubmit}
		oncancel={() => (showImportDialog = false)}
	/>
{/if}

<style>
	.menubar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		height: var(--menubar-height);
		background-color: var(--color-bg-tertiary);
		border-bottom: 1px solid var(--color-border);
		padding: 0 var(--spacing-md);
		user-select: none;
	}

	.menu-items {
		display: flex;
		gap: var(--spacing-xs);
	}

	.menu-item {
		background: transparent;
		border: none;
		color: var(--color-text-primary);
		padding: var(--spacing-xs) var(--spacing-md);
		font-size: var(--font-size-md);
		cursor: pointer;
		border-radius: var(--radius-sm);
		transition: background-color var(--transition-fast);
	}

	.menu-item:hover {
		background-color: var(--color-bg-elevated);
	}

	.app-title {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		font-weight: 600;
		letter-spacing: 1px;
	}

	.menu-item-container {
		position: relative;
	}

	.dropdown-menu {
		position: absolute;
		top: 100%;
		left: 0;
		min-width: 220px;
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		box-shadow: var(--shadow-lg);
		padding: var(--spacing-xs);
		z-index: 100;
		margin-top: 2px;
	}

	.dropdown-item {
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 100%;
		padding: var(--spacing-sm) var(--spacing-md);
		background: transparent;
		border: none;
		color: var(--color-text-primary);
		font-size: var(--font-size-md);
		text-align: left;
		cursor: pointer;
		border-radius: var(--radius-sm);
		transition: background-color var(--transition-fast);
		font-family: inherit;
	}

	.dropdown-item:hover {
		background-color: var(--color-accent);
		color: white;
	}

	.dropdown-divider {
		height: 1px;
		background-color: var(--color-border);
		margin: var(--spacing-xs) 0;
	}

	.shortcut {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		font-family: var(--font-mono);
	}

	.dropdown-item:hover .shortcut {
		color: rgba(255, 255, 255, 0.7);
	}

	.menu-overlay {
		position: fixed;
		inset: 0;
		background: transparent;
		border: none;
		padding: 0;
		z-index: 99;
		cursor: default;
	}
</style>
