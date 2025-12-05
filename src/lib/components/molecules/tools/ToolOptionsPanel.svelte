<!--
  @component ToolOptionsPanel

  Displays configurable options for the active tool.
  Dynamically generates UI controls based on tool option schemas.
  Currently displays option information only - full state management coming in Phase 1.2.

  @example
  ```svelte
  <ToolOptionsPanel />
  ```

  @remarks
  - Automatically shows options for active tool from canvasStore
  - Supports multiple option types: slider, boolean, number, string, color, select
  - Options are defined in tool configuration (ToolConfigExtended)
  - Dynamic visibility based on option.visible property
  - Currently read-only (displays default values)
  - Full state persistence will be added in Phase 1.2 (ToolStateManager)
-->
<script lang="ts">
	import { canvasStore } from '$lib/stores/canvasStore.svelte';
	import { toolRegistry } from '$lib/tools';
	import type { ToolConfigExtended } from '$lib/tools/base/ToolMetadata';
	import type { ToolOption } from '$lib/tools/base/ToolOptions';

	// Get active tool reactively
	let activeTool = $derived(toolRegistry.getTool(canvasStore.activeTool));

	// Get extended config if available
	let extendedConfig = $derived(activeTool?.config as ToolConfigExtended | undefined);

	// Get options from config
	let options = $derived(extendedConfig?.options || []);

	// Check if tool has any options
	let hasOptions = $derived(options.length > 0);

	/**
	 * Check if an option should be visible
	 */
	function isOptionVisible(option: ToolOption): boolean {
		if (typeof option.visible === 'function') {
			// TODO: Pass actual ToolContext when state management is implemented
			return true; // For now, show all dynamic visibility options
		}
		return option.visible !== false;
	}

	/**
	 * Format option value for display
	 */
	function formatValue(value: any, option: ToolOption): string {
		if (option.type === 'boolean') {
			return value ? 'On' : 'Off';
		}
		if (option.type === 'slider' || option.type === 'number') {
			return String(value);
		}
		return String(value);
	}
</script>

<div class="tool-options-panel">
	{#if activeTool}
		<div class="panel-header">
			<h3>{activeTool.config.name} Options</h3>
		</div>

		<div class="panel-content">
			{#if hasOptions}
				<div class="options-list">
					{#each options as option}
						{#if isOptionVisible(option)}
							<div class="option-item">
								<div class="option-header">
									<label for={option.id} class="option-label">
										{option.label}
									</label>
									{#if option.description}
										<span class="option-description" title={option.description}>?</span>
									{/if}
								</div>

								<div class="option-control">
									{#if option.type === 'slider'}
										<div class="slider-control">
											<input
												type="range"
												id={option.id}
												min={option.min}
												max={option.max}
												step={option.step}
												value={option.defaultValue}
												disabled
											/>
											<span class="value-display">{option.defaultValue}</span>
										</div>
									{:else if option.type === 'boolean'}
										<input
											type="checkbox"
											id={option.id}
											checked={option.defaultValue}
											disabled
										/>
									{:else if option.type === 'number'}
										<input
											type="number"
											id={option.id}
											min={option.min}
											max={option.max}
											step={option.step}
											value={option.defaultValue}
											disabled
										/>
									{:else if option.type === 'color'}
										<input type="color" id={option.id} value={option.defaultValue} disabled />
									{:else if option.type === 'select' && option.options}
										<select id={option.id} disabled>
											{#each option.options as selectOption}
												<option
													value={selectOption.value}
													selected={selectOption.value === option.defaultValue}
												>
													{selectOption.label}
												</option>
											{/each}
										</select>
									{:else if option.type === 'string'}
										<input type="text" id={option.id} value={option.defaultValue} disabled />
									{/if}
								</div>
							</div>
						{/if}
					{/each}
				</div>

				<div class="phase-notice">
					<p>
						<em>Tool state persistence coming in Phase 1.2</em>
					</p>
				</div>
			{:else}
				<p class="no-options">This tool has no configurable options.</p>
			{/if}
		</div>
	{:else}
		<p class="no-tool">No tool selected</p>
	{/if}
</div>

<style>
	.tool-options-panel {
		display: flex;
		flex-direction: column;
		background: var(--color-bg-secondary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		overflow: hidden;
	}

	.panel-header {
		padding: var(--spacing-md);
		background: var(--color-bg-tertiary);
		border-bottom: 1px solid var(--color-border);
	}

	.panel-header h3 {
		margin: 0;
		font-size: var(--text-sm);
		font-weight: 600;
		color: var(--color-text-primary);
	}

	.panel-content {
		padding: var(--spacing-md);
	}

	.options-list {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-md);
	}

	.option-item {
		display: flex;
		flex-direction: column;
		gap: var(--spacing-xs);
	}

	.option-header {
		display: flex;
		align-items: center;
		gap: var(--spacing-xs);
	}

	.option-label {
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--color-text-secondary);
		cursor: pointer;
	}

	.option-description {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 14px;
		height: 14px;
		font-size: 10px;
		font-weight: bold;
		color: var(--color-text-tertiary);
		background: var(--color-bg-tertiary);
		border-radius: 50%;
		cursor: help;
	}

	.option-control {
		width: 100%;
	}

	.slider-control {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
	}

	.slider-control input[type='range'] {
		flex: 1;
	}

	.value-display {
		min-width: 32px;
		font-size: var(--text-xs);
		font-weight: 500;
		color: var(--color-text-primary);
		text-align: right;
	}

	input[type='range'],
	input[type='number'],
	input[type='text'],
	input[type='color'],
	select {
		width: 100%;
		padding: var(--spacing-xs);
		font-size: var(--text-xs);
		color: var(--color-text-primary);
		background: var(--color-bg-primary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-sm);
	}

	input[type='range'] {
		padding: 0;
		width: 100%;
	}

	input[type='checkbox'] {
		width: 16px;
		height: 16px;
		cursor: pointer;
	}

	input:disabled,
	select:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.no-options,
	.no-tool {
		font-size: var(--text-xs);
		color: var(--color-text-tertiary);
		font-style: italic;
		text-align: center;
		padding: var(--spacing-lg);
	}

	.phase-notice {
		margin-top: var(--spacing-md);
		padding: var(--spacing-sm);
		background: var(--color-bg-tertiary);
		border: 1px dashed var(--color-border);
		border-radius: var(--radius-sm);
		text-align: center;
	}

	.phase-notice p {
		margin: 0;
		font-size: var(--text-xs);
		color: var(--color-text-tertiary);
	}
</style>
