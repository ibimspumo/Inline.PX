<script lang="ts">
	import MenuBar from '$lib/components/organisms/editor/MenuBar.svelte';
	import Toolbar from '$lib/components/organisms/editor/Toolbar.svelte';
	import Canvas from '$lib/components/organisms/editor/Canvas.svelte';
	import ToolPropertiesPanel from '$lib/components/organisms/panels/ToolPropertiesPanel.svelte';
	import ColorPanel from '$lib/components/organisms/panels/ColorPanel.svelte';
	import LayersPanel from '$lib/components/organisms/panels/LayersPanel.svelte';
</script>

<div class="editor-layout">
	<MenuBar />

	<div class="editor-main">
		<Toolbar />

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
