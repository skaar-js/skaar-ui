'use strict';

/**
 * Merges an object with global namespace
 * @private
 * @param {Object} obj
 */
function setGlobal(obj) {
    for (let key of Object.keys(obj)) {
        global[key] = obj[key];
    }
}

/**
 * Code generator for prototype modification, used in polyfills
 */
class Extension {

    /**
     * @constructor
     * @param {any[]} types - Array of prototypes
     */
    constructor(types) {
        this.types = types;
        this.types = [];
        /** Generated code */
        this.pcode = "\n";
    }

    /**
     * Defines a new function for given prototypes
     *
     * @param {Function} namedFunc A named function
     * @return {string}
     */
    define(namedFunc) {
        if (!namedFunc.name) {
            let err = `Function must have a name [Extension.define(f)]\n<<${namedFunc}>>`;
            console.error(err);
            return `\n/**\n *${err}\n */`;
        }
        let code = "\n";
        for (let p of this.types) {
            if (p !== undefined)
                code += `${p.name || p}.prototype.${namedFunc.name} = `;
        }
        code += namedFunc.toString() + ";\n";

        this.pcode += code;

        return code
    }

    polyfill(namedFunc) {
        if (!namedFunc.name) {
            let err = `Extension function must have a name:\n<<${namedFunc}>>`;
            console.error(err);
            return `\n/**\n *${err}\n */`;
        }
        let code = "\n";
        for (let p of this.types) {
            code += `if (${p.name || p}.prototype.${namedFunc.name} === undefined) ${p.name || p}.prototype.${namedFunc.name} = ${namedFunc.toString()};\n`;
        }
        this.pcode += code;
    }
}

function isBrowser() {
    return global.window !== undefined && global.document !== undefined && global.navigator !== undefined
}

if (!isBrowser()) {
// -------------
    global.HTMLElement = !global.HTMLElement? function HTMLElement(){}: global.HTMLElement;
    global.Element = !global.Element? function Element(){}: global.Element;
    global.Node = !global.Node? function Node(){}: global.Node;
    global.HTMLCollection = !global.HTMLCollection? function HTMLCollection(){}: global.HTMLCollection;
    global.NodeList = !global.NodeList? function NodeList(){}: global.NodeList;
// -------------
}

var scope = {setGlobal, Extension, isBrowser};

/**
 * @name TYPE
 */
var TYPE = {
    FRAG: -1,
    TEXT: 0,
    NODE: 1,
    VIEW: 2
};

const scheduler = Object.seal({
    queue: [],
    busy: false,
    running: false,
    idle: 0
});

function runner() {
    if (scheduler.queue.length === 0) {
        scheduler.idle++;
        if (scheduler.idle>3) {
            scheduler.running = false;
            return;
        }
        return;
    }
    scheduler.idle = 0;
    if (!scheduler.busy) {
        let task = scheduler.queue.shift();
        scheduler.busy = true;
        task();
        task = null;
        setTimeout(function () {
            scheduler.busy = false;
        });
    }
    setTimeout(runner, 20);
}

function start() {
    if (!scheduler.running) setTimeout(runner, 1);
}

function dispatchTask(task) {
    if (task) {
        scheduler.queue.push(task);
        start();
    }
}

// const {Enum} = require("./types");

/**
 * @module core/logging
 * @memberOf core
 */

/** @private */
function _logTime() {
    let t = new Date();
    return `${t.getHours()}:${t.getMinutes()}:${t.getSeconds()}:${t.getMilliseconds()}`;
}

/** @private */
function _logTitle(flag) {
    return `[${flag}] [${_logTime()}]`;
}

/** @private */
function _prepareLog(args, lt) {
    args.reverse();
    args.push("display: inline-block; font-weight: bold; color: black", "%c"+lt);
    args.reverse();
}

/**
 * @type {Object}
 */
const LogLevels = {TRACE:0, INFO:1, WARN:2, ERROR:3, SILENT:-1};
/**
 * Log config
 * @type {{LogLevel: *}}
 */
const Config = {
    LogLevel : LogLevels.TRACE
};

/** Set Config.LogLevel
 * @param l - LogLevel */
function lvl(l) {
    return Config.LogLevel <= l
}
/**
 * Log Warning
 * @param {any} args
 */
function warn(...args) {
    if (!lvl(LogLevels.WARN)) return;
    _prepareLog(args, _logTitle("🚨 WARN"));
    console.warn.apply(this, args);
}
/**
 * Log Error
 * @param {any} args
 */
function error(...args) {
    if (!lvl(LogLevels.ERROR)) return;
    _prepareLog(args, _logTitle("💥 ERROR"));
    console.error.apply(this, args);
}

// module.exports = {
//     Config,
//     LogLevels,
//     showTrace, showInfo, showWarn, showError, silent, trace, info, warn, error
// };

/**
 * @module core/types
 * @memberOf core
 */

/** Is undefined
 * @param x
 * @returns {boolean}
 */
function isUnd(x) {
    return x !== null && x === undefined;
}

/** Is null
 * @param x
 * @return {boolean}
 */
function isNull(x) {
    return x === null;
}

/** Is value !null && !undefined
 * @param x
 * @return {boolean|boolean}
 */
function isVal(x) {
    return !isUnd(x) && !isNull(x);
}

/** Is string|String
 * @param x
 * @return {boolean}
 */
function isStr(x) {
    return typeof x === "string" || x instanceof String;
}

/** Is function
 * @param x
 * @return {boolean}
 */
function isFun(x) {
    return typeof x === "function";
}

/** Is object
 * @param x
 * @return {boolean|boolean}
 */
function isObj(x) {
    return x !== null && typeof x === "object";
}

/** Is Array
 * @param x
 * @return {boolean}
 */
function isArr(x) {
    return x instanceof Array
}

/** Is primitive isVal && !isObj && !isFun
 * @param x
 * @return {boolean}
 */
function isPrim(x) {
    return isVal(x) && !isObj(x) && !isFun(x) || typeof x === 'symbol';
}

/** Is List (has length property and item() function)
 * @param x
 * @return {boolean|boolean}
 */
function isList(x) {
    return isVal(x.length) && isFun(x.item)
}

/** Is Element/Node
 * @param x
 * @return {boolean}
 */
function isEl(x) {
    return x instanceof Element || x instanceof HTMLElement || x instanceof Node;
}

/**
 * Object has field
 * @param {Object} obj - source object
 * @param {String} field - field/property name
 * @param {Function} [pred] - optional predicate function to check field
 * @return {boolean}
 */
function hasField(obj, field, pred) {
    if (!isVal(obj)) return false;
    if (isFun(pred)) {
        return pred(obj[field]);
    }
    return obj.hasOwnProperty(field);
}

/** Is Empty Array/List/Object/String
 * @param x
 * @return {boolean}
 */
function isEmpty(x) {
    if (hasField(x, 'length')) return x.length <= 0;
    if (isFun(x)) return false;
    if (isObj(x)) return Object.keys(x).length <= 0
    return true;
}

// module.exports = {
//     typeName,
//     isUnd, isNull, isVal,
//     isNum, isStr, isFun,
//     isObj, isArr, isPrim,
//     isList, isMutableList,
//     isSet,isMap, isError,
//     isEl, isEls, hasField,
//     isEmpty, Enum, dict
// };

/**
 * @module core/collections
 * @memberOf core
 */

if (!global._X_LOOP_BREAK_) {
    global._X_LOOP_BREAK_ = Symbol("BREAK_LOOP");
    global._X_ANY_ = Symbol("ANY");
    global._X_ALL_ = Symbol("ALL");
}
/**
 * Break from functional loops: forEach, filter, ...
 * @type {symbol}
 */
const BREAK = global._X_LOOP_BREAK_;
/**
 * Match Any: Used as value in predicate object
 * @type {symbol}
 */
const ANY = global._X_ANY_;
const UNSAFE_PROPS = ['__proto__', 'constructor', '__defineGetter__', '__defineSetter__', 'prototype'];

/**
 * Get item by index from multiple source types
 *
 * @param {Array|Object|String|NodeList|HTMLCollection} s - source
 * @param {Number|String} i - item index
 * @returns {any|null|undefined}
 */
function item(s, i) {
    if (!isVal(s)) return undefined;
    if (isObj(s)) return s[i]
    if (isStr(s)) return s[i]
    if (isArr(s)) return s[i]
    else return s.item(i)
}

/**
 * Source contains value or key:value
 *
 * @param {Array|Object|String} src
 * @param {any} value
 * @param {String|undefined} [key]
 * @returns {boolean}
 */
function contains(src, value, key) {
    if (!isVal(src)) return false;
    if (!isArr(src) && isObj(src)) return src[key] === value;
    return src.indexOf(value) >= 0;
}

function objMatchOne(o, match) {
    let m = Object.keys(match);
    for (let k of m) {
        // if (!T.isObj(o[k])) continue;
        if (match[k] === ANY && o.hasOwnProperty(k)) return true;
        if (match[k] === o[k]) return true;
    }
    return false
}

function objMatchAll(o, match) {
    let m = Object.keys(match);
    for (let k of m) {
        // if (!T.isObj(o[k])) return false;
        if (match[k] === ANY) continue;
        if (match[k] !== o[k]) return false
    }
    return true
}

function predicate(f, def = () => true, inc = true) {
    if (isUnd(f)) return def;
    if (isFun(f)) return f;
    else if (f instanceof RegExp) return (v, k, i, s) => !isObj(v) ? f.test(v.toString()) : false;
    else if (isObj(f)) {
        if (Object.keys(f).length === 0) return def;
        return inc ? (v, k, i, s) => objMatchOne(v, f) : (v, k, i, s) => objMatchAll(v, f);
    } else return (v, k, i, s) => v === f;
}

/**
 * Create empty instance of given source
 *
 * @param {any} src - source object
 * @param {any} def - default value for primitives
 * @returns {any} empty instance of src
 */
function emptyOf(src, def = {}) {
    if (isStr(src)) return "";
    if (isList(src) || isArr(src)) return [];
    if (isObj(src)) {
        if (isEl(src)) {
            if (src.nodeType === 3 || src.nodeType === 8) {
                return document.createTextNode(src.textContent);
            } else {
                return document.createElement(src.tagName);
            }
        }
        if (src.__proto__)
            return Object.create(src.__proto__);
        return {};
    }
    return def
}

/**
 * Type-agnostic concat. !!Mutates target!!
 *
 * @param {Array|String|Object} target
 * @param {Array|String|Object} source
 * @returns {Array|String|Object}
 */
function concat(target, source, override=false) {
    if (isStr(target)) {
        return target.concat(source);
    }
    if (isArr(target)) {
        return target.concat(source);
    }

    for (let k of Object.keys(source)) {
        if (!target[k] || override)
            target[k] = source[k];
    }
    return target
}

/**
 * Type-agnostic forEach loop
 *
 * @param src
 * @param func
 * @returns {number|*}
 */
function forEach(src, func) {
    if (!isVal(src)) return -1;
    if (!isArr(src) || !isStr(src) || !isList(src)) {
        let i = 0;
        let keys = Object.keys(src);
        const len = keys.length;
        for (; i < len; i++) {
            // let r = ;
            const k = keys[i], v = src[k];
            if (func(v, k, i, src) === BREAK) return i;
        }
        return i;
    }
    const len = src.length;
    if (!isArr(src)) {
        for (let i = 0; i < len; i++) {
            const v = src[i];
            let r = func(v, i, i, src);
            if (r === BREAK) return i;
        }
    } else {
        for (let i = 0; i < len; i++) {
            const v = item(src, i);
            let r = func(v, i, i, src);
            if (r === BREAK) return i;
        }
    }
    return src.length
}

/**
 * Type-agnostic forEachRight loop
 *
 * @param src
 * @param func
 * @param range
 * @returns {number|*}
 */
function forEachRight(src, func, range = []) {
    if (!isArr(src) || !isStr(src)) {
        let i = 0;
        let keys = Object.keys(src);
        for (let i = keys.length - 1; i >= 0; i--) {
            if (i < range[1]) continue;
            if (i >= range[0]) return i;
            let r = func(src[keys[i]], keys[i], i, src);
            if (r === BREAK) return i;
        }
        return i;
    }
    for (let i = src.length - 1; i >= 0; i--) {
        let r = func(item(src, i), i, i, src);
        if (r === BREAK) return i;
    }
    return src.length
}

/**
 * A more versatile alternative to native "some" method
 *
 * @param {Array|Object|String|NodeList|HTMLCollection} src
 * @param {Function|Array|Object} pred
 * @returns {boolean}
 */
function any(src, pred) {
    // if (!func){
    //     if (T.isArr(src) || T.isStr(src)) return src.length>0;
    //     return Object.keys(src).length>0;
    // }
    let fn = predicate(pred);
    let r = false;
    forEach(src, function (v, k, i, src) {
        r = fn(v, k, i, src);
        if (r === true) return BREAK;
    });
    return r;
}

function filterStr(src, pred, right = false, omit = false) {
    pred = predicate(pred, () => true);
    let res = "";
    let loop = right ? forEachRight : forEach;
    loop(src, function (v, k, i) {
        if (!pred || pred(v, k, i, src) === omit) res += v;
    });
    return res;
}

function filterObj(src, pred, right = false, omit = false) {
    if (isArr(pred)) {
        let a = Object.assign({}, pred);
        if (omit) pred = (v, k) => !any(a, k);
        else pred = (v, k) => any(a, k);
    } else
        pred = predicate(pred, () => true);
    let res = {};
    // let loop = right ? ForEachRight : ForEach;
    const keys = Object.keys(src);
    const len = keys.length;

    if (!right) {
        for (let i = 0; i < len; i++) {
            const k = keys[i];
            const v = src[k];
            if (pred(v, k, i, src) !== omit) res[k] = v;
        }
    } else {
        for (let i = len-1; i >=0; i--) {
            const k = keys[i];
            const v = src[k];
            if (pred(v, k, i, src) !== omit) res[k] = v;
        }
    }

    // loop(src, function (v, k, i) {
    //     if (pred(v, k, i, src) !== omit) res[k] = v;
    // });
    return res;
}

function filterArr(src, pred, right = false, omit = false) {
    if (isArr(pred)) {
        let a = Object.assign([], pred);
        if (omit) pred = (v, k, i) => !any(a, i);
        else pred = (v, k, i) => any(a, i);
    } else
        pred = predicate(pred, () => true);
    let res = [];
    const len = src.length;
    if (!right) {
        for (let i = 0; i < len; i++) {
            const v = src[i];
            if (pred(v, i, i, src) !== omit) {
                res.push(v);
            }
        }
    } else {
        for (let i = len - 1; i >= 0; i--) {
            const v = src[i];
            if (!pred(v, i, i, src) !== omit) {
                res.push(v);
            }
        }
    }
    return res;
}

/**
 * A more versatile alternative to native "filter" method
 *
 * @param {Array|Object|String|NodeList|HTMLCollection} src - source
 * @param {Function|Array|Object} pred - predicate function/{key:value}/[keys]
 * @param {boolean} [right] - reverse loop
 * @returns {Array|Object|String}
 */
function filter(src, pred, right = false) {
    if (isStr(src)) return filterStr(src, pred, right);
    if (isArr(src) || isList(src)) return filterArr(src, pred, right);
    return filterObj(src, pred, right);
}

/**
 * A more versatile alternative to native "flatMap" method, flattens first level items
 *
 * @param {Array|Object|String|NodeList|HTMLCollection} src - source
 * @param {Function|Array|Object} [transform] - transformer function
 * @returns {Array|Object|String}
 */
function flatMap(src, transform) {
    let res;
    if (isStr(src)) res = "";
    else if (isArr(src)) res = [];
    else res = {};
    forEach(src, function (a, i) {
        let f;
        if (!!transform) {
            f = transform(a, i, src);
        } else {
            if (!isArr(res) && isObj(res)) {
                f = {};
                f[i] = a;
            } else {
                f = a;
            }
        }
        res = concat(res, f);
    });
    return res;
}

/**
 * Recursive deep merge {@param target} with {@param source}
 *
 * @param {Object|Array} target
 * @param {Object|Array} source
 * @param {Array} excludeKeys - keys to be skipped while merging
 * @param maxDepth - maximum recursive depth
 * @param allowUnsafeProps - allow unsafe properties like __proto__
 * @return {Object|Array}
 */
function deepMerge(target,
                   source,
                   {
                       excludeKeys = [],
                       maxDepth = 999,
                       allowUnsafeProps = false
                   } = {excludeKeys: [], maxDepth: 999, allowUnsafeProps: false},
                   depth = 0) {
    if (depth >= maxDepth) return target;
    forEach(source, (v, k) => {
        if (excludeKeys && contains(excludeKeys, k)) return;
        if (allowUnsafeProps && contains(UNSAFE_PROPS, k)) return;
        if (isObj(source[k])) {
            target[k] = deepMerge(emptyOf(source[k]), source[k], {excludeKeys, maxDepth, depth: depth + 1});
        } else
            target[k] = v;
    });
    return target;
}

/**
 * Recursive deep clone {@param source}
 * @see deepMerge
 *
 * @param {Object|Array} source
 * @param {Array} excludeKeys - keys to be skipped while merging
 * @param {Number} [maxDepth] - maximum recursive depth
 * @param {boolean} [allowUnsafeProps] - allow unsafe properties like __proto__
 * @return {Object|Array}
 */
function deepClone(source,
                   {
                       excludeKeys = [],
                       maxDepth = 999,
                       allowUnsafeProps = false
                   } = {excludeKeys: [], maxDepth: 999, allowUnsafeProps: false},) {
    return deepMerge(emptyOf(source), source, {excludeKeys, maxDepth, allowUnsafeProps})
}

// noinspection JSUnusedGlobalSymbols
// module.exports = {
//     ANY, ALL, BREAK, item, contains, add, remove, toggle, concat, emptyOf, objMatchOne, objMatchAll,
//     deepMerge, deepClone, forN, forEachRange, forEach, forEachRight, firstIndex, first,
//     startsWith, lastIndex, last, endsWith, reverse, any, all, filter, filterRight, reduce, reduceRight,
//     map, flatMap, keyValuePairs, entries, maxIndex, max, minIndex, min, shuffle, sortAsc, sortDesc,
//     translateObject, omit, join, groupBy, objectValues
// }

/**
 * @module
 * @memberOf core
 */
/**
 * @static
 * @param name
 * @returns {string}
 */
function kebab(name) {
    let kb = "";
    let pres = false;
    for (let i=0;i<name.length; i++) {
        let c = name.charAt(i);
        if (c === '_') {
            kb += '-';
            pres = true;
            continue;
        }
        if (c >= 'A' && c <= 'Z') {
            if (i>0 && !pres) {
                kb+='-';
            }
        }
        kb+=c.toLowerCase();
        pres = false;
    }
    return kb;
}

// module.exports = {kebab, camel, pascal, snake}

function generateStyles(jss) {
    let styles = [];
    forEach(jss, (val, prop)=>{
        styles.push(`${kebab(prop)}: ${val};`);
    });
    return styles
}

function generateCss(jss, joinWith='\n') {
    return generateStyles(jss).sort((a, b)=>a[0].localeCompare(b[0])).join(joinWith);
}

var JSS = {generateStyles, generateCss};

/**
 * @module
 * @memberOf core
 */

function bodyOf(func) {
    let match = func.toString().match(/{[\w\W]*}/);
    return match===null?func.toString():match[0]
}

/**
 * Check if function bodies are equal
 * @param {Function} f1
 * @param {Function} f2
 * @return {boolean}
 */
function funcBodyEquals(f1, f2) {
    return bodyOf(f1) === bodyOf(f2)
}

/**
 * Debounce function execution.
 * {@link https://css-tricks.com/debouncing-throttling-explained-examples/}
 *
 * @param {Function} func - function
 * @param {Number} afterMs - milliseconds after last call
 * @return {Function} - debounced function
 */
function debounce(func, afterMs) {
    var ___timeout___ = null;

    function debounced(...args) {
        clearTimeout(___timeout___);
        ___timeout___ = setTimeout(function (_this) {
            return func.apply(_this, args)
        }, afterMs, this);

    }

    debounced.flush = function (...args) {
        clearTimeout(___timeout___);
        return func.apply(this, args)
    };
    return debounced
}
// module.exports = {
//     funcBodyEquals,
//     throttle,
//     debounce,
//     bindArgs,
//     once
// }

/**
 * @module DOM
 * @memberOf dom
 */


/**
 * Set listener for event type(s) on element, removes identical event listeners to avoid duplication
 *
 * @param {HTMLElement|Element|Node} target - target element
 * @param {String|Array} event - event type(s)
 * @param {Function} listener
 * @param {AddEventListenerOptions?} [options]
 */
function setEvent(target, event, listener, options) {
    if (!scope.isBrowser()) {
        error("Events are browser only!");
        return
    }
    if (!isArr(event)) {
        if (contains(event,' ')) {
            event = event.split(' ').Map((it)=>it.trim());
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
function clearEvent(target, event) {
    if (!scope.isBrowser()) {
        error("Events are browser only!");
        return
    }
    if (!isArr(event)) {
        if (contains(event,' ')) {
            event = event.split(' ').Map((it)=>it.trim());
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

// export default {setEvent, clearEvent, hasEvent};

function randomId() {
    return (Date.now().toString(24).slice(2)+ Math.random().toString(24).slice(6))
}

function normalize(children, {createText, parent, empty=[], list}) {
    if (!(children instanceof Array)) {
        if (children === null || children === undefined)
            return empty
        else children = [children];
    }
    let norm = [];
    const len = children.length;
    for (let i = 0; i < len; i++) {
        let child = children[i];
        if (child === null || child === undefined || isPrim(child)) {
            if (typeof child === 'symbol') child = child.toString();
            child = createText("" + child);
            child.$parent = parent;
            norm.push(child);
            continue;
        }
        // fragment
        if (child.isNode && child.tag === null) {
            child = child.children || [];
        }
        if (child instanceof Array) {
            child = normalize(child, {createText, parent});
            for (let j = 0; j < child.length; j++) {
                child[j].$parent = parent;
                norm.push(child[j]);
            }
            // norm.push(list(child))
            continue;
        }
        child.$parent = parent;
        norm.push(child);
    }
    if (norm.length === 0) norm = empty;
    return norm
}


function isEventPropKey(key) {
    return /on[A-Z]+/.test(key)
}

function normalizeEventName(eventName) {
    return eventName.slice(2).toLowerCase()
}

function compileProps(props) {
    const cats = {
        events: {},
        attrs: {}
    };
    forEach(props, (v, k)=>{
        if (isEventPropKey(k))
            cats.events[normalizeEventName(k)] = v;
        else
            cats.attrs[k] = v;
    });
    return cats
}

function compileStyles(styles, joinWith) {
    if (!isVal(styles)) return ''
    else if (isStr(styles)) return styles
    else if (isArr(styles)) return styles.join(joinWith)
    return JSS.generateCss(styles, joinWith)
}

function setElementProps(element, attrs, events, view) {
    if (attrs) {
        forEach(attrs, (val, key) => {
            if (key === 'style') {
                val = compileStyles(val, ' ');
            } else if (key === 'className') {
                key = 'class';
            }
            element.setAttribute(key, val);
        });
    }

    if (events) {
        forEach(events, (v, k) => {
            if (view) v = v.bind(view);
            setEvent(element, k, v);
        });
    }
}

function sameProps(currentProps={}, newProps={}) {
    const curKeys = Object.keys(currentProps);
    const newKeys = Object.keys(newProps);
    if (curKeys.length !== newKeys.length) return false
    for (let curKey of curKeys) {
        if (newProps[curKey] !== currentProps[curKey]) return false
    }
    return true
}

/**
 *
 * @param {String|null} tag
 * @param {Object|String} prop
 * @param {any[]} [children]
 * @constructor
 */
function VNode(tag = "#text", prop, children) {
    tag = tag.toLowerCase();
    this.tag = tag;
    this.element = undefined;

    if (tag === '#text') {
        this.$t = TYPE.TEXT;
        this.isText = true;
        this.text = prop;
        Object.defineProperty(this, '$clone', {
            value: function () {
                return createText(this.text)
            },
            configurable: false,
            writable: false,
            enumerable: false
        });
        return;
    }

    this.$t = TYPE.NODE;
    this.isNode = true;
    let cp = compileProps(prop || {});
    this.attrs = cp.attrs;
    this.events = cp.events;
    this.props = cp.props;
    this.children = normalize(children || [], {createText, parent: this});

    this.isEmpty = () => this.children.length === 0;

    Object.defineProperty(this, '$clone', {
        value: function () {
            return new VNode(this.tag, deepClone(this.props || {}), (children || []).map(c => c.$clone()))
        }
    });
}
Object.defineProperty(VNode.prototype, '$parent', {
    value: undefined,
    configurable: false,
    writable: true,
    enumerable: false
});
Object.defineProperty(VNode.prototype, 'isEmpty', {
    get() {
        return this.children.length === 0
    }
});
VNode.prototype.$destroy = function () {
    this.element.remove();
};
function createNode(tag, props, children) {
    return new VNode(tag, props, children)
}

function createText(text) {
    return new VNode("#text", text)
}

function createElement(tag, attrs, events, parentView) {
    let el = document.createElement(tag);
    setElementProps(el, attrs, events, parentView);
    return el;
}

function createTextDom(text) {
    return document.createTextNode(text);
}

function createChildrenDom(nodes, parentView, rootElement) {
    return nodes.flatMap((n)=>createDom(n, parentView, rootElement))
}

function createViewDom(view, rootElement) {
    if (view.beforeMount) {
        try {
            view.beforeMount.call(view);
        } catch (e) {
            setTimeout(()=>error('(' + view.$name + ').beforeMount', e));
        }
    }
    if (!view.$nodes) {
        // view.$updateWith(view.props)
        view.$renderAndSetNodes();
    }
    view.$rootElement = rootElement;
    let elements = view.$nodes.map(ch => ch.$isView ? createViewDom(ch, rootElement) : createNodeDom(ch, view));
    if (view.Mounted) {
        setTimeout(function () {
            try {
                view.Mounted.call(view);
            } catch (e) {
                error('(' + view.$name + ').Mounted', e);
            }
        }, 0);
    }
    view.$isDirty = false;
    return elements
}

function createNodeDom(node, parentView) {
    if (node.isText) {
        node.element = createTextDom(node.text);
        node.element.__node = node;
        return node.element;
    }

    node.element = createElement(node.tag, node.attrs, node.events, parentView);

    node.element.__node = node;

    if (!node.isEmpty) {
        let el = node.children.map(c => createDom(c, parentView, node.element));
        HTMLElement.prototype.append.apply(node.element, normalize(el, {createText, parent: this}));
    }

    return node.element;
}

function createDom(node, parentView, rootElement) {
    return node.$isView ? createViewDom(node, rootElement) : createNodeDom(node, parentView)
}

function render(view, rootElement) {
    if (!rootElement) throw Error('render(): rootElement is undefined');
    let current = rootElement.__app;
    if (current) {
        console.error('already rendered');
        return;
    }
    view.$rootElement = rootElement;
    rootElement.innerHTML = "";
    let els = createDom(view, view, rootElement);
    if (!(els instanceof Array)) els = [els];
    els = flatMap(els);
    for (let i = 0; i < els.length; i++) {
        Node.prototype.appendChild.call(rootElement, els[i]);
    }
    rootElement.__app = view;
}

function patchAttrs(newAttrs, oldAttrs, element) {
    const newKeys = Object.keys(newAttrs);
    const currentKeys = Object.keys(oldAttrs);

    const keys = Object.keys(newAttrs);
    // const len = keys.length
    // console.log(newAttrs, oldAttrs)
    for (let key of keys) {
        const newVal = newAttrs[key];
        // if (currentKeys.indexOf(key) < 0) {
        //     element.setAttribute(key, newVal)
        // } else {
        const curVal = oldAttrs[key];
        if (key === 'style') {
            const newStyle = compileStyles(newVal, ' ');
            const currentStyle = compileStyles(curVal, ' ');
            if (newStyle !== currentStyle) {
                //     console.log()
                element.setAttribute('style', newStyle);
            }
        } else if (key === 'className') {
            element.setAttribute('class', newVal);
        } else {
            element.setAttribute(key, newVal);
        }
        // }
    }
    for (let key of currentKeys) {
        if (newKeys.indexOf(key) < 0) {
            element.removeAttribute(key);
        }
    }
}

function patchEvents(newEvents={}, oldEvents={}, element) {
    forEach(oldEvents, function (listener, event) {
        if (newEvents[event] !== listener) {
            clearEvent(element, event);
        }
    });
    forEach(newEvents, function (listener, event) {
        // console.log(event, listener)
        setEvent(element, event, listener);
    });
}

// const {randomId} = require("./utils");

function updateView(view) {
    // view.$isDirty = true;
    dispatchTask(() => {
        patchView(view, view.props, view.$children);
        // view.$isDirty = false;
    });
}

function patchView(view, props, children) {
    if (view.shouldUpdate) {
        try {
            if (!view.shouldUpdate.call(view, {oldProps: view.props, newProps: props})) return;
        } catch (e) {
            setTimeout(()=>error('(' + view.$name + ').shouldUpdate', e), 0);
        }
    } else {
        if (!view.$isDirty) return;
    }
    if (view.beforeUpdate) {
        try {
            view.beforeUpdate.call(view, props);
        } catch (e) {
            setTimeout(()=>error('(' + view.$name + ').Updated', e));
        }
    }
    view.$updateWith(props, children);
    const newNodes = view.$renderNodes();
    view.$nodes = patchNodes(newNodes, view.$nodes, view, view.$rootElement);
    view.$isDirty = false;
    if (view.Updated) {
        setTimeout(function () {
            try {
                view.Updated.call(view);
            } catch (e) {
                error('(' + view.$name + ').Updated', e);
            }
        }, 0);
    }
}

function patchNode(_new, _cur, view) {
    if (_new.tag === _cur.tag) {
        _new.element = _cur.element;
        _new.element.__node = _new;
        _cur.element = null;
        if (!sameProps(_cur.props, _new.props)) {
            // console.log('PATCH', _cur.tag)
            patchAttrs(_new.attrs, _cur.attrs, _new.element);
            patchEvents(_new.events, _cur.events, _new.element);
        }
        if (!_new.element) {
            error('Fatal: current node has no element', _cur, _new);
        }
        // VNode children
        // dispatchTask(()=>patchNodes(_new.children, _cur.children, view, _new.element))
        patchNodes(_new.children, _cur.children, view, _new.element);
    } else {
        // console.log('REPLACE', _cur.tag, _new.tag);
        _new.element = createNodeDom(_new, view);
        _cur.element.replaceWith(_new.element);
        _new.element.__node = _new;
    }

}

function patchText(_new, _cur) {
    if (_new.text !== _cur.text) {
        _cur.element.nodeValue = _new.text;
    }
    _new.element = _cur.element;
    _new.element.__node = _new;
}

function swapElements(_new, _cur) {
    let curSlot = createNodeDom(createNode('div', {style: 'display: none'}));
    let curNodes = _cur.$isView ? _cur.$elements : [_cur.element];
    let newNodes = _new.$isView ? _new.$elements : [_new.element];
    curNodes[0].insertAdjacentElement('beforeBegin', curSlot);
    newNodes[0].replaceWith(...curNodes);
    curSlot.replaceWith(...newNodes);
}

function patchOrReplaceView(_new, _cur, newNodes, currentNodes, idx, curLen, newLen, parentView, rootElement) {
    let keysMatch = false;
    if (_new.props.key !== undefined) {
        let prev = -1;
        for (let i = idx; i < curLen; i++) {
            if (currentNodes[i].props.key === _new.props.key) {
                prev = i;
                keysMatch = true;
                break;
            }
        }
        if (prev > idx) {
            // _cur === currentNodes[idx]
            // if ((newLen<curLen && prev > curLen))
            swapElements(currentNodes[prev], currentNodes[idx]);
            // set current as prev
            currentNodes[idx] = currentNodes[prev];
            // set prev as _cur
            currentNodes[prev] = _cur;
            _cur = currentNodes[idx];
        }
    }

    if ((_cur.$name === _new.$name) && (keysMatch)) {
        patchView(_cur, _new.props, _new.$children);
        _cur.$parent = _new.$parent;
        _new.$parent = undefined;
        newNodes[idx] = _cur;
    } else {
        // console.log(idx, _cur, _new)
        let anchor = _cur.$destroy(true);
        if (_new.$isView) {
            let el = createViewDom(_new, rootElement);
            Element.prototype.replaceWith.apply(anchor, el);
        } else {
            let el = createNodeDom(_new, parentView);
            anchor.replaceWith(el);
            _new.element = el;
            _new.element.__node = _new;
        }

    }

}

function replaceNodes(_new, _cur, parentView, rootElement) {
    const el = createDom(_new, parentView, rootElement);
    let anchor = undefined;
    if (_cur.isNode || _cur.isText) {
        anchor = _cur.element;
    } else {
        anchor = _cur.$destroy(true);
    }
    if (anchor) {
        Element.prototype.replaceWith.apply(anchor, el instanceof Array ? el : [el]);
        _new.element = el;
        _new.element.__node = _new;
    } else {
        console.error('Empty anchor', _cur);
    }
}

function patchNodes(newNodes, currentNodes, parentView, rootElement) {
    if (!rootElement) throw Error('patchNodes: rootElement is not defined');
    let newLen = newNodes.length;
    let curLen = currentNodes.length;
    let added = newLen > curLen;
    let len = added ? curLen : newLen;
    let idx = 0;
    for (; idx < len; idx++) {
        const _cur = currentNodes[idx];
        const _new = newNodes[idx];
        if (_cur.$t === _new.$t) {
            if (_cur.isNode) {
                patchNode(_new, _cur, parentView);
                continue;
            }
            if (_cur.isText) {
                patchText(_new, _cur);
                continue;
            }
            patchOrReplaceView(_new, _cur, newNodes, currentNodes, idx, curLen, newLen, parentView, rootElement);
        } else {
            replaceNodes(_new, _cur, parentView, rootElement);
        }
    }
    if (added) {
        let elements = createChildrenDom(newNodes.slice(idx), parentView, rootElement);
        HTMLElement.prototype.append.apply(rootElement, elements);
    } else if (curLen > newLen) {
        for (let i = idx; i < curLen; i++) {
            currentNodes[i].$destroy();
        }
    }
    return newNodes;
}

/**
 * @param {Object} args.state
 * @param {String} [args.name]
 * @param {Function} args.render
 * @param {Function} args.beforeUpdate
 * @param {Function} args.Updated
 * @param {Function} args.beforeMount
 * @param {Function} args.Mounted
 * @param {Function} args.beforeCreate
 * @param {Function} args.Created
 * @constructor
 */
function View(args = {}) {
    this.$t = TYPE.VIEW;
    args.name = args.name || 'View' + '::' + randomId();
    this.$name = args.name;
    this.$proto = Object.freeze(args);
    let props = Object.getOwnPropertyNames(args);
    for (let i = 0; i < props.length; i++) {
        const prop = props[i];
        if (args[prop] instanceof Function) {
            this[prop] = args[prop].bind(this);
        } else {
            this[prop] = deepClone(args[prop]);
        }
    }

    // this.$instanceId = Symbol('view')
    // this.$instanceId = randomId();
    this.props = this.props || {};
    this.state = this.state || {};
    // this.$children = [];
    if (!this.render) {
        warn("View has no render!");
        this.render = () => "";
    }

    Object.defineProperty(this, '$elements', {
        get() {
            return this.$nodes.flatMap((n) => {
                if (n === undefined || n === null) return [];
                if (n.$isView) return n.$elements;
                return n.element
            });
        }
    });
}

Object.defineProperty(View.prototype, '$parent', {
    value: undefined,
    configurable: false,
    writable: true,
    enumerable: false
});
View.prototype.$isView = true;

View.prototype.$clone = function () {
    return new View({...this.$proto});
};

View.prototype.$updateWith = function (props, children) {
    if (props.key) {
        this.$key = props.key;
        // delete props.key
    }
    this.props = {...this.props, ...props};
    this.$children = normalize(children, {createText});
    return this
};

View.prototype.$renderNodes = function () {
    return normalize(this.render({props: this.props, state: this.state}),
        {createText, parent: this, empty: [createNode('slot', {style: 'display: none'})]})
};

View.prototype.$renderAndSetNodes = function () {
    if (this.beforeCreate)
        try {
            this.beforeCreate();
        } catch (e) {
            setTimeout(()=>error('(' + this.$name + ').beforeCreate()', e));
        }
    this.$nodes = this.$renderNodes();
    if (this.Created)
        try {
            this.Created();
        } catch (e) {
            setTimeout(()=>error('(' + this.$name + ').Created()', e));
        }
    return this
};

View.prototype.$destroy = function (getAnchor) {
    if (this.beforeDestroy) {
        try {
            this.beforeDestroy();
        } catch (e) {
            setTimeout(()=>error('(' + this.$name + ').beforeDestroy()', e));
        }
    }
    // first real dom element
    let firstEl = undefined;
    for (let i = 0; i < this.$nodes.length; i++) {
        let n = this.$nodes[i];
        if (n.element) {
            if (!firstEl) firstEl = n.element;
            else n.element.remove();
        } else {
            firstEl = firstEl || n.$destroy();
        }
    }
    if (getAnchor) return firstEl
    else (firstEl && firstEl.remove());
};

View.prototype.$clean = function () {
    this.$nodes = undefined;
    this.state = undefined;
    this.props = undefined;
};
//
View.prototype.$update = debounce(function () {
    updateView(this);
}, 20);
//
// View.prototype.$update = function () {
//     updateView(this);
// };

View.prototype.setState = function (fn) {
    let state = this.state;
    fn.call(this, state);
    // this.$isDirty = !sameProps(this.state, state);
    this.$isDirty = true;
    // console.log('setState', this)
    this.$update();
};

function h(type, prop, ...children) {
    if (type === null) {
        return children || [];
    }
    if (prop === null || prop === undefined) {
        prop = {};
    }
    if (type.$isView) {
        // return renderView(type.$clone(), prop, children);
        return type.$clone().$updateWith(prop, children)
    }

    return createNode(type, prop, normalize(children, {createText}));
}

function t(text) {
    return createText(text)
}

module.exports = {h, t};

/**
 * @type {function(*): View}
 * @alias createView
 */
const createComponent = createView;
/**
 * @type {function(type, props, ...children): View|VNode}
 */
const jsx = h;

/**
 * @param {{attachTo: function(type)}} plugin
 */
const use = function (plugin) {
    plugin.attachTo(View);
};

module.exports = {SUI:{
    View, createComponent, jsx, mount: render, use
}};
