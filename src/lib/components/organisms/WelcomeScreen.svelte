<script lang="ts">
	import { FileText, Upload, FolderOpen } from '@lucide/svelte';
	import NewProjectDialog from '$lib/components/molecules/dialogs/NewProjectDialog.svelte';
	import ImportDialog from '$lib/components/molecules/dialogs/ImportDialog.svelte';
	import { projectStore } from '$lib/stores/projectStore.svelte';
	import { canvasStore } from '$lib/stores/canvasStore.svelte';
	import { loadProjectFromFile } from '$lib/utils/projectIO';
	import type { ProjectSize } from '$lib/types/project.types';

	let showNewDialog = $state(false);
	let showImportDialog = $state(false);

	function handleNewProject(name: string, size: ProjectSize) {
		// Create project
		projectStore.createProject(name, size, size);

		// Resize canvas
		canvasStore.resizeCanvas(size, size);

		// Clear canvas
		canvasStore.clearCanvas();

		showNewDialog = false;
	}

	function handleImport(name: string, width: number, height: number, pixels: number[][]) {
		// Create project
		projectStore.createProject(name, width, height);

		// Resize canvas
		canvasStore.resizeCanvas(width, height);

		// Import pixels
		const activeLayer = canvasStore.activeLayer;
		if (activeLayer) {
			activeLayer.pixels = pixels;
		}

		showImportDialog = false;
	}

	async function handleLoadFile() {
		try {
			const projectData = await loadProjectFromFile();

			// Load project metadata
			projectStore.loadProject(projectData.metadata);

			// Decode and load canvas
			const { metadata, pixels } = await import('$lib/utils/projectIO').then((m) =>
				m.importProject(projectData)
			);

			// Resize canvas
			canvasStore.resizeCanvas(metadata.width, metadata.height);

			// Import pixels
			const activeLayer = canvasStore.activeLayer;
			if (activeLayer) {
				activeLayer.pixels = pixels;
			}
		} catch (error) {
			console.error('Failed to load file:', error);
			alert('Failed to load file. Please check the file format.');
		}
	}
</script>

<div class="welcome-screen">
	<div class="welcome-content">
		<div class="welcome-header">
			<h1 class="app-title">inline.px</h1>
			<p class="app-subtitle">Professional Pixel Art Editor</p>
		</div>

		<div class="action-cards">
			<button class="action-card" onclick={() => (showNewDialog = true)}>
				<div class="card-icon">
					<FileText size={32} />
				</div>
				<h3 class="card-title">New Project</h3>
				<p class="card-description">Create a new pixel art project from scratch</p>
			</button>

			<button class="action-card" onclick={() => (showImportDialog = true)}>
				<div class="card-icon">
					<Upload size={32} />
				</div>
				<h3 class="card-title">Import Base64</h3>
				<p class="card-description">Import from Base64 string</p>
			</button>

			<button class="action-card" onclick={handleLoadFile}>
				<div class="card-icon">
					<FolderOpen size={32} />
				</div>
				<h3 class="card-title">Open File</h3>
				<p class="card-description">Load an existing .inlinepx.json file</p>
			</button>
		</div>

		<div class="welcome-footer">
			<p class="footer-text">
				inline.px uses a 64-color indexed palette for ultra-compact Base64 storage
			</p>
		</div>
	</div>
</div>

{#if showNewDialog}
	<NewProjectDialog
		onsubmit={handleNewProject}
		oncancel={() => (showNewDialog = false)}
	/>
{/if}

{#if showImportDialog}
	<ImportDialog
		onsubmit={handleImport}
		oncancel={() => (showImportDialog = false)}
	/>
{/if}

<style>
	.welcome-screen {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100vw;
		height: 100vh;
		background: linear-gradient(135deg, var(--color-bg-primary) 0%, var(--color-bg-secondary) 100%);
		padding: var(--spacing-xl);
	}

	.welcome-content {
		max-width: 900px;
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xl);
	}

	.welcome-header {
		text-align: center;
		margin-bottom: var(--spacing-lg);
	}

	.app-title {
		font-size: 48px;
		font-weight: 700;
		color: var(--color-text-primary);
		margin: 0 0 var(--spacing-sm) 0;
		letter-spacing: 2px;
	}

	.app-subtitle {
		font-size: var(--font-size-lg);
		color: var(--color-text-secondary);
		margin: 0;
	}

	.action-cards {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: var(--spacing-lg);
	}

	.action-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-md);
		padding: var(--spacing-xl);
		background-color: var(--color-bg-secondary);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-lg);
		cursor: pointer;
		transition: all var(--transition-normal);
		text-align: center;
		color: inherit;
		font-family: inherit;
	}

	.action-card:hover {
		border-color: var(--color-accent);
		transform: translateY(-4px);
		box-shadow: var(--shadow-lg);
		background-color: var(--color-bg-tertiary);
	}

	.card-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 80px;
		height: 80px;
		background-color: var(--color-bg-elevated);
		border-radius: 50%;
		color: var(--color-accent);
		transition: all var(--transition-fast);
	}

	.action-card:hover .card-icon {
		background-color: var(--color-accent);
		color: white;
		transform: scale(1.1);
	}

	.card-title {
		font-size: var(--font-size-xl);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.card-description {
		font-size: var(--font-size-md);
		color: var(--color-text-secondary);
		margin: 0;
		line-height: 1.5;
	}

	.welcome-footer {
		text-align: center;
		padding-top: var(--spacing-lg);
		border-top: 1px solid var(--color-border);
	}

	.footer-text {
		font-size: var(--font-size-sm);
		color: var(--color-text-tertiary);
		margin: 0;
	}
</style>
