/**
 * ExportDialog - Specialized export dialog with compression options
 *
 * Features:
 * - String preview
 * - RLE compression toggle
 * - Multiple export formats (copy, txt, png)
 * - PNG scale selection
 *
 * @module ExportDialog
 *
 * @typedef {import('../types.js').ExportResult} ExportResult
 * @typedef {import('../types.js').CompressionStats} CompressionStats
 */

import Compression from '../compression.js';
import { createDialogElement, showDialog, closeDialog } from './DialogCore.js';
import { escapeHtml } from './DialogHelpers.js';

/**
 * Show custom export dialog
 * @param {string} dataString - Export data string
 * @returns {Promise<Object|null>} Resolves with export options or null
 */
export function showExportDialog(dataString) {
    return new Promise((resolve) => {
        // Get compression stats
        const compressionStats = Compression ? Compression.getStats(dataString) : null;
        const canCompress = compressionStats !== null;

        const dialog = createDialogElement({
            title: 'Export Pixel Art',
            message: 'Choose how you want to export your pixel art:',
            icon: 'download',
            type: 'info',
            customContent: buildExportDialogContent(dataString, compressionStats, canCompress),
            buttons: [
                {
                    text: 'Cancel',
                    type: 'secondary',
                    action: () => {
                        closeDialog();
                        resolve(null);
                    }
                }
            ]
        });

        showDialog(dialog);
        setupExportHandlers(dialog, resolve);
    });
}

/**
 * Build export dialog HTML content
 * @private
 */
function buildExportDialogContent(dataString, compressionStats, canCompress) {
    const previewContent = buildPreviewSection(dataString);
    const compressionContent = canCompress ? buildCompressionSection(dataString, compressionStats) : '';
    const formatContent = buildFormatSection();
    const pngScaleContent = buildPNGScaleSection();

    return `
        <div class="export-options">
            ${previewContent}
            ${compressionContent}
            ${formatContent}
            ${pngScaleContent}
        </div>
    `;
}

/**
 * Build preview section
 * @private
 */
function buildPreviewSection(dataString) {
    return `
        <div class="export-preview">
            <div class="export-preview-header">
                <strong>Text Format Preview:</strong>
                <span class="export-preview-size">${dataString.length} chars</span>
            </div>
            <code class="export-code-preview">${escapeHtml(dataString.substring(0, 100))}${dataString.length > 100 ? '...' : ''}</code>
        </div>
    `;
}

/**
 * Build compression section
 * @private
 */
function buildCompressionSection(dataString, compressionStats) {
    const savingsClass = compressionStats.savings > 0 ? '' : 'export-warning';
    const savingsText = compressionStats.savings > 0 ? 'Save' : 'Adds';
    const infoText = compressionStats.savings > 0
        ? 'Compresses repeated pixels for smaller file size. Recommended for sprites with large solid areas.'
        : 'Note: This sprite has few repeated pixels, so compression increases file size. Use only if needed for compatibility.';

    return `
        <div class="export-option-group">
            <label class="export-checkbox-label">
                <input type="checkbox" id="exportCompress" class="export-checkbox" ${compressionStats.savings > 0 ? 'checked' : ''} />
                <span>Use RLE Compression</span>
                <span class="export-savings ${savingsClass}">${savingsText} ${Math.abs(compressionStats.savings)}% (${compressionStats.originalSize} → ${compressionStats.compressedSize} chars)</span>
            </label>
            <div class="export-option-info">
                ${infoText}
            </div>
            ${buildCompressionPreview(dataString, compressionStats)}
        </div>
    `;
}

/**
 * Build compression preview
 * @private
 */
function buildCompressionPreview(dataString, compressionStats) {
    return `
        <div class="compression-preview">
            <div class="compression-preview-section">
                <div class="compression-preview-label">
                    <strong>Before:</strong>
                    <span class="compression-preview-size">${compressionStats.originalSize} chars</span>
                </div>
                <code class="compression-preview-code">${escapeHtml(dataString.substring(0, 80))}${dataString.length > 80 ? '...' : ''}</code>
            </div>
            <div class="compression-preview-arrow">→</div>
            <div class="compression-preview-section">
                <div class="compression-preview-label">
                    <strong>After:</strong>
                    <span class="compression-preview-size compression-highlight">${compressionStats.compressedSize} chars</span>
                </div>
                <code class="compression-preview-code">${escapeHtml(compressionStats.compressed.substring(0, 80))}${compressionStats.compressed.length > 80 ? '...' : ''}</code>
            </div>
        </div>
    `;
}

/**
 * Build format selection section
 * @private
 */
function buildFormatSection() {
    return `
        <div class="export-format-section">
            <strong>Export as:</strong>
            <div class="export-format-buttons">
                <button class="export-format-btn" data-format="copy-string">
                    <span class="material-symbols-outlined export-format-icon">content_copy</span>
                    <span class="export-format-label">Copy String</span>
                    <span class="export-format-desc">Copy to clipboard</span>
                </button>
                <button class="export-format-btn" data-format="download-txt">
                    <span class="material-symbols-outlined export-format-icon">description</span>
                    <span class="export-format-label">Download TXT</span>
                    <span class="export-format-desc">Save as text file</span>
                </button>
                <button class="export-format-btn" data-format="download-png">
                    <span class="material-symbols-outlined export-format-icon">image</span>
                    <span class="export-format-label">Download PNG</span>
                    <span class="export-format-desc">Save as image</span>
                </button>
            </div>
        </div>
    `;
}

/**
 * Build PNG scale section
 * @private
 */
function buildPNGScaleSection() {
    return `
        <div id="pngScaleOptions" class="png-scale-options" style="display: none;">
            <strong>PNG Scale:</strong>
            <div class="png-scale-buttons">
                <button class="png-scale-btn active" data-scale="1">1×</button>
                <button class="png-scale-btn" data-scale="2">2×</button>
                <button class="png-scale-btn" data-scale="4">4×</button>
                <button class="png-scale-btn" data-scale="8">8×</button>
            </div>
        </div>
    `;
}

/**
 * Setup export dialog event handlers
 * @private
 */
function setupExportHandlers(dialog, resolve) {
    let selectedFormat = null;
    let selectedScale = 1;

    // Format button handlers
    dialog.querySelectorAll('.export-format-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            // Update selection
            dialog.querySelectorAll('.export-format-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedFormat = btn.dataset.format;

            // Show PNG scale options if PNG selected
            const pngOptions = dialog.querySelector('#pngScaleOptions');
            if (selectedFormat === 'download-png') {
                pngOptions.style.display = 'block';
            } else {
                pngOptions.style.display = 'none';
            }

            // Auto-submit on selection
            setTimeout(() => {
                const useCompression = dialog.querySelector('#exportCompress')?.checked || false;
                closeDialog();
                resolve({
                    format: selectedFormat,
                    compress: useCompression,
                    scale: selectedScale
                });
            }, 150);
        });
    });

    // PNG scale handlers
    dialog.querySelectorAll('.png-scale-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            dialog.querySelectorAll('.png-scale-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedScale = parseInt(btn.dataset.scale);
        });
    });
}
