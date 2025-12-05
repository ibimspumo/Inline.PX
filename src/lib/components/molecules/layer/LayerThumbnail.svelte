<script lang="ts">
	import { getLayerAsDataURL } from '$lib/utils/pngExport';
	import type { Layer } from '$lib/types/canvas.types';

	interface Props {
		layer: Layer;
		width: number;
		height: number;
		size?: number;
	}

	let { layer, width, height, size = 32 }: Props = $props();

	// Generate data URL for layer thumbnail
	let thumbnailURL = $derived(
		getLayerAsDataURL(layer, width, height, {
			scale: 1,
			showCheckerboard: true
		})
	);
</script>

<img
	src={thumbnailURL}
	alt="{layer.name} thumbnail"
	class="layer-thumbnail"
	style="width: {size}px; height: {size}px;"
/>

<style>
	.layer-thumbnail {
		display: block;
		border-radius: var(--radius-sm);
		image-rendering: pixelated;
		image-rendering: -moz-crisp-edges;
		image-rendering: crisp-edges;
		border: 1px solid var(--color-border);
	}
</style>
