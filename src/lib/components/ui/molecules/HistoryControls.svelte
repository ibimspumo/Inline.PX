<script>
	/**
	 * HistoryControls - Molecule Component
	 *
	 * Undo/Redo control buttons.
	 * Integrates with existing history.js module for undo/redo functionality.
	 *
	 * @component
	 */
	import IconButton from '../atoms/IconButton.svelte';
	import History from '../../../../../js/history.js';
	import PixelCanvas from '../../../../../js/canvas/PixelCanvas.js';
	import { onMount, onDestroy } from 'svelte';

	let canUndo = false;
	let canRedo = false;

	/**
	 * Handle undo button click
	 */
	function handleUndo() {
		const currentState = PixelCanvas.exportToString();
		const previousState = History.undo(currentState);

		if (previousState) {
			PixelCanvas.importFromString(previousState);
			updateButtonStates();
			console.log('Undo performed');
		}
	}

	/**
	 * Handle redo button click
	 */
	function handleRedo() {
		const redoState = History.redo();

		if (redoState) {
			PixelCanvas.importFromString(redoState);
			updateButtonStates();
			console.log('Redo performed');
		}
	}

	/**
	 * Update button states based on history
	 */
	function updateButtonStates() {
		const stats = History.getStats();
		canUndo = stats.undoCount > 0;
		canRedo = stats.redoCount > 0;
	}

	/**
	 * Handle keyboard shortcuts
	 * @param {KeyboardEvent} event
	 */
	function handleKeyboard(event) {
		// Undo: Ctrl+Z (or Cmd+Z on Mac)
		if ((event.ctrlKey || event.metaKey) && event.key === 'z' && !event.shiftKey) {
			event.preventDefault();
			handleUndo();
		}
		// Redo: Ctrl+Y or Ctrl+Shift+Z (or Cmd+Y, Cmd+Shift+Z on Mac)
		else if (
			(event.ctrlKey || event.metaKey) &&
			(event.key === 'y' || (event.key === 'z' && event.shiftKey))
		) {
			event.preventDefault();
			handleRedo();
		}
	}

	onMount(() => {
		// Initialize history system
		History.init({
			onHistoryChange: updateButtonStates
		});

		// Update initial button states
		updateButtonStates();

		// Add keyboard event listener
		window.addEventListener('keydown', handleKeyboard);

		console.log('HistoryControls mounted');
	});

	onDestroy(() => {
		window.removeEventListener('keydown', handleKeyboard);
	});
</script>

<div class="history-controls">
	<IconButton icon="Undo2" title="Undo (Ctrl+Z)" disabled={!canUndo} onclick={handleUndo} />
	<IconButton icon="Redo2" title="Redo (Ctrl+Y)" disabled={!canRedo} onclick={handleRedo} />
</div>

<style>
	.history-controls {
		display: flex;
		gap: 4px;
	}
</style>
