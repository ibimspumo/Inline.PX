<script lang="ts">
	interface Props {
		color: string;
		index: number;
		active?: boolean;
		onclick?: (index: number) => void;
		size?: 'sm' | 'md' | 'lg';
	}

	let { color, index, active = false, onclick, size = 'md' }: Props = $props();
</script>

<button
	class="color-swatch"
	class:active
	class:size-sm={size === 'sm'}
	class:size-md={size === 'md'}
	class:size-lg={size === 'lg'}
	class:transparent={color === 'transparent'}
	style="--swatch-color: {color === 'transparent' ? 'transparent' : color}"
	onclick={() => onclick?.(index)}
	title={color === 'transparent' ? `Transparent (Index: ${index})` : `${color} (Index: ${index})`}
></button>

<style>
	.color-swatch {
		position: relative;
		background-color: var(--swatch-color);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-sm);
		cursor: pointer;
		transition: all var(--transition-fast);
		padding: 0;
	}

	.color-swatch.transparent {
		background: repeating-conic-gradient(#808080 0% 25%, #404040 0% 50%) 50% / 8px 8px;
	}

	.color-swatch:hover {
		border-color: var(--color-accent);
		transform: scale(1.1);
		z-index: 1;
	}

	.color-swatch.active {
		border-color: var(--color-accent);
		box-shadow: 0 0 0 2px var(--color-accent);
		transform: scale(1.05);
	}

	/* Sizes */
	.size-sm {
		width: 20px;
		height: 20px;
	}

	.size-md {
		width: 28px;
		height: 28px;
	}

	.size-lg {
		width: 36px;
		height: 36px;
	}
</style>
