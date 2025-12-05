<!--
  @component SearchInput

  A search input field with optional clear button and keyboard shortcut support.

  @example
  ```svelte
  <SearchInput
    placeholder="Search tools..."
    value={searchQuery}
    onchange={(value) => handleSearch(value)}
  />
  ```

  @remarks
  - Automatically focuses when Cmd+K or Ctrl+K is pressed
  - Shows clear button when input has value
  - Emits change event on input
  - Styled with CSS custom properties
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { Search, X } from '@lucide/svelte/icons';

	/**
	 * Props interface for SearchInput component
	 */
	interface Props {
		/** Current search value */
		value?: string;
		/** Placeholder text */
		placeholder?: string;
		/** Change handler */
		onchange?: (value: string) => void;
		/** Keyboard shortcut hint (e.g., 'Cmd+K') */
		shortcutHint?: string;
		/** Auto-focus on mount */
		autofocus?: boolean;
	}

	let {
		value = $bindable(''),
		placeholder = 'Search...',
		onchange,
		shortcutHint,
		autofocus = false
	}: Props = $props();

	let inputElement: HTMLInputElement;

	/**
	 * Handle input change
	 */
	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		value = target.value;
		onchange?.(value);
	}

	/**
	 * Clear search input
	 */
	function clearInput() {
		value = '';
		onchange?.('');
		inputElement?.focus();
	}

	/**
	 * Focus input element
	 */
	export function focus() {
		inputElement?.focus();
	}

	/**
	 * Setup keyboard shortcut listener
	 */
	onMount(() => {
		if (autofocus) {
			inputElement?.focus();
		}

		// Listen for Cmd+K / Ctrl+K
		function handleKeyDown(event: KeyboardEvent) {
			if ((event.metaKey || event.ctrlKey) && event.key === 'k') {
				event.preventDefault();
				inputElement?.focus();
			}
		}

		window.addEventListener('keydown', handleKeyDown);

		return () => {
			window.removeEventListener('keydown', handleKeyDown);
		};
	});
</script>

<div class="search-input">
	<Search class="search-icon" size={16} />

	<input
		bind:this={inputElement}
		type="text"
		{placeholder}
		{value}
		oninput={handleInput}
		class="search-field"
	/>

	{#if value}
		<button class="clear-button" onclick={clearInput} title="Clear search" type="button">
			<X size={16} />
		</button>
	{/if}

	{#if shortcutHint && !value}
		<span class="shortcut-hint">{shortcutHint}</span>
	{/if}
</div>

<style>
	.search-input {
		position: relative;
		display: flex;
		align-items: center;
		width: 100%;
		background-color: var(--color-bg-tertiary);
		border: 1px solid var(--color-border);
		border-radius: var(--radius-md);
		padding: var(--spacing-xs) var(--spacing-sm);
		gap: var(--spacing-xs);
		transition: all 0.2s ease;
	}

	.search-input:focus-within {
		border-color: var(--color-accent);
		background-color: var(--color-bg-primary);
		box-shadow: 0 0 0 3px var(--color-accent-alpha);
	}

	.search-input :global(.lucide) {
		color: var(--color-text-secondary);
		flex-shrink: 0;
	}

	.search-field {
		flex: 1;
		border: none;
		background: transparent;
		color: var(--color-text-primary);
		font-size: var(--font-size-sm);
		outline: none;
		padding: 0;
		min-width: 0;
	}

	.search-field::placeholder {
		color: var(--color-text-tertiary);
	}

	.clear-button {
		display: flex;
		align-items: center;
		justify-content: center;
		border: none;
		background: transparent;
		color: var(--color-text-secondary);
		cursor: pointer;
		padding: 2px;
		border-radius: var(--radius-sm);
		transition: all 0.2s ease;
		flex-shrink: 0;
	}

	.clear-button:hover {
		background-color: var(--color-bg-hover);
		color: var(--color-text-primary);
	}

	.shortcut-hint {
		font-size: var(--font-size-xs);
		color: var(--color-text-tertiary);
		background-color: var(--color-bg-secondary);
		padding: 2px 6px;
		border-radius: var(--radius-sm);
		border: 1px solid var(--color-border);
		font-family: var(--font-mono, monospace);
		flex-shrink: 0;
	}
</style>
