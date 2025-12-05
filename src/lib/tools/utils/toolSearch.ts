/**
 * Tool Search Utility
 *
 * Provides fuzzy search functionality for tools based on name, description, and tags.
 */

import type { BaseTool } from '../base/BaseTool';
import type { ToolConfigExtended } from '../base/ToolMetadata';

/**
 * Search result with relevance score
 */
export interface ToolSearchResult {
	tool: BaseTool;
	score: number;
	matchedFields: string[];
}

/**
 * Calculate similarity score between two strings (0-1)
 * Uses simple character matching for fuzzy search
 */
function calculateSimilarity(search: string, target: string): number {
	const searchLower = search.toLowerCase();
	const targetLower = target.toLowerCase();

	// Exact match
	if (targetLower === searchLower) return 1.0;

	// Contains exact search
	if (targetLower.includes(searchLower)) return 0.8;

	// Fuzzy match: count matching characters in order
	let searchIndex = 0;
	let matches = 0;

	for (let i = 0; i < targetLower.length && searchIndex < searchLower.length; i++) {
		if (targetLower[i] === searchLower[searchIndex]) {
			matches++;
			searchIndex++;
		}
	}

	const fuzzyScore = matches / searchLower.length;

	// Only consider it a match if most characters matched
	return fuzzyScore >= 0.6 ? fuzzyScore * 0.6 : 0;
}

/**
 * Search tools by query string
 *
 * @param tools - Array of tools to search
 * @param query - Search query
 * @param options - Search options
 * @returns Sorted array of search results with scores
 */
export function searchTools(
	tools: BaseTool[],
	query: string,
	options: {
		minScore?: number;
		maxResults?: number;
		searchFields?: ('name' | 'description' | 'tags' | 'category')[];
	} = {}
): ToolSearchResult[] {
	const {
		minScore = 0.3,
		maxResults = 20,
		searchFields = ['name', 'description', 'tags', 'category']
	} = options;

	// Empty query returns all tools
	if (!query.trim()) {
		return tools.map(tool => ({
			tool,
			score: 1.0,
			matchedFields: []
		}));
	}

	const results: ToolSearchResult[] = [];

	for (const tool of tools) {
		const config = tool.config as ToolConfigExtended;
		let maxScore = 0;
		const matchedFields: string[] = [];

		// Search name (highest weight)
		if (searchFields.includes('name')) {
			const nameScore = calculateSimilarity(query, config.name);
			if (nameScore > maxScore) {
				maxScore = nameScore;
				matchedFields.length = 0;
				matchedFields.push('name');
			} else if (nameScore === maxScore && nameScore > 0) {
				matchedFields.push('name');
			}
		}

		// Search description (medium weight)
		if (searchFields.includes('description')) {
			const descScore = calculateSimilarity(query, config.description) * 0.7;
			if (descScore > maxScore) {
				maxScore = descScore;
				matchedFields.length = 0;
				matchedFields.push('description');
			} else if (descScore > 0 && Math.abs(descScore - maxScore) < 0.1) {
				matchedFields.push('description');
			}
		}

		// Search tags (high weight)
		if (searchFields.includes('tags') && config.tags) {
			for (const tag of config.tags) {
				const tagScore = calculateSimilarity(query, tag) * 0.9;
				if (tagScore > maxScore) {
					maxScore = tagScore;
					matchedFields.length = 0;
					matchedFields.push('tags');
				} else if (tagScore > 0 && Math.abs(tagScore - maxScore) < 0.1) {
					if (!matchedFields.includes('tags')) {
						matchedFields.push('tags');
					}
				}
			}
		}

		// Search category (low weight)
		if (searchFields.includes('category')) {
			const catScore = calculateSimilarity(query, config.category) * 0.5;
			if (catScore > maxScore) {
				maxScore = catScore;
				matchedFields.length = 0;
				matchedFields.push('category');
			} else if (catScore > 0 && Math.abs(catScore - maxScore) < 0.1) {
				matchedFields.push('category');
			}
		}

		// Add to results if score is above threshold
		if (maxScore >= minScore) {
			results.push({
				tool,
				score: maxScore,
				matchedFields
			});
		}
	}

	// Sort by score (descending)
	results.sort((a, b) => b.score - a.score);

	// Limit results
	return results.slice(0, maxResults);
}

/**
 * Filter tools by category
 */
export function filterByCategory(tools: BaseTool[], category: string): BaseTool[] {
	return tools.filter(tool => tool.config.category === category);
}

/**
 * Filter tools by tags (any tag matches)
 */
export function filterByTags(tools: BaseTool[], tags: string[]): BaseTool[] {
	if (tags.length === 0) return tools;

	return tools.filter(tool => {
		const config = tool.config as ToolConfigExtended;
		if (!config.tags) return false;

		return tags.some(tag => config.tags!.includes(tag));
	});
}

/**
 * Get all unique tags from tools
 */
export function getAllTags(tools: BaseTool[]): string[] {
	const tagSet = new Set<string>();

	for (const tool of tools) {
		const config = tool.config as ToolConfigExtended;
		if (config.tags) {
			config.tags.forEach(tag => tagSet.add(tag));
		}
	}

	return Array.from(tagSet).sort();
}
