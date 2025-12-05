<script lang="ts">
	import Panel from '$lib/components/atoms/display/Panel.svelte';
</script>

<Panel title="Tool Properties">
	<div class="properties">
		<div class="property-group">
			<label class="property-label">Brush Size</label>
			<input type="range" min="1" max="50" value="1" class="slider" />
			<span class="property-value">1px</span>
		</div>

		<div class="property-group">
			<label class="property-label">Opacity</label>
			<input type="range" min="0" max="100" value="100" class="slider" />
			<span class="property-value">100%</span>
		</div>
	</div>
</Panel>

<style>
	.properties {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-lg);
	}

	.property-group {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-sm);
	}

	.property-label {
		font-size: var(--font-size-sm);
		color: var(--color-text-secondary);
		font-weight: 500;
	}

	.property-value {
		font-size: var(--font-size-sm);
		color: var(--color-text-primary);
		text-align: right;
	}

	.slider {
		width: 100%;
		height: 4px;
		background: var(--color-bg-elevated);
		outline: none;
		border-radius: var(--radius-sm);
		-webkit-appearance: none;
	}

	.slider::-webkit-slider-thumb {
		-webkit-appearance: none;
		appearance: none;
		width: 14px;
		height: 14px;
		background: var(--color-accent);
		cursor: pointer;
		border-radius: 50%;
	}

	.slider::-moz-range-thumb {
		width: 14px;
		height: 14px;
		background: var(--color-accent);
		cursor: pointer;
		border-radius: 50%;
		border: none;
	}
</style>
