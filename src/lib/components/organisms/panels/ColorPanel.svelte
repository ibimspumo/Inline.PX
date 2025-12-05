<script lang="ts">
	import Panel from '$lib/components/atoms/display/Panel.svelte';
	import ColorSwatch from '$lib/components/atoms/color-swatch/ColorSwatch.svelte';
	import { COLOR_PALETTE } from '$lib/constants/colorPalette';
	import { colorStore } from '$lib/stores/colorStore.svelte';

	let primaryColor = $derived(COLOR_PALETTE[colorStore.primaryColorIndex]);
	let secondaryColor = $derived(COLOR_PALETTE[colorStore.secondaryColorIndex]);

	function selectPrimaryColor(index: number) {
		colorStore.setPrimaryColor(index);
	}

	function selectSecondaryColor(index: number) {
		colorStore.setSecondaryColor(index);
	}
</script>

<Panel title="Colors">
	<div class="color-section">
		<!-- Primary and Secondary Color Display -->
		<div class="selected-colors">
			<div class="color-display-wrapper">
				<div class="color-display-container">
					<div
						class="color-display primary"
						class:transparent={primaryColor.color === 'transparent'}
						style="background-color: {primaryColor.color === 'transparent'
							? 'transparent'
							: primaryColor.color}"
					>
						<span class="color-index">{primaryColor.index}</span>
					</div>
					<div
						class="color-display secondary"
						class:transparent={secondaryColor.color === 'transparent'}
						style="background-color: {secondaryColor.color === 'transparent'
							? 'transparent'
							: secondaryColor.color}"
					>
						<span class="color-index">{secondaryColor.index}</span>
					</div>
				</div>
				<div class="color-labels">
					<div class="color-label">
						<span class="label-text">Primary</span>
						<span class="label-name">{primaryColor.name}</span>
					</div>
					<div class="color-label">
						<span class="label-text">Secondary</span>
						<span class="label-name">{secondaryColor.name}</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Color Palette Grid (64 colors) -->
		<div class="palette-section">
			<div class="section-title">Palette (64 colors)</div>
			<div class="palette-grid">
				{#each COLOR_PALETTE as paletteColor}
					<ColorSwatch
						color={paletteColor.color}
						index={paletteColor.index}
						active={paletteColor.index === colorStore.primaryColorIndex}
						onclick={selectPrimaryColor}
						size="md"
					/>
				{/each}
			</div>
		</div>
	</div>
</Panel>

<style>
	.color-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	.selected-colors {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.color-display-wrapper {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.color-display-container {
		position: relative;
		width: 100%;
		height: 80px;
		display: flex;
	}

	.color-display {
		position: relative;
		border: 2px solid var(--color-border);
		border-radius: var(--radius-md);
		display: flex;
		align-items: flex-start;
		justify-content: flex-start;
		padding: var(--spacing-xs);
	}

	.color-display.transparent {
		background: repeating-conic-gradient(#808080 0% 25%, #404040 0% 50%) 50% / 16px 16px !important;
	}

	.color-display.primary {
		width: 70%;
		z-index: 2;
	}

	.color-display.secondary {
		width: 50%;
		margin-left: -20%;
		z-index: 1;
	}

	.color-index {
		font-size: var(--font-size-xs);
		font-weight: 600;
		font-family: var(--font-mono);
		background-color: rgba(0, 0, 0, 0.7);
		color: white;
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
	}

	.color-labels {
		display: flex;
		justify-content: space-between;
		gap: var(--spacing-md);
	}

	.color-label {
		display: flex;
		flex-direction: column;
		gap: 2px;
		flex: 1;
	}

	.label-text {
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.label-name {
		font-size: var(--font-size-sm);
		color: var(--color-text-primary);
		font-weight: 500;
	}

	.palette-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.section-title {
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
		text-transform: uppercase;
		letter-spacing: 0.5px;
		font-weight: 600;
	}

	.palette-grid {
		display: grid;
		grid-template-columns: repeat(8, 1fr);
		gap: var(--spacing-xs);
	}
</style>
