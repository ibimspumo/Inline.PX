<script lang="ts">
	import type { Component } from 'svelte';

	interface Props {
		onclick?: () => void;
		title?: string;
		active?: boolean;
		disabled?: boolean;
		icon: Component;
		size?: 'sm' | 'md' | 'lg';
	}

	let { onclick, title, active = false, disabled = false, icon, size = 'md' }: Props = $props();
</script>

<button
	class="icon-button"
	class:active
	class:size-sm={size === 'sm'}
	class:size-md={size === 'md'}
	class:size-lg={size === 'lg'}
	{onclick}
	{title}
	{disabled}
>
	{#if icon}
		{@const Icon = icon}
		<Icon size={20} />
	{/if}
</button>

<style>
	.icon-button {
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		color: var(--color-text-primary);
		cursor: pointer;
		transition: all var(--transition-fast);
		border-radius: var(--radius-sm);
		flex-shrink: 0;
	}

	.icon-button:hover:not(:disabled) {
		background-color: var(--color-bg-elevated);
	}

	.icon-button:active:not(:disabled) {
		background-color: var(--color-border);
	}

	.icon-button.active {
		background-color: var(--color-accent);
		color: white;
	}

	.icon-button.active:hover:not(:disabled) {
		background-color: var(--color-accent-hover);
	}

	.icon-button:disabled {
		opacity: 0.4;
		cursor: not-allowed;
	}

	/* Sizes */
	.size-sm {
		width: 24px;
		height: 24px;
		padding: 4px;
	}

	.size-md {
		width: 32px;
		height: 32px;
		padding: 6px;
	}

	.size-lg {
		width: 40px;
		height: 40px;
		padding: 8px;
	}

	.icon-button :global(svg) {
		width: 100%;
		height: 100%;
	}
</style>
