/**
 * @module DOM
 * @memberOf dom
 */

import scope from "../core/scope";
import {hasField, isArr, isEmpty} from "../core/types";
import {contains, filter, forEach} from "../core/collections";
import {error} from "../core/logging";
import {funcBodyEquals} from "../core/functions";


/**
 * Set listener for event type(s) on element, removes identical event listeners to avoid duplication
 *
 * @param {HTMLElement|Element|Node} target - target element
 * @param {String|Array} event - event type(s)
 * @param {Function} listener
 * @param {AddEventListenerOptions?} [options]
 */
export function setEvent(target, event, listener, options) {
    if (!scope.isBrowser()) {
        error("Events are browser only!");
        return
    }
    if (!isArr(event)) {
        if (contains(event,' ')) {
            event = event.split(' ').Map((it)=>it.trim())
        } else
            event = [event];
    }
    target.__EVENTS__ = target.__EVENTS__ || {};
    forEach(event,(ev)=> {
        target.__EVENTS__[ev] = target.__EVENTS__[ev] || [];

        let f = function (e) {
            listener(e, target);
        };
        if (!hasField(options, 'duplicates', (a)=>a)) {
            target.__EVENTS__[ev] = filter(target.__EVENTS__[ev],(fl)=> {
                if (funcBodyEquals(fl.l, listener)) {
                    target.removeEventListener(ev, fl.f, fl.o);
                    return false
                }
                // else {
                //     console.log('notEqual',fl.l.toString(), listener.toString())
                // }
            });
        }

        target.__EVENTS__[ev].push({f:f, l:listener, o: options});
        target.addEventListener(ev, f, options);
    });
}

/**
 * Clear all event listeners of type from element
 *
 * @param {HTMLElement|Element|Node} target - target element
 * @param {String|Array} event - event type(s)
 */
export function clearEvent(target, event) {
    if (!scope.isBrowser()) {
        error("Events are browser only!");
        return
    }
    if (!isArr(event)) {
        if (contains(event,' ')) {
            event = event.split(' ').Map((it)=>it.trim())
        } else
            event = [event];
    }
    target.__EVENTS__ = target.__EVENTS__ || {};
    if (isEmpty(target.__EVENTS__)) return;
    forEach(event,function (ev) {
        target.__EVENTS__[ev] = target.__EVENTS__[ev] || [];
        if (isEmpty(target.__EVENTS__[ev])) return;

        forEach(target.__EVENTS__[ev],(fl)=> {
            target.removeEventListener(ev, fl.f, fl.o);
            return false
        });
        target.__EVENTS__[ev] = [];

    });
}

/**
 * Target has event listener for event type
 *
 * @param {HTMLElement|Element|Node} target - target element
 * @param {String} type - event type
 * @return {boolean}
 */
export function hasEvent(target, type) {
    return target.__EVENTS__ && target.__EVENTS__[type] && !isEmpty(target.__EVENTS__[type])
}

// export default {setEvent, clearEvent, hasEvent};