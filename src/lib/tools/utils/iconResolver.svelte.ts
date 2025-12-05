/**
 * Icon Resolver - Maps icon names to Lucide Svelte components
 *
 * This is a workaround to allow importing icons in TypeScript files.
 * Tools specify iconName as a string, and this resolver converts
 * them to actual Svelte components.
 */

import type { Component } from 'svelte';
import type { IconName } from '../base/ToolConfig';
import {
	Pencil,
	Eraser,
	PaintBucket,
	Pipette,
	Move,
	Hand,
	ZoomIn,
	Square,
	Circle,
	Lasso
} from '@lucide/svelte';

/**
 * Map of icon names to Lucide Svelte components
 */
const iconMap: Record<IconName, Component> = {
	Pencil,
	Eraser,
	PaintBucket,
	Pipette,
	Move,
	Hand,
	ZoomIn,
	Square,
	Circle,
	Lasso
};

/**
 * Resolve an icon name to its Svelte component
 * @param iconName - Name of the icon
 * @returns Lucide Svelte component
 */
export function resolveIcon(iconName: IconName): Component {
	const icon = iconMap[iconName];
	if (!icon) {
		console.warn(`Icon "${iconName}" not found in iconMap`);
		return Pencil; // Fallback
	}
	return icon;
}

/**
 * Check if an icon name is valid
 * @param iconName - Name to check
 * @returns true if valid icon name
 */
export function isValidIconName(iconName: string): iconName is IconName {
	return iconName in iconMap;
}
