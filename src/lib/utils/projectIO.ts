/**
 * Project I/O - Save/Load/Export/Import utilities
 */

import { encodeCanvas, decodeCanvas } from '$lib/constants/colorPalette';
import type { ProjectData, ProjectMetadata } from '$lib/types/project.types';
import type { Layer } from '$lib/types/canvas.types';

/**
 * Export project to JSON format
 */
export function exportProject(
	metadata: ProjectMetadata,
	layers: Layer[]
): ProjectData {
	// Flatten all layers into single pixel array (only active layer for now)
	const activeLayer = layers[0]; // TODO: Support multiple layers
	const pixels: number[] = [];

	for (let y = 0; y < metadata.height; y++) {
		for (let x = 0; x < metadata.width; x++) {
			pixels.push(activeLayer.pixels[y][x]);
		}
	}

	const encoded = encodeCanvas(metadata.width, metadata.height, pixels);

	return {
		metadata: {
			...metadata,
			modifiedAt: Date.now()
		},
		encoded
	};
}

/**
 * Import project from JSON format
 */
export function importProject(data: ProjectData): {
	metadata: ProjectMetadata;
	pixels: number[][];
} {
	const { width, height, pixels: flatPixels } = decodeCanvas(data.encoded);

	// Convert flat array to 2D array
	const pixels: number[][] = [];
	let index = 0;

	for (let y = 0; y < height; y++) {
		pixels[y] = [];
		for (let x = 0; x < width; x++) {
			pixels[y][x] = flatPixels[index++];
		}
	}

	return {
		metadata: data.metadata,
		pixels
	};
}

/**
 * Save project to file (download)
 */
export function saveProjectToFile(projectData: ProjectData) {
	const json = JSON.stringify(projectData, null, 2);
	const blob = new Blob([json], { type: 'application/json' });
	const url = URL.createObjectURL(blob);

	const a = document.createElement('a');
	a.href = url;
	a.download = `${projectData.metadata.name}.inlinepx.json`;
	a.click();

	URL.revokeObjectURL(url);
}

/**
 * Load project from file
 */
export function loadProjectFromFile(): Promise<ProjectData> {
	return new Promise((resolve, reject) => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json,.inlinepx.json';

		input.onchange = async (e) => {
			const file = (e.target as HTMLInputElement).files?.[0];
			if (!file) {
				reject(new Error('No file selected'));
				return;
			}

			try {
				const text = await file.text();
				const data = JSON.parse(text) as ProjectData;

				// Validate data
				if (!data.metadata || !data.encoded) {
					throw new Error('Invalid project file format');
				}

				resolve(data);
			} catch (error) {
				reject(error);
			}
		};

		input.click();
	});
}

/**
 * Export as Base64 string (for clipboard)
 */
export function exportAsBase64(
	width: number,
	height: number,
	layers: Layer[]
): string {
	const activeLayer = layers[0];
	const pixels: number[] = [];

	for (let y = 0; y < height; y++) {
		for (let x = 0; x < width; x++) {
			pixels.push(activeLayer.pixels[y][x]);
		}
	}

	return encodeCanvas(width, height, pixels);
}

/**
 * Import from Base64 string
 */
export function importFromBase64(encoded: string): {
	width: number;
	height: number;
	pixels: number[][];
} {
	const { width, height, pixels: flatPixels } = decodeCanvas(encoded);

	// Convert flat array to 2D array
	const pixels: number[][] = [];
	let index = 0;

	for (let y = 0; y < height; y++) {
		pixels[y] = [];
		for (let x = 0; x < width; x++) {
			pixels[y][x] = flatPixels[index++];
		}
	}

	return { width, height, pixels };
}

/**
 * Copy Base64 to clipboard
 */
export async function copyBase64ToClipboard(encoded: string) {
	try {
		await navigator.clipboard.writeText(encoded);
		return true;
	} catch (error) {
		console.error('Failed to copy to clipboard:', error);
		return false;
	}
}
