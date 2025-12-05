<script lang="ts">
	import PixelGrid from '$lib/components/molecules/canvas/PixelGrid.svelte';
	import { canvasStore } from '$lib/stores/canvasStore.svelte';
</script>

<div class="canvas-container">
	<div class="canvas-wrapper">
		<div class="canvas-content">
			<PixelGrid />
		</div>
	</div>

	<div class="canvas-info">
		<span class="info-item">{Math.round(canvasStore.zoom * 100)}%</span>
		<span class="info-separator">|</span>
		<span class="info-item">{canvasStore.width} × {canvasStore.height} px</span>
		<span class="info-separator">|</span>
		<span class="info-item">Layer: {canvasStore.activeLayer?.name || 'None'}</span>
		<span class="info-separator">|</span>
		<span class="info-item">{canvasStore.layers.length} {canvasStore.layers.length === 1 ? 'Layer' : 'Layers'}</span>
	</div>
</div>

<style>
	.canvas-container {
		display: flex;
		flex-direction: column;
		width: 100%;
		height: 100%;
		background-color: var(--color-bg-primary);
	}

	.canvas-wrapper {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: auto;
		padding: var(--spacing-xl);
	}

	.canvas-content {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.canvas-info {
		display: flex;
		align-items: center;
		gap: var(--spacing-md);
		padding: var(--spacing-sm) var(--spacing-md);
		background-color: var(--color-bg-tertiary);
		border-top: 1px solid var(--color-border);
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
	}

	.info-item {
		font-family: var(--font-mono);
	}

	.info-separator {
		color: var(--color-border);
	}
</style>
