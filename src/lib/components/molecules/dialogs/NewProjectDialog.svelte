<script lang="ts">
	import { PROJECT_SIZES, DEFAULT_PROJECT_SIZE, type ProjectSize } from '$lib/types/project.types';

	interface Props {
		onsubmit: (name: string, size: ProjectSize) => void;
		oncancel: () => void;
	}

	let { onsubmit, oncancel }: Props = $props();

	let projectName = $state('Untitled');
	let selectedSize = $state<ProjectSize>(DEFAULT_PROJECT_SIZE);

	function handleSubmit(e: Event) {
		e.preventDefault();
		if (projectName.trim()) {
			onsubmit(projectName.trim(), selectedSize);
		}
	}
</script>

<div class="dialog-overlay" onclick={oncancel}>
	<div class="dialog" onclick={(e) => e.stopPropagation()}>
		<div class="dialog-header">
			<h2 class="dialog-title">New Project</h2>
		</div>

		<form class="dialog-content" onsubmit={handleSubmit}>
			<div class="form-group">
				<label for="project-name" class="form-label">Project Name</label>
				<input
					id="project-name"
					type="text"
					class="form-input"
					bind:value={projectName}
					placeholder="Enter project name"
					autofocus
				/>
			</div>

			<div class="form-group">
				<label class="form-label">Canvas Size</label>
				<div class="size-grid">
					{#each PROJECT_SIZES as size}
						<button
							type="button"
							class="size-button"
							class:active={selectedSize === size}
							onclick={() => (selectedSize = size)}
						>
							<span class="size-value">{size}×{size}</span>
							<span class="size-pixels">{size * size} px</span>
						</button>
					{/each}
				</div>
			</div>

			<div class="dialog-actions">
				<button type="button" class="button button-secondary" onclick={oncancel}>Cancel</button>
				<button type="submit" class="button button-primary">Create Project</button>
			</div>
		</form>
	</div>
</div>

<style>
	.dialog-overlay {
		position: fixed;
		inset: 0;
		background-color: rgba(0, 0, 0, 0.7);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		backdrop-filter: blur(4px);
	}

	.dialog {
		background-color: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-lg);
		box-shadow: var(--shadow-lg);
		width: 90%;
		max-width: 500px;
		max-height: 90vh;
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.dialog-header {
		padding: var(--spacing-lg);
		border-bottom: 1px solid var(--color-border);
		background-color: var(--color-bg-tertiary);
	}

	.dialog-title {
		font-size: var(--font-size-xl);
		font-weight: 600;
		color: var(--color-text-primary);
		margin: 0;
	}

	.dialog-content {
		padding: var(--spacing-lg);
		overflow-y: auto;
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.form-label {
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.form-input {
		padding: var(--spacing-sm) var(--spacing-md);
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--font-size-md);
		font-family: inherit;
		transition: all var(--transition-fast);
	}

	.form-input:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
	}

	.size-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
		gap: var(--spacing-sm);
	}

	.size-button {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--spacing-xs);
		padding: var(--spacing-md);
		background-color: var(--color-bg-elevated);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all var(--transition-fast);
		color: var(--color-text-primary);
		font-family: inherit;
	}

	.size-button:hover {
		border-color: var(--color-accent);
		background-color: var(--color-bg-tertiary);
	}

	.size-button.active {
		border-color: var(--color-accent);
		background-color: var(--color-accent);
		color: white;
	}

	.size-value {
		font-size: var(--font-size-lg);
		font-weight: 600;
		font-family: var(--font-mono);
	}

	.size-pixels {
		font-size: var(--font-size-xs);
		opacity: 0.8;
	}

	.dialog-actions {
		display: flex;
		gap: var(--spacing-sm);
		justify-content: flex-end;
		padding-top: var(--spacing-md);
		border-top: 1px solid var(--color-border);
	}

	.button {
		padding: var(--spacing-sm) var(--spacing-lg);
		border-radius: var(--radius-md);
		font-size: var(--font-size-md);
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast);
		border: none;
		font-family: inherit;
	}

	.button-secondary {
		background-color: var(--color-bg-elevated);
		color: var(--color-text-primary);
		border: 1px solid var(--color-border);
	}

	.button-secondary:hover {
		background-color: var(--color-bg-tertiary);
	}

	.button-primary {
		background-color: var(--color-accent);
		color: white;
	}

	.button-primary:hover {
		background-color: var(--color-accent-hover);
	}
</style>
