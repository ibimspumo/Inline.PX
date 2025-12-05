<!--
  @component Toolbar

  Vertical toolbar displaying all available pixel art tools organized into groups.
  Each tool has a keyboard shortcut hint in its tooltip. The toolbar is connected
  to the global canvasStore for tool state management.

  @example
  ```svelte
  <Toolbar />
  ```

  @remarks
  - Fixed width: 52px for compact layout
  - Tool groups separated by horizontal dividers
  - Groups: Move/Hand | Pencil/Eraser/Bucket/Eyedropper | Rectangle/Ellipse | Zoom
  - Connected to canvasStore.activeTool for global tool state
  - Keyboard shortcuts shown in tooltips (V, H, B, E, G, I, U, Z)
  - Active tool displays with accent background
  - Pencil, Eraser, and Bucket tools are fully implemented
  - Other tools are UI-only placeholders
-->
<script lang="ts">
	import { canvasStore } from '$lib/stores/canvasStore.svelte';
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
</script>

<div class="toolbar">
	<div class="toolbar-section">
		<IconButton
			icon={Move}
			title="Move Tool (V)"
			active={canvasStore.activeTool === 'move'}
			onclick={() => canvasStore.setActiveTool('move')}
		/>
		<IconButton
			icon={Hand}
			title="Hand Tool (H)"
			active={canvasStore.activeTool === 'hand'}
			onclick={() => canvasStore.setActiveTool('hand')}
		/>
	</div>

	<Divider orientation="horizontal" />

	<div class="toolbar-section">
		<IconButton
			icon={Pencil}
			title="Pencil Tool (B)"
			active={canvasStore.activeTool === 'pencil'}
			onclick={() => canvasStore.setActiveTool('pencil')}
		/>
		<IconButton
			icon={Eraser}
			title="Eraser Tool (E)"
			active={canvasStore.activeTool === 'eraser'}
			onclick={() => canvasStore.setActiveTool('eraser')}
		/>
		<IconButton
			icon={PaintBucket}
			title="Paint Bucket Tool (G)"
			active={canvasStore.activeTool === 'bucket'}
			onclick={() => canvasStore.setActiveTool('bucket')}
		/>
		<IconButton
			icon={Pipette}
			title="Eyedropper Tool (I)"
			active={canvasStore.activeTool === 'eyedropper'}
			onclick={() => canvasStore.setActiveTool('eyedropper')}
		/>
	</div>

	<Divider orientation="horizontal" />

	<div class="toolbar-section">
		<IconButton
			icon={Square}
			title="Rectangle Tool (U)"
			active={canvasStore.activeTool === 'rectangle'}
			onclick={() => canvasStore.setActiveTool('rectangle')}
		/>
		<IconButton
			icon={Circle}
			title="Ellipse Tool (U)"
			active={canvasStore.activeTool === 'ellipse'}
			onclick={() => canvasStore.setActiveTool('ellipse')}
		/>
	</div>

	<Divider orientation="horizontal" />

	<div class="toolbar-section">
		<IconButton icon={ZoomIn} title="Zoom Tool (Z)" active={canvasStore.activeTool === 'zoom'} onclick={() => canvasStore.setActiveTool('zoom')} />
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
