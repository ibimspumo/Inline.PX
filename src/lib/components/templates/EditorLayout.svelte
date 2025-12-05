<!--
  @component EditorLayout

  Main application layout template that assembles all organisms into a cohesive
  pixel art editor interface. Features a three-column layout with MenuBar at top,
  Toolbar on left, Canvas in center, and Sidebar panels on right.

  @example
  ```svelte
  <EditorLayout />
  ```

  @remarks
  - Full viewport layout (100vw × 100vh) with no scroll
  - Top: MenuBar with File menu and project name
  - Left: Fixed-width Toolbar (52px) with tool icons
  - Center: Flexible Canvas area with info bar
  - Right: Fixed-width Sidebar (280px) with three panels
  - Sidebar panels: ToolPropertiesPanel, ColorPanel, LayersPanel
  - Sidebar is scrollable, panels stack vertically
  - Last sidebar panel (Layers) is flexible height
  - Uses CSS custom properties for dimensions and colors
  - Flex-based responsive layout
-->
<script lang="ts">
	import MenuBar from '$lib/components/organisms/editor/MenuBar.svelte';
	import Toolbar from '$lib/components/organisms/editor/Toolbar.svelte';
	import ToolbarEnhanced from '$lib/components/organisms/editor/ToolbarEnhanced.svelte';
	import Canvas from '$lib/components/organisms/editor/Canvas.svelte';
	import ToolPropertiesPanel from '$lib/components/organisms/panels/ToolPropertiesPanel.svelte';
	import ColorPanel from '$lib/components/organisms/panels/ColorPanel.svelte';
	import LayersPanel from '$lib/components/organisms/panels/LayersPanel.svelte';

	// Toggle between old and new toolbar for testing
	const useEnhancedToolbar = true;
</script>

<div class="editor-layout">
	<MenuBar />

	<div class="editor-main">
		{#if useEnhancedToolbar}
			<ToolbarEnhanced />
		{:else}
			<Toolbar />
		{/if}

		<div class="editor-content">
			<Canvas />
		</div>

		<div class="sidebar-right">
			<div class="sidebar-panel">
				<ToolPropertiesPanel />
			</div>
			<div class="sidebar-panel">
				<ColorPanel />
			</div>
			<div class="sidebar-panel">
				<LayersPanel />
			</div>
		</div>
	</div>
</div>

<style>
	.editor-layout {
		display: flex;
		flex-direction: column;
		width: 100vw;
		height: 100vh;
		overflow: hidden;
	}

	.editor-main {
		display: flex;
		flex: 1;
		overflow: hidden;
	}

	.editor-content {
		flex: 1;
		display: flex;
		flex-direction: column;
		overflow: hidden;
	}

	.sidebar-right {
		display: flex;
		flex-direction: column;
		width: var(--sidebar-width);
		background-color: var(--color-bg-secondary);
		border-left: 1px solid var(--color-border);
		overflow-y: auto;
	}

	.sidebar-panel {
		padding: var(--spacing-md);
		border-bottom: 1px solid var(--color-border);
	}

	.sidebar-panel:last-child {
		border-bottom: none;
		flex: 1;
	}
</style>
