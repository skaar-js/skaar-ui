import {normalize} from "./utils";
import {renderView} from "./view";
import {createNode, createText} from "./vnode";


export function h(type, prop, ...children) {
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

export function t(text) {
    return createText(text)
}

module.exports = {h, t}