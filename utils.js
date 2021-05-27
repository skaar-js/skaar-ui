import JSS from "./jss";
import {setEvent} from "./dom/event";
import {forEach} from "./core/collections";
import {isArr, isPrim, isStr, isVal} from "./core/types";

export function randomId() {
    return (Date.now().toString(24).slice(2)+ Math.random().toString(24).slice(6))
}

export function normalize(children, {createText, parent, empty=[], list}) {
    if (!(children instanceof Array)) {
        if (children === null || children === undefined)
            return empty
        else children = [children]
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


export function isEventPropKey(key) {
    return /on[A-Z]+/.test(key)
}

export function normalizeEventName(eventName) {
    return eventName.slice(2).toLowerCase()
}

export function compileProps(props) {
    const cats = {
        events: {},
        attrs: {}
    }
    forEach(props, (v, k)=>{
        if (isEventPropKey(k))
            cats.events[normalizeEventName(k)] = v
        else
            cats.attrs[k] = v
    })
    return cats
}

export function compileStyles(styles, joinWith) {
    if (!isVal(styles)) return ''
    else if (isStr(styles)) return styles
    else if (isArr(styles)) return styles.join(joinWith)
    return JSS.generateCss(styles, joinWith)
}

export function setElementProps(element, attrs, events, view) {
    if (attrs) {
        forEach(attrs, (val, key) => {
            if (key === 'style') {
                val = compileStyles(val, ' ')
            } else if (key === 'className') {
                key = 'class'
            }
            element.setAttribute(key, val)
        })
    }

    if (events) {
        forEach(events, (v, k) => {
            if (view) v = v.bind(view)
            setEvent(element, k, v)
        })
    }
}

export function randomHexColor() {
    return '#'+(Math.random().toString(16)).slice(2, 8)
}

export function sameProps(currentProps={}, newProps={}) {
    const curKeys = Object.keys(currentProps)
    const newKeys = Object.keys(newProps)
    if (curKeys.length !== newKeys.length) return false
    for (let curKey of curKeys) {
        if (newProps[curKey] !== currentProps[curKey]) return false
    }
    return true
}

export default {randomId, normalize, setElementProps, compileProps, compileStyles, sameProps, randomHexColor};