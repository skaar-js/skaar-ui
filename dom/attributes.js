/**
 * @module DOM
 * @memberOf dom
 */

import * as I from "../core/collections";
import * as T from "../core/types";

/**
 * Get all element attributes
 * @param {HTMLElement|Element|Node} e - element
 * @return {Object}
 */
export function getAttributes(e) {
    let atr = {};
    I.forEach(e.getAttributeNames(), (n) => atr[n] = e.getAttribute(n));
    return atr;
}

/**
 *
 * @param {HTMLElement|Element|Node} e - element
 * @param {String} a - attribute name
 * @param {String} [v] - attribute value
 * @return {boolean}
 */
export function hasAttr(e, a, v) {
    if (e.hasAttribute(a)) {
        if (v) return e.getAttribute(a) === v
        return true
    }

    return false
}

/**
 * Get element attribute
 * @param {HTMLElement|Element|Node} e - element
 * @param {String} a - attribute name
 * @return {string} - attribute value
 */
export function getAttr(e, a) {
    return e.getAttribute(a)
}

/**
 * Set element attribute
 * @param {HTMLElement|Element|Node} e - element
 * @param {String} a - attribute name
 * @param {String} [v] - attribute value
 */
export function setAttr(e, a, v) {
    if (T.isArr(a)) {
        I.forEach(a, (n) => this.set(n, v))
    } else if (T.isObj(a)) {
        I.forEach(a, (v, k) => this.set(k, v))
    } else {
        e.setAttribute(a, v);
    }
}

/**
 * Element attributes CRUD wrapper
 * @memberOf dom
 */
export class Attributes {
    /**
     * @param {HTMLElement|Element|Node} e - element
     */
    constructor(e) {
        this.element = e;
    }

    /**
     * All attribute names
     * @return {String[]}
     */
    keys() {
        return this.element.getAttributeNames()
    }

    /**
     * All attributes
     * @return {Object}
     */
    all() {
        return getAttributes(this.element);
    }

    /**
     * Set attribute
     * @param {String} a - attribute name
     * @param {String} v - attribute value
     * @return {this}
     */
    set(a, v) {
        setAttr(this.element, a, v);
        return this;
    }

    /**
     * Get attribute
     * @param {String} a - attribute name
     * @return {String}
     */
    get(a) {
        return getAttr(this.element, a)
    }

    /**
     * Has attribute
     * @param {String} a - attribute name
     * @param {String} v - attribute value
     * @return {boolean}
     */
    has(a, v) {
        return hasAttr(this.element, a, v);
    }

    /**
     * Remove attribute
     * @param a
     */
    remove(a) {
        this.set(a, undefined);
    }
}

/**
 * Equivalent of `[new Attributes(e)]{@link dom.Attributes}`
 * @param {HTMLElement|Element|Node} e - element
 * @return {dom.Attributes}
 */
export function attrs(e) {
    return new Attributes(e)
}

// module.exports = {getAttributes, Attributes, getAttr, hasAttr, setAttr, attrs}