<!--
  @component ToolPropertiesPanel

  Displays configurable properties for the active tool using the enhanced tool
  configuration system. Dynamically renders options based on tool config.

  @example
  ```svelte
  <ToolPropertiesPanel />
  ```

  @remarks
  - Wrapper organism that contains ToolOptionsPanel molecule
  - Uses Panel atom for consistent styling with other sidebar panels
  - Dynamically updates when active tool changes
  - Tool options defined in ToolConfigExtended
  - Currently displays default values (Phase 1.1)
  - Full state persistence coming in Phase 1.2
-->
<script lang="ts">
	import Panel from '$lib/components/atoms/display/Panel.svelte';
	import ToolOptionsPanel from '$lib/components/molecules/tools/ToolOptionsPanel.svelte';
</script>

<Panel title="Tool Properties">
	<ToolOptionsPanel />
</Panel>
