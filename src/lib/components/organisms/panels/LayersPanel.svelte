<script lang="ts">
	import Panel from '$lib/components/atoms/display/Panel.svelte';
	import IconButton from '$lib/components/atoms/buttons/IconButton.svelte';
	import LayerItem from '$lib/components/molecules/layer/LayerItem.svelte';
	import { Plus, Trash2 } from '@lucide/svelte';
	import { canvasStore } from '$lib/stores/canvasStore.svelte';

	function addNewLayer() {
		canvasStore.addLayer(`Layer ${canvasStore.layers.length + 1}`);
	}

	function deleteLayer(layerId: string) {
		canvasStore.removeLayer(layerId);
	}

	// Layers are rendered from top to bottom in UI, but stored bottom to top
	// So we need to reverse the array for display
	let displayLayers = $derived([...canvasStore.layers].reverse());
</script>

<Panel title="Layers">
	<div class="layers-panel">
		<div class="layers-list">
			{#each displayLayers as layer, index (layer.id)}
				{@const reversedIndex = canvasStore.layers.length - 1 - index}
				<LayerItem
					{layer}
					canvasWidth={canvasStore.width}
					canvasHeight={canvasStore.height}
					isActive={layer.id === canvasStore.activeLayerId}
					canMoveUp={reversedIndex > 0}
					canMoveDown={reversedIndex < canvasStore.layers.length - 1}
					onSelect={() => canvasStore.setActiveLayer(layer.id)}
					onToggleVisibility={() => canvasStore.toggleLayerVisibility(layer.id)}
					onToggleLock={() => canvasStore.toggleLayerLock(layer.id)}
					onDuplicate={() => canvasStore.duplicateLayer(layer.id)}
					onMoveUp={() => canvasStore.moveLayerUp(layer.id)}
					onMoveDown={() => canvasStore.moveLayerDown(layer.id)}
					onRename={(newName) => canvasStore.renameLayer(layer.id, newName)}
				/>
			{/each}
		</div>

		<div class="layers-actions">
			<IconButton icon={Plus} title="New Layer" size="sm" onclick={addNewLayer} />
			<IconButton
				icon={Trash2}
				title="Delete Layer"
				size="sm"
				onclick={() => canvasStore.activeLayerId && deleteLayer(canvasStore.activeLayerId)}
				disabled={canvasStore.layers.length <= 1}
			/>
		</div>
	</div>
</Panel>

<style>
	.layers-panel {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
		height: 100%;
	}

	.layers-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
		flex: 1;
		overflow-y: auto;
		padding: 2px;
	}

	.layers-actions {
		display: flex;
		gap: var(--spacing-xs);
		padding-top: var(--spacing-sm);
		border-top: 1px solid var(--color-border);
	}
</style>
