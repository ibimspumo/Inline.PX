<script lang="ts">
	import IconButton from '$lib/components/atoms/buttons/IconButton.svelte';
	import Divider from '$lib/components/atoms/display/Divider.svelte';
	import {
		Pencil,
		Eraser,
		PaintBucket,
		Pipette,
		Hand,
		ZoomIn,
		Square,
		Circle,
		Move
	} from '@lucide/svelte';

	let activeTool = $state('pencil');
</script>

<div class="toolbar">
	<div class="toolbar-section">
		<IconButton
			icon={Move}
			title="Move Tool (V)"
			active={activeTool === 'move'}
			onclick={() => (activeTool = 'move')}
		/>
		<IconButton
			icon={Hand}
			title="Hand Tool (H)"
			active={activeTool === 'hand'}
			onclick={() => (activeTool = 'hand')}
		/>
	</div>

	<Divider orientation="horizontal" />

	<div class="toolbar-section">
		<IconButton
			icon={Pencil}
			title="Pencil Tool (B)"
			active={activeTool === 'pencil'}
			onclick={() => (activeTool = 'pencil')}
		/>
		<IconButton
			icon={Eraser}
			title="Eraser Tool (E)"
			active={activeTool === 'eraser'}
			onclick={() => (activeTool = 'eraser')}
		/>
		<IconButton
			icon={PaintBucket}
			title="Paint Bucket Tool (G)"
			active={activeTool === 'bucket'}
			onclick={() => (activeTool = 'bucket')}
		/>
		<IconButton
			icon={Pipette}
			title="Eyedropper Tool (I)"
			active={activeTool === 'eyedropper'}
			onclick={() => (activeTool = 'eyedropper')}
		/>
	</div>

	<Divider orientation="horizontal" />

	<div class="toolbar-section">
		<IconButton
			icon={Square}
			title="Rectangle Tool (U)"
			active={activeTool === 'rectangle'}
			onclick={() => (activeTool = 'rectangle')}
		/>
		<IconButton
			icon={Circle}
			title="Ellipse Tool (U)"
			active={activeTool === 'ellipse'}
			onclick={() => (activeTool = 'ellipse')}
		/>
	</div>

	<Divider orientation="horizontal" />

	<div class="toolbar-section">
		<IconButton icon={ZoomIn} title="Zoom Tool (Z)" active={activeTool === 'zoom'} onclick={() => (activeTool = 'zoom')} />
	</div>
</div>

<style>
	.toolbar {
		display: flex;
		flex-direction: column;
		width: 52px;
		background-color: var(--color-bg-secondary);
		border-right: 1px solid var(--color-border);
		padding: var(--spacing-sm);
		gap: var(--spacing-xs);
		user-select: none;
	}

	.toolbar-section {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}
</style>
