<script>
	/**
	 * MenuButton - Atomic UI Component
	 *
	 * Reusable menu button with icon, label, and keyboard shortcut display.
	 * Replaces the monolithic HTML button structure from index.html.
	 *
	 * @component
	 */
	import * as icons from '@lucide/svelte';

	/** @type {string} Icon name from @lucide/svelte */
	export let icon = 'FileText';

	/** @type {string} Button label */
	export let label = 'Action';

	/** @type {string | null} Keyboard shortcut to display */
	export let shortcut = null;

	/** @type {string} Button variant */
	export let variant = 'default'; // 'default' | 'danger' | 'primary'

	/** @type {boolean} Disabled state */
	export let disabled = false;

	/** @type {string} Tooltip text */
	export let title = '';

	/** @type {() => void} Click handler */
	export let onclick = () => {};

	// Get icon component dynamically
	const IconComponent = icons[icon] || icons.FileText;

	// Derive CSS classes reactively
	$: classes = `menu-btn ${variant === 'danger' ? 'menu-btn-danger' : ''} ${
		variant === 'primary' ? 'menu-btn-primary' : ''
	}`;
</script>

<button class={classes} {title} {disabled} on:click={onclick}>
	<svelte:component this={IconComponent} size={18} />
	<span class="menu-btn-label">{label}</span>
	{#if shortcut}
		<span class="menu-btn-shortcut">{shortcut}</span>
	{/if}
</button>

<style>
	.menu-btn {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 8px 16px;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: var(--radius-md);
		color: var(--text-primary);
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		transition: all 0.15s ease;
		white-space: nowrap;
	}

	.menu-btn:hover:not(:disabled) {
		background: var(--bg-tertiary);
		border-color: var(--border-hover);
	}

	.menu-btn:active:not(:disabled) {
		transform: scale(0.98);
	}

	.menu-btn:disabled {
		opacity: 0.5;
		cursor: not-allowed;
	}

	.menu-btn-danger {
		color: var(--danger-text);
		border-color: var(--danger-border);
	}

	.menu-btn-danger:hover:not(:disabled) {
		background: var(--danger-bg);
		border-color: var(--danger-border-hover);
	}

	.menu-btn-primary {
		background: var(--primary);
		color: white;
		border-color: var(--primary);
	}

	.menu-btn-primary:hover:not(:disabled) {
		background: var(--primary-hover);
		border-color: var(--primary-hover);
	}

	.menu-btn-label {
		flex: 1;
	}

	.menu-btn-shortcut {
		font-size: 11px;
		opacity: 0.6;
		background: var(--bg-tertiary);
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		font-family: monospace;
	}

	/* Lucide icon wrapper */
	.menu-btn :global(svg) {
		flex-shrink: 0;
	}
</style>
