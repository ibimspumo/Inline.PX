/**
 * FormatUtils - String Formatting Utilities
 *
 * Provides utility functions for formatting:
 * - File sizes
 * - Numbers
 * - Timestamps
 * - Data strings
 *
 * @module FormatUtils
 */

/**
 * Format file size in bytes to human-readable format
 * @param {number} bytes - File size in bytes
 * @param {number} decimals - Number of decimals (default 1)
 * @returns {string} Formatted size (e.g., "1.5 KB")
 */
function formatFileSize(bytes, decimals = 1) {
    if (bytes === 0) return '0 Bytes';
    if (bytes === 1) return '1 Byte';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}

/**
 * Format number with thousands separator
 * @param {number} num - Number to format
 * @returns {string} Formatted number (e.g., "1,234")
 */
function formatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Format percentage
 * @param {number} value - Percentage value (0-100)
 * @param {number} decimals - Number of decimals (default 1)
 * @returns {string} Formatted percentage (e.g., "75.5%")
 */
function formatPercentage(value, decimals = 1) {
    return value.toFixed(decimals) + '%';
}

/**
 * Format timestamp to readable date/time
 * @param {Date|number|string} timestamp - Timestamp to format
 * @param {boolean} includeTime - Include time (default true)
 * @returns {string} Formatted date/time
 */
function formatTimestamp(timestamp, includeTime = true) {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    let formatted = `${year}-${month}-${day}`;

    if (includeTime) {
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        formatted += ` ${hours}:${minutes}:${seconds}`;
    }

    return formatted;
}

/**
 * Format relative time (e.g., "2 minutes ago")
 * @param {Date|number|string} timestamp - Timestamp to format
 * @returns {string} Relative time string
 */
function formatRelativeTime(timestamp) {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffSec < 60) {
        return 'just now';
    } else if (diffMin < 60) {
        return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
    } else if (diffHour < 24) {
        return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
    } else if (diffDay < 7) {
        return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
    } else {
        return formatTimestamp(date, false);
    }
}

/**
 * Truncate string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} suffix - Suffix to add (default '...')
 * @returns {string} Truncated string
 */
function truncate(str, maxLength, suffix = '...') {
    if (str.length <= maxLength) {
        return str;
    }

    const truncated = str.substring(0, maxLength - suffix.length);
    return truncated + suffix;
}

/**
 * Format data string for display (truncate if too long)
 * @param {string} dataString - Data string to format
 * @param {number} maxLength - Maximum display length (default 50)
 * @returns {string} Formatted data string
 */
function formatDataString(dataString, maxLength = 50) {
    if (!dataString) {
        return '';
    }

    const parts = dataString.split(':');
    if (parts.length < 2) {
        return truncate(dataString, maxLength);
    }

    // Show dimensions + truncated data
    const dimensions = parts[0];
    const isRLE = parts.length === 3 && parts[1] === 'RLE';
    const dataIndex = isRLE ? 2 : 1;
    const data = parts[dataIndex];

    const prefix = isRLE ? `${dimensions}:RLE:` : `${dimensions}:`;
    const remainingLength = maxLength - prefix.length - 3; // Reserve space for '...'

    if (data.length <= remainingLength) {
        return dataString;
    }

    return `${prefix}${data.substring(0, remainingLength)}...`;
}

/**
 * Pluralize word based on count
 * @param {number} count - Count
 * @param {string} singular - Singular form
 * @param {string} plural - Plural form (default singular + 's')
 * @returns {string} Pluralized string
 */
function pluralize(count, singular, plural = null) {
    plural = plural || singular + 's';
    return count === 1 ? singular : plural;
}

/**
 * Format dimension string (e.g., "16×16")
 * @param {number} width - Width
 * @param {number} height - Height
 * @returns {string} Formatted dimensions
 */
function formatDimensions(width, height) {
    return `${width}×${height}`;
}

/**
 * Pad string with leading zeros
 * @param {number|string} value - Value to pad
 * @param {number} length - Target length
 * @returns {string} Padded string
 */
function padZero(value, length = 2) {
    return String(value).padStart(length, '0');
}

/**
 * Format color code for display
 * @param {number} index - Color index
 * @param {string} base64Chars - Base64 character set
 * @returns {string} Formatted color code
 */
function formatColorCode(index, base64Chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+/') {
    if (index < 0 || index >= base64Chars.length) {
        return '?';
    }
    return base64Chars[index];
}

const FormatUtils = {
    formatFileSize,
    formatNumber,
    formatPercentage,
    formatTimestamp,
    formatRelativeTime,
    truncate,
    formatDataString,
    pluralize,
    formatDimensions,
    padZero,
    formatColorCode
};

export default FormatUtils;
