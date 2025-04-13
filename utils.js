/**
 * Utility functions for the parsepoint extension
 */

/**
 * Safely stringify an object to JSON with error handling
 * @param {Object} obj Object to stringify
 * @param {string} fallback Fallback string to return if stringification fails
 * @returns {string} JSON string
 */
function safeStringify(obj, fallback = '{}') {
    try {
        return JSON.stringify(obj, null, 2);
    } catch (err) {
        console.error('Error stringifying object:', err);
        return fallback;
    }
}

/**
 * Log a message with a timestamp prefix
 * @param {string} message Message to log
 * @param {string} level Log level ('info', 'warn', 'error')
 */
function log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    
    switch (level) {
        case 'error':
            console.error(`${prefix} ${message}`);
            break;
        case 'warn':
            console.warn(`${prefix} ${message}`);
            break;
        default:
            console.log(`${prefix} ${message}`);
    }
}

/**
 * Creates a proper capitalized type name from a raw type
 * @param {string} type Raw type string
 * @returns {string} Formatted type name
 */
function formatTypeName(type) {
    if (!type) return 'Unknown';
    
    return type.charAt(0).toUpperCase() + type.slice(1);
}

module.exports = {
    safeStringify,
    log,
    formatTypeName
};