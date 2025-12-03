/**
 * ClipboardUtils - Unified Clipboard Operations
 *
 * Provides consistent clipboard functionality:
 * - Copy text with modern API and fallback
 * - Paste text
 * - Copy feedback
 *
 * @module ClipboardUtils
 */

const ClipboardUtils = (function() {
    'use strict';

    const logger = window.Logger || console;

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} True if successful
     */
    async function copyText(text) {
        // Try modern clipboard API first
        if (navigator.clipboard && navigator.clipboard.writeText) {
            try {
                await navigator.clipboard.writeText(text);
                logger.info?.('Text copied to clipboard (modern API)');
                return true;
            } catch (error) {
                logger.warn?.('Modern clipboard API failed, trying fallback', error);
                return fallbackCopy(text);
            }
        }

        // Fallback for older browsers
        return fallbackCopy(text);
    }

    /**
     * Fallback copy using execCommand
     * @private
     * @param {string} text - Text to copy
     * @returns {boolean} True if successful
     */
    function fallbackCopy(text) {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.opacity = '0';

        document.body.appendChild(textarea);
        textarea.select();

        let success = false;
        try {
            success = document.execCommand('copy');
            if (success) {
                logger.info?.('Text copied to clipboard (fallback)');
            }
        } catch (error) {
            logger.error?.('Fallback copy failed', error);
        }

        document.body.removeChild(textarea);
        return success;
    }

    /**
     * Read text from clipboard
     * @returns {Promise<string|null>} Clipboard text or null
     */
    async function pasteText() {
        if (navigator.clipboard && navigator.clipboard.readText) {
            try {
                const text = await navigator.clipboard.readText();
                logger.info?.('Text pasted from clipboard');
                return text;
            } catch (error) {
                logger.warn?.('Clipboard read failed', error);
                return null;
            }
        }

        logger.warn?.('Clipboard API not available');
        return null;
    }

    /**
     * Show visual copy feedback on element
     * @param {HTMLElement} element - Element to show feedback on
     * @param {number} duration - Duration in ms (default 1000)
     */
    function showCopyFeedback(element, duration = 1000) {
        if (!element) {
            return;
        }

        // Store original state
        const originalBg = element.style.background;
        const iconElement = element.querySelector('.material-symbols-outlined');
        const originalIcon = iconElement ? iconElement.textContent : null;

        // Apply feedback styles
        element.style.background = 'var(--success-color, #4CAF50)';
        if (iconElement) {
            iconElement.textContent = 'check';
        }

        // Revert after duration
        setTimeout(() => {
            element.style.background = originalBg;
            if (iconElement && originalIcon) {
                iconElement.textContent = originalIcon;
            }
        }, duration);
    }

    /**
     * Check if clipboard API is available
     * @returns {boolean} True if available
     */
    function isAvailable() {
        return !!(navigator.clipboard && navigator.clipboard.writeText);
    }

    /**
     * Copy with automatic feedback
     * @param {string} text - Text to copy
     * @param {HTMLElement} feedbackElement - Element for feedback (optional)
     * @returns {Promise<boolean>} True if successful
     */
    async function copyWithFeedback(text, feedbackElement = null) {
        const success = await copyText(text);

        if (success && feedbackElement) {
            showCopyFeedback(feedbackElement);
        }

        return success;
    }

    // Public API
    return {
        copyText,
        pasteText,
        showCopyFeedback,
        isAvailable,
        copyWithFeedback
    };
})();

if (typeof window !== 'undefined') {
    window.ClipboardUtils = ClipboardUtils;
}
