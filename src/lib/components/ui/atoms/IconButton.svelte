<script>
	/**
	 * IconButton - Atomic UI Component
	 *
	 * Icon-only button for actions (undo, redo, zoom, etc.).
	 * Compact design for toolbar use.
	 *
	 * @component
	 */
	import * as icons from '@lucide/svelte';

	/** @type {string} Icon name from @lucide/svelte */
	export let icon = 'Circle';

	/** @type {string} Tooltip text */
	export let title = '';

	/** @type {boolean} Is button disabled? */
	export let disabled = false;

	/** @type {string} Button size variant */
	export let size = 'default'; // 'small' | 'default' | 'large'

	/** @type {() => void} Click handler */
	export let onclick = () => {};

	// Get icon component dynamically
	const IconComponent = icons[icon] || icons.Circle;

	// Size mappings
	$: iconSize = size === 'small' ? 16 : size === 'large' ? 24 : 20;
	$: buttonClass = `icon-btn icon-btn-${size}`;
</script>

<button class={buttonClass} {title} {disabled} on:click={onclick}>
	<svelte:component this={IconComponent} size={iconSize} />
</button>

<style>
	.icon-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg-secondary);
		border: 1px solid var(--border);
		border-radius: var(--radius-sm);
		color: var(--text-primary);
		cursor: pointer;
		transition: all 0.15s ease;
		padding: 8px;
	}

	.icon-btn-small {
		padding: 6px;
	}

	.icon-btn-large {
		padding: 10px;
	}

	.icon-btn:hover:not(:disabled) {
		background: var(--bg-tertiary);
		border-color: var(--border-hover);
		color: var(--primary);
	}

	.icon-btn:active:not(:disabled) {
		transform: scale(0.95);
	}

	.icon-btn:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	.icon-btn :global(svg) {
		flex-shrink: 0;
	}
</style>
