/**
 * EventBus - Centralized Event System
 *
 * Provides publish/subscribe pattern for loose coupling between modules:
 * - Event registration and triggering
 * - Multiple subscribers per event
 * - Unsubscribe support
 * - Wildcard events
 *
 * @module EventBus
 */

const EventBus = (function() {
    'use strict';

    const listeners = {};
    const logger = window.Logger || console;

    /**
     * Subscribe to an event
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     * @returns {Function} Unsubscribe function
     */
    function on(event, callback) {
        if (!listeners[event]) {
            listeners[event] = [];
        }

        listeners[event].push(callback);

        logger.debug?.(`EventBus: subscribed to "${event}"`);

        // Return unsubscribe function
        return () => off(event, callback);
    }

    /**
     * Subscribe to an event (execute once)
     * @param {string} event - Event name
     * @param {Function} callback - Event handler
     * @returns {Function} Unsubscribe function
     */
    function once(event, callback) {
        const wrapper = (...args) => {
            callback(...args);
            off(event, wrapper);
        };

        return on(event, wrapper);
    }

    /**
     * Unsubscribe from an event
     * @param {string} event - Event name
     * @param {Function} callback - Event handler to remove
     */
    function off(event, callback) {
        if (!listeners[event]) {
            return;
        }

        const index = listeners[event].indexOf(callback);
        if (index > -1) {
            listeners[event].splice(index, 1);
            logger.debug?.(`EventBus: unsubscribed from "${event}"`);
        }

        // Clean up empty arrays
        if (listeners[event].length === 0) {
            delete listeners[event];
        }
    }

    /**
     * Emit an event
     * @param {string} event - Event name
     * @param {*} data - Event data
     */
    function emit(event, data = null) {
        if (!listeners[event]) {
            logger.debug?.(`EventBus: no listeners for "${event}"`);
            return;
        }

        logger.debug?.(`EventBus: emitting "${event}"`, data);

        const callbacks = [...listeners[event]]; // Clone to allow modifications during iteration

        callbacks.forEach(callback => {
            try {
                callback(data, event);
            } catch (error) {
                logger.error?.(`EventBus: error in listener for "${event}"`, error);
            }
        });
    }

    /**
     * Get number of listeners for event
     * @param {string} event - Event name
     * @returns {number} Number of listeners
     */
    function listenerCount(event) {
        return listeners[event] ? listeners[event].length : 0;
    }

    /**
     * Get all registered events
     * @returns {Array<string>} Event names
     */
    function getEvents() {
        return Object.keys(listeners);
    }

    /**
     * Clear all listeners for an event
     * @param {string} event - Event name or null for all
     */
    function clear(event = null) {
        if (event) {
            delete listeners[event];
            logger.debug?.(`EventBus: cleared listeners for "${event}"`);
        } else {
            Object.keys(listeners).forEach(key => delete listeners[key]);
            logger.debug?.('EventBus: cleared all listeners');
        }
    }

    /**
     * Get statistics
     * @returns {Object} Stats
     */
    function getStats() {
        const stats = {
            totalEvents: Object.keys(listeners).length,
            totalListeners: 0,
            events: {}
        };

        Object.keys(listeners).forEach(event => {
            const count = listeners[event].length;
            stats.totalListeners += count;
            stats.events[event] = count;
        });

        return stats;
    }

    // Common event names (for consistency)
    const Events = {
        // Tool events
        TOOL_CHANGED: 'tool:changed',
        TOOL_OPTION_CHANGED: 'tool:optionChanged',

        // Canvas events
        CANVAS_CHANGED: 'canvas:changed',
        CANVAS_RESIZED: 'canvas:resized',
        CANVAS_CLEARED: 'canvas:cleared',

        // Selection events
        SELECTION_CHANGED: 'selection:changed',
        SELECTION_CLEARED: 'selection:cleared',

        // Color events
        COLOR_CHANGED: 'color:changed',

        // History events
        HISTORY_STATE_ADDED: 'history:stateAdded',
        UNDO_PERFORMED: 'history:undo',
        REDO_PERFORMED: 'history:redo',

        // File events
        FILE_LOADED: 'file:loaded',
        FILE_SAVED: 'file:saved',
        FILE_EXPORTED: 'file:exported',

        // UI events
        MODAL_OPENED: 'ui:modalOpened',
        MODAL_CLOSED: 'ui:modalClosed',

        // App events
        APP_READY: 'app:ready',
        APP_ERROR: 'app:error'
    };

    // Public API
    return {
        on,
        once,
        off,
        emit,
        listenerCount,
        getEvents,
        clear,
        getStats,
        Events
    };
})();

if (typeof window !== 'undefined') {
    window.EventBus = EventBus;
}
