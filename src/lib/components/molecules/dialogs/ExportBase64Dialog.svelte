<script lang="ts">
	import { Copy, Check } from '@lucide/svelte';

	interface Props {
		base64String: string;
		projectName: string;
		onclose: () => void;
	}

	let { base64String, projectName, onclose }: Props = $props();

	let copied = $state(false);

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(base64String);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch (error) {
			console.error('Failed to copy:', error);
			alert('Failed to copy to clipboard');
		}
	}

	function handleSelectAll(e: Event) {
		const textarea = e.target as HTMLTextAreaElement;
		textarea.select();
	}
</script>

<div class="dialog-overlay" onclick={onclose}>
	<div class="dialog" onclick={(e) => e.stopPropagation()}>
		<div class="dialog-header">
			<h2 class="dialog-title">Export as Base64</h2>
			<p class="dialog-subtitle">{projectName}</p>
		</div>

		<div class="dialog-content">
			<div class="form-group">
				<div class="label-row">
					<label for="base64-output" class="form-label">Base64 String</label>
					<span class="info-text">{base64String.length} characters</span>
				</div>
				<textarea
					id="base64-output"
					class="form-textarea"
					readonly
					value={base64String}
					rows="8"
					onfocus={handleSelectAll}
				></textarea>
				<div class="hint-text">
					Select all and copy, or use the button below
				</div>
			</div>

			<button class="copy-button" onclick={handleCopy} disabled={copied}>
				{#if copied}
					<Check size={20} />
					<span>Copied to Clipboard!</span>
				{:else}
					<Copy size={20} />
					<span>Copy to Clipboard</span>
				{/if}
			</button>
		</div>

		<div class="dialog-actions">
			<button class="button button-primary" onclick={onclose}>Close</button>
		</div>
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
		max-width: 700px;
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
		margin: 0 0 var(--spacing-xs) 0;
	}

	.dialog-subtitle {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
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

	.label-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.form-label {
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.info-text {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		font-family: var(--font-mono);
	}

	.form-textarea {
		padding: var(--spacing-md);
		background-color: var(--color-bg-elevated);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-md);
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
		font-family: var(--font-mono);
		resize: vertical;
		min-height: 180px;
		line-height: 1.5;
		transition: all var(--transition-fast);
	}

	.form-textarea:focus {
		outline: none;
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
	}

	.hint-text {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
	}

	.copy-button {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-md) var(--spacing-lg);
		background-color: var(--color-accent);
		color: white;
		border: none;
		border-radius: var(--radius-md);
		font-size: var(--font-size-md);
		font-weight: 500;
		cursor: pointer;
		transition: all var(--transition-fast);
		font-family: inherit;
	}

	.copy-button:hover:not(:disabled) {
		background-color: var(--color-accent-hover);
		transform: translateY(-1px);
		box-shadow: var(--shadow-md);
	}

	.copy-button:disabled {
		background-color: var(--color-success);
		cursor: default;
	}

	.dialog-actions {
		display: flex;
		gap: var(--spacing-sm);
		justify-content: flex-end;
		padding: var(--spacing-lg);
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

	.button-primary {
		background-color: var(--color-bg-elevated);
		color: var(--color-text-primary);
		border: 1px solid var(--color-border);
	}

	.button-primary:hover {
		background-color: var(--color-bg-tertiary);
	}
</style>
