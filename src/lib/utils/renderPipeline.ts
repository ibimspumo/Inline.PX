/**
 * Render Pipeline - Future-proof rendering system
 *
 * This pipeline handles:
 * - Layer compositing
 * - Grid rendering
 * - Selection overlays
 * - Effects (future)
 * - Performance optimization
 */

import { COLOR_PALETTE } from '$lib/constants/colorPalette';
import type { Layer } from '$lib/types/canvas.types';

export interface RenderConfig {
	pixelSize: number;
	showGrid: boolean;
	showPixelBorders: boolean;
	backgroundColor: string;
	gridColor: string;
	pixelBorderColor: string;
}

export class CanvasRenderer {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private config: RenderConfig;
	private animationFrameId: number | null = null;
	private needsRedraw = true;

	constructor(canvas: HTMLCanvasElement, config: Partial<RenderConfig> = {}) {
		this.canvas = canvas;
		const ctx = canvas.getContext('2d', {
			alpha: true,
			willReadFrequently: false
		});

		if (!ctx) {
			throw new Error('Could not get 2D context');
		}

		this.ctx = ctx;
		this.config = {
			pixelSize: 32,
			showGrid: true,
			showPixelBorders: true,
			backgroundColor: '#2a2a2a',
			gridColor: 'rgba(255, 255, 255, 0.1)',
			pixelBorderColor: 'rgba(0, 0, 0, 0.2)',
			...config
		};

		// Disable image smoothing for crisp pixels
		this.ctx.imageSmoothingEnabled = false;
	}

	/**
	 * Request a redraw on next animation frame
	 */
	requestRedraw() {
		this.needsRedraw = true;
	}

	/**
	 * Update render configuration
	 */
	updateConfig(config: Partial<RenderConfig>) {
		this.config = { ...this.config, ...config };
		this.requestRedraw();
	}

	/**
	 * Main render method - composites all layers
	 */
	render(width: number, height: number, layers: Layer[]) {
		if (!this.needsRedraw) return;

		// Set canvas size
		const canvasWidth = width * this.config.pixelSize;
		const canvasHeight = height * this.config.pixelSize;

		if (
			this.canvas.width !== canvasWidth ||
			this.canvas.height !== canvasHeight
		) {
			this.canvas.width = canvasWidth;
			this.canvas.height = canvasHeight;
		}

		// Clear canvas
		this.ctx.clearRect(0, 0, canvasWidth, canvasHeight);

		// Draw checkerboard background
		this.drawCheckerboard(width, height);

		// Render layers from bottom to top
		for (const layer of layers) {
			if (!layer.visible) continue;
			this.renderLayer(width, height, layer);
		}

		// Draw grid
		if (this.config.showGrid) {
			this.drawGrid(width, height);
		}

		// Draw pixel borders
		if (this.config.showPixelBorders) {
			this.drawPixelBorders(width, height, layers);
		}

		this.needsRedraw = false;
	}

	/**
	 * Render a single layer
	 */
	private renderLayer(width: number, height: number, layer: Layer) {
		const { pixelSize } = this.config;

		this.ctx.save();
		this.ctx.globalAlpha = layer.opacity;

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const colorIndex = layer.pixels[y][x];

				// Skip transparent pixels (index 0)
				if (colorIndex === 0) continue;

				const color = COLOR_PALETTE[colorIndex];
				if (!color) continue;

				// Draw pixel
				this.ctx.fillStyle = color.color;
				this.ctx.fillRect(
					x * pixelSize,
					y * pixelSize,
					pixelSize,
					pixelSize
				);
			}
		}

		this.ctx.restore();
	}

	/**
	 * Draw checkerboard background for transparency
	 */
	private drawCheckerboard(width: number, height: number) {
		const { pixelSize } = this.config;
		const checkSize = pixelSize / 2;

		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				const isEven = (x + y) % 2 === 0;
				this.ctx.fillStyle = isEven ? '#2a2a2a' : '#1a1a1a';
				this.ctx.fillRect(
					x * pixelSize,
					y * pixelSize,
					pixelSize,
					pixelSize
				);
			}
		}
	}

	/**
	 * Draw grid lines
	 */
	private drawGrid(width: number, height: number) {
		const { pixelSize, gridColor } = this.config;

		this.ctx.strokeStyle = gridColor;
		this.ctx.lineWidth = 1;

		// Vertical lines
		for (let x = 0; x <= width; x++) {
			this.ctx.beginPath();
			this.ctx.moveTo(x * pixelSize + 0.5, 0);
			this.ctx.lineTo(x * pixelSize + 0.5, height * pixelSize);
			this.ctx.stroke();
		}

		// Horizontal lines
		for (let y = 0; y <= height; y++) {
			this.ctx.beginPath();
			this.ctx.moveTo(0, y * pixelSize + 0.5);
			this.ctx.lineTo(width * pixelSize, y * pixelSize + 0.5);
			this.ctx.stroke();
		}
	}

	/**
	 * Draw pixel borders for non-transparent pixels
	 */
	private drawPixelBorders(width: number, height: number, layers: Layer[]) {
		const { pixelSize, pixelBorderColor } = this.config;

		this.ctx.strokeStyle = pixelBorderColor;
		this.ctx.lineWidth = 1;

		// Get flattened visible pixels
		const hasPixel: boolean[][] = [];
		for (let y = 0; y < height; y++) {
			hasPixel[y] = [];
			for (let x = 0; x < width; x++) {
				hasPixel[y][x] = false;
			}
		}

		// Check which pixels are visible
		for (const layer of layers) {
			if (!layer.visible) continue;
			for (let y = 0; y < height; y++) {
				for (let x = 0; x < width; x++) {
					if (layer.pixels[y][x] !== 0) {
						hasPixel[y][x] = true;
					}
				}
			}
		}

		// Draw borders
		for (let y = 0; y < height; y++) {
			for (let x = 0; x < width; x++) {
				if (!hasPixel[y][x]) continue;

				this.ctx.strokeRect(
					x * pixelSize + 0.5,
					y * pixelSize + 0.5,
					pixelSize - 1,
					pixelSize - 1
				);
			}
		}
	}

	/**
	 * Get pixel coordinates from mouse position
	 */
	getPixelCoordinates(
		mouseX: number,
		mouseY: number,
		canvasRect: DOMRect
	): { x: number; y: number } | null {
		const x = Math.floor((mouseX - canvasRect.left) / this.config.pixelSize);
		const y = Math.floor((mouseY - canvasRect.top) / this.config.pixelSize);

		return { x, y };
	}

	/**
	 * Cleanup
	 */
	destroy() {
		if (this.animationFrameId !== null) {
			cancelAnimationFrame(this.animationFrameId);
		}
	}
}
