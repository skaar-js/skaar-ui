import TYPE from "./type";
import {deepClone, flatMap} from "./core/collections";
import {compileProps, normalize, setElementProps} from "./utils";

/**
 *
 * @param {String|null} tag
 * @param {Object|String} prop
 * @param {any[]} [children]
 * @constructor
 */
export function VNode(tag = "#text", prop, children) {
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
        })
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
    })
}
Object.defineProperty(VNode.prototype, '$parent', {
    value: undefined,
    configurable: false,
    writable: true,
    enumerable: false
})
Object.defineProperty(VNode.prototype, 'isEmpty', {
    get() {
        return this.children.length === 0
    }
})
VNode.prototype.$destroy = function () {
    this.element.remove();
}
export function createNode(tag, props, children) {
    return new VNode(tag, props, children)
}

export function createText(text) {
    return new VNode("#text", text)
}

export default {VNode, TYPE, createNode, createText};