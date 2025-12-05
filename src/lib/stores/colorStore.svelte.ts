/**
 * Color Store - Manages active colors
 * Uses Svelte 5 Runes for reactivity
 */

function createColorStore() {
	let primaryColorIndex = $state(1); // Black
	let secondaryColorIndex = $state(2); // White

	function setPrimaryColor(index: number) {
		if (index >= 0 && index < 64) {
			primaryColorIndex = index;
		}
	}

	function setSecondaryColor(index: number) {
		if (index >= 0 && index < 64) {
			secondaryColorIndex = index;
		}
	}

	function swapColors() {
		const temp = primaryColorIndex;
		primaryColorIndex = secondaryColorIndex;
		secondaryColorIndex = temp;
	}

	return {
		get primaryColorIndex() {
			return primaryColorIndex;
		},
		get secondaryColorIndex() {
			return secondaryColorIndex;
		},
		setPrimaryColor,
		setSecondaryColor,
		swapColors
	};
}

export const colorStore = createColorStore();
