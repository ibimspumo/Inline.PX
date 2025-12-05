/**
 * Project Type Definitions
 */

export interface ProjectMetadata {
	name: string;
	width: number;
	height: number;
	createdAt: number;
	modifiedAt: number;
	version: string;
}

export interface ProjectData {
	metadata: ProjectMetadata;
	encoded: string; // Base64 encoded canvas data
}

export type ProjectSize = 8 | 16 | 32 | 64 | 128;

export const PROJECT_SIZES: ProjectSize[] = [8, 16, 32, 64, 128];

export const DEFAULT_PROJECT_SIZE: ProjectSize = 8;
