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

import logger from './Logger.js';

const listeners = {};

function on(event, callback) {
    if (!listeners[event]) {
        listeners[event] = [];
    }
    listeners[event].push(callback);
    logger.debug?.(`EventBus: subscribed to "${event}"`);
    return () => off(event, callback);
}

function once(event, callback) {
    const wrapper = (...args) => {
        callback(...args);
        off(event, wrapper);
    };
    return on(event, wrapper);
}

function off(event, callback) {
    if (!listeners[event]) return;
    const index = listeners[event].indexOf(callback);
    if (index > -1) {
        listeners[event].splice(index, 1);
        logger.debug?.(`EventBus: unsubscribed from "${event}"`);
    }
    if (listeners[event].length === 0) {
        delete listeners[event];
    }
}

function emit(event, data = null) {
    if (!listeners[event]) {
        logger.debug?.(`EventBus: no listeners for "${event}"`);
        return;
    }
    logger.debug?.(`EventBus: emitting "${event}"`, data);
    const callbacks = [...listeners[event]];
    callbacks.forEach(callback => {
        try {
            callback(data, event);
        } catch (error) {
            logger.error?.(`EventBus: error in listener for "${event}"`, error);
        }
    });
}

const Events = {
    TOOL_CHANGED: 'tool:changed',
    TOOL_OPTION_CHANGED: 'tool:optionChanged',
    CANVAS_CHANGED: 'canvas:changed',
    CANVAS_RESIZED: 'canvas:resized',
    CANVAS_CLEARED: 'canvas:cleared',
    SELECTION_CHANGED: 'selection:changed',
    SELECTION_CLEARED: 'selection:cleared',
    COLOR_CHANGED: 'color:changed',
    HISTORY_STATE_ADDED: 'history:stateAdded',
    UNDO_PERFORMED: 'history:undo',
    REDO_PERFORMED: 'history:redo',
    FILE_LOADED: 'file:loaded',
    FILE_SAVED: 'file:saved',
    FILE_EXPORTED: 'file:exported',
    MODAL_OPENED: 'ui:modalOpened',
    MODAL_CLOSED: 'ui:modalClosed',
    APP_READY: 'app:ready',
    APP_ERROR: 'app:error'
};

const EventBus = {
    on,
    once,
    off,
    emit,
    listenerCount: (event) => listeners[event] ? listeners[event].length : 0,
    getEvents: () => Object.keys(listeners),
    clear: (event = null) => {
        if (event) {
            delete listeners[event];
            logger.debug?.(`EventBus: cleared listeners for "${event}"`);
        } else {
            Object.keys(listeners).forEach(key => delete listeners[key]);
            logger.debug?.('EventBus: cleared all listeners');
        }
    },
    getStats: () => {
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
    },
    Events
};

export default EventBus;
