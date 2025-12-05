<script lang="ts">
	import LayerThumbnail from './LayerThumbnail.svelte';
	import IconButton from '$lib/components/atoms/buttons/IconButton.svelte';
	import { Eye, EyeOff, Lock, Unlock, Copy, ChevronUp, ChevronDown } from '@lucide/svelte';
	import type { Layer } from '$lib/types/canvas.types';

	interface Props {
		layer: Layer;
		canvasWidth: number;
		canvasHeight: number;
		isActive: boolean;
		canMoveUp: boolean;
		canMoveDown: boolean;
		onSelect: () => void;
		onToggleVisibility: () => void;
		onToggleLock: () => void;
		onDuplicate: () => void;
		onMoveUp: () => void;
		onMoveDown: () => void;
		onRename: (newName: string) => void;
	}

	let {
		layer,
		canvasWidth,
		canvasHeight,
		isActive,
		canMoveUp,
		canMoveDown,
		onSelect,
		onToggleVisibility,
		onToggleLock,
		onDuplicate,
		onMoveUp,
		onMoveDown,
		onRename
	}: Props = $props();

	let isEditing = $state(false);
	let editName = $state(layer.name);

	function startEditing() {
		isEditing = true;
		editName = layer.name;
	}

	function finishEditing() {
		if (editName.trim() && editName !== layer.name) {
			onRename(editName.trim());
		}
		isEditing = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Enter') {
			finishEditing();
		} else if (e.key === 'Escape') {
			editName = layer.name;
			isEditing = false;
		}
	}
</script>

<div class="layer-item" class:active={isActive} onclick={onSelect}>
	<!-- Thumbnail -->
	<div class="layer-thumbnail-wrapper">
		<LayerThumbnail {layer} width={canvasWidth} height={canvasHeight} size={40} />
	</div>

	<!-- Layer Info -->
	<div class="layer-info">
		{#if isEditing}
			<input
				type="text"
				class="layer-name-input"
				bind:value={editName}
				onblur={finishEditing}
				onkeydown={handleKeydown}
				onclick={(e) => e.stopPropagation()}
				autofocus
			/>
		{:else}
			<span class="layer-name" ondblclick={(e) => {
				e.stopPropagation();
				startEditing();
			}}>
				{layer.name}
			</span>
		{/if}
		<div class="layer-meta">
			<span class="layer-size">{canvasWidth}×{canvasHeight}</span>
			{#if !layer.visible}
				<span class="layer-status">Hidden</span>
			{/if}
			{#if layer.locked}
				<span class="layer-status">Locked</span>
			{/if}
		</div>
	</div>

	<!-- Actions -->
	<div class="layer-actions" onclick={(e) => e.stopPropagation()}>
		<!-- Reorder buttons -->
		<div class="layer-reorder">
			<button
				class="reorder-btn"
				onclick={onMoveUp}
				disabled={!canMoveUp}
				title="Move layer up"
			>
				<ChevronUp size={14} />
			</button>
			<button
				class="reorder-btn"
				onclick={onMoveDown}
				disabled={!canMoveDown}
				title="Move layer down"
			>
				<ChevronDown size={14} />
			</button>
		</div>

		<!-- Toggle buttons -->
		<button
			class="action-btn"
			onclick={onToggleVisibility}
			title={layer.visible ? 'Hide layer' : 'Show layer'}
		>
			{#if layer.visible}
				<Eye size={16} />
			{:else}
				<EyeOff size={16} />
			{/if}
		</button>

		<button
			class="action-btn"
			onclick={onToggleLock}
			title={layer.locked ? 'Unlock layer' : 'Lock layer'}
		>
			{#if layer.locked}
				<Lock size={16} />
			{:else}
				<Unlock size={16} />
			{/if}
		</button>

		<button class="action-btn" onclick={onDuplicate} title="Duplicate layer">
			<Copy size={16} />
		</button>
	</div>
</div>

<style>
	.layer-item {
		display: flex;
		align-items: center;
		gap: var(--spacing-sm);
		padding: var(--spacing-sm);
		background-color: var(--color-bg-tertiary);
		border: 2px solid var(--color-border);
		border-radius: var(--radius-md);
		cursor: pointer;
		transition: all var(--transition-fast);
		width: 100%;
	}

	.layer-item:hover {
		background-color: var(--color-bg-elevated);
		border-color: var(--color-border-hover, var(--color-border));
	}

	.layer-item.active {
		border-color: var(--color-accent);
		background-color: var(--color-bg-elevated);
		box-shadow: 0 0 0 1px var(--color-accent);
	}

	.layer-thumbnail-wrapper {
		flex-shrink: 0;
	}

	.layer-info {
		display: flex;
		flex-direction: column;
		gap: 4px;
		flex: 1;
		min-width: 0;
	}

	.layer-name {
		font-size: var(--font-size-sm);
		font-weight: 500;
		color: var(--color-text-primary);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	.layer-name-input {
		font-size: var(--font-size-sm);
		font-weight: 500;
		padding: 2px 4px;
		background: var(--color-bg-primary);
		border: 1px solid var(--color-accent);
		border-radius: var(--radius-sm);
		color: var(--color-text-primary);
		width: 100%;
	}

	.layer-name-input:focus {
		outline: none;
		border-color: var(--color-accent);
	}

	.layer-meta {
		display: flex;
		gap: var(--spacing-xs);
		font-size: var(--font-size-xs);
		color: var(--color-text-secondary);
	}

	.layer-size {
		font-family: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', monospace;
	}

	.layer-status {
		padding: 0 4px;
		background: var(--color-bg-tertiary);
		border-radius: var(--radius-sm);
	}

	.layer-actions {
		display: flex;
		align-items: center;
		gap: 4px;
		flex-shrink: 0;
	}

	.layer-reorder {
		display: flex;
		flex-direction: column;
		gap: 2px;
	}

	.reorder-btn,
	.action-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		background: transparent;
		border: none;
		color: var(--color-text-secondary);
		cursor: pointer;
		padding: 2px;
		border-radius: var(--radius-sm);
		transition: all var(--transition-fast);
	}

	.reorder-btn {
		width: 20px;
		height: 12px;
	}

	.action-btn {
		width: 24px;
		height: 24px;
	}

	.reorder-btn:hover:not(:disabled),
	.action-btn:hover {
		background: var(--color-bg-tertiary);
		color: var(--color-text-primary);
	}

	.reorder-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.action-btn:active {
		transform: scale(0.95);
	}
</style>
