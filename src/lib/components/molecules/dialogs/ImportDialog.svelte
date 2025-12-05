<script lang="ts">
	import { importFromBase64 } from '$lib/utils/projectIO';

	interface Props {
		onsubmit: (name: string, width: number, height: number, pixels: number[][]) => void;
		oncancel: () => void;
	}

	let { onsubmit, oncancel }: Props = $props();

	let projectName = $state('Imported Project');
	let base64Input = $state('');
	let errorMessage = $state<string | null>(null);

	function handleSubmit(e: Event) {
		e.preventDefault();
		errorMessage = null;

		if (!base64Input.trim()) {
			errorMessage = 'Please enter a Base64 string';
			return;
		}

		if (!projectName.trim()) {
			errorMessage = 'Please enter a project name';
			return;
		}

		try {
			const { width, height, pixels } = importFromBase64(base64Input.trim());
			onsubmit(projectName.trim(), width, height, pixels);
		} catch (error) {
			errorMessage = error instanceof Error ? error.message : 'Invalid Base64 format';
		}
	}
</script>

<div class="dialog-overlay" onclick={oncancel}>
	<div class="dialog" onclick={(e) => e.stopPropagation()}>
		<div class="dialog-header">
			<h2 class="dialog-title">Import from Base64</h2>
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
				/>
			</div>

			<div class="form-group">
				<label for="base64-input" class="form-label">
					Base64 String
					<span class="label-hint">(Format: WIDTHxHEIGHT:BASE64DATA)</span>
				</label>
				<textarea
					id="base64-input"
					class="form-textarea"
					bind:value={base64Input}
					placeholder="8x8:AAABBBCCC..."
					rows="6"
					autofocus
				></textarea>
				<span class="form-hint">Example: 8x8:AAABBBCCCDDDEEE...</span>
			</div>

			{#if errorMessage}
				<div class="error-message">
					{errorMessage}
				</div>
			{/if}

			<div class="dialog-actions">
				<button type="button" class="button button-secondary" onclick={oncancel}>Cancel</button>
				<button type="submit" class="button button-primary">Import</button>
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
		max-width: 600px;
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
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.label-hint {
		font-size: var(--font-size-xs);
		font-weight: 400;
		text-transform: none;
		opacity: 0.7;
	}

	.form-input,
	.form-textarea {
		padding: var(--spacing-sm) var(--spacing-md);
		background-color: var(--color-bg-elevated);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--font-size-md);
		font-family: inherit;
		transition: all var(--transition-fast);
	}

	.form-textarea {
		font-family: var(--font-mono);
		font-size: var(--font-size-sm);
		resize: vertical;
		min-height: 120px;
	}

	.form-input:focus,
	.form-textarea:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
	}

	.form-hint {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		font-family: var(--font-mono);
	}

	.error-message {
		padding: var(--spacing-md);
		background-color: rgba(244, 135, 113, 0.1);
		border: 1px solid var(--color-error);
		border-radius: var(--radius-md);
		color: var(--color-error);
		font-size: var(--font-size-sm);
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
