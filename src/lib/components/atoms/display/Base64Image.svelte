<script lang="ts">
	import { onMount } from 'svelte';
	import { renderBase64ToCanvas, type Base64ToPngConfig } from '$lib/utils/base64ToPng';

	interface Props {
		encoded: string; // Base64 string in format: WIDTHxHEIGHT:BASE64DATA
		scale?: number;
		showCheckerboard?: boolean;
		backgroundColor?: string;
		pixelBorders?: boolean;
		alt?: string;
		class?: string;
	}

	let {
		encoded,
		scale = 1,
		showCheckerboard = true,
		backgroundColor,
		pixelBorders = false,
		alt = 'Pixel art',
		class: className = ''
	}: Props = $props();

	let canvasElement: HTMLCanvasElement;

	// Re-render when props change
	$effect(() => {
		if (canvasElement && encoded) {
			try {
				const config: Partial<Base64ToPngConfig> = {
					scale,
					showCheckerboard,
					backgroundColor,
					pixelBorders
				};
				renderBase64ToCanvas(canvasElement, encoded, config);
			} catch (error) {
				console.error('Failed to render Base64 image:', error);
			}
		}
	});
</script>

<canvas bind:this={canvasElement} class="base64-image {className}" aria-label={alt}></canvas>

<style>
	.base64-image {
		display: block;
		image-rendering: pixelated;
		image-rendering: -moz-crisp-edges;
		image-rendering: crisp-edges;
	}
</style>
