/**
 * Project Store - Manages project metadata and state
 */

import type { ProjectMetadata } from '$lib/types/project.types';

function createProjectStore() {
	let isProjectLoaded = $state(false);
	let metadata = $state<ProjectMetadata | null>(null);

	function createProject(name: string, width: number, height: number) {
		metadata = {
			name,
			width,
			height,
			createdAt: Date.now(),
			modifiedAt: Date.now(),
			version: '1.0'
		};
		isProjectLoaded = true;
	}

	function loadProject(projectMetadata: ProjectMetadata) {
		metadata = projectMetadata;
		isProjectLoaded = true;
	}

	function updateMetadata(updates: Partial<ProjectMetadata>) {
		if (metadata) {
			metadata = {
				...metadata,
				...updates,
				modifiedAt: Date.now()
			};
		}
	}

	function closeProject() {
		metadata = null;
		isProjectLoaded = false;
	}

	return {
		get isProjectLoaded() {
			return isProjectLoaded;
		},
		get metadata() {
			return metadata;
		},
		createProject,
		loadProject,
		updateMetadata,
		closeProject
	};
}

export const projectStore = createProjectStore();
