'use strict';

require("@skaar/core/scope");
const TYPE = require("./type");
const {updateView} = require("./patch");
const {debounce} = require("@skaar/core/functions");
const {error: error$1} = require("@skaar/core/logging");
const {randomId, normalize: normalize$2, sameProps} = require("./utils");
const {createNode: createNode$1} = require("./vnode");
const {warn} = require("@skaar/core/logging");
const {deepClone} = require("@skaar/core/collections");
const {createText: createText$2} = require("./vnode");

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
function View$1(args = {}) {
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

Object.defineProperty(View$1.prototype, '$parent', {
    value: undefined,
    configurable: false,
    writable: true,
    enumerable: false
});
View$1.prototype.$isView = true;

View$1.prototype.$clone = function () {
    return new View$1({...this.$proto});
};

View$1.prototype.$updateWith = function (props, children) {
    if (props.key) {
        this.$key = props.key;
        // delete props.key
    }
    this.props = {...this.props, ...props};
    this.$children = normalize$2(children, {createText: createText$2});
    return this
};

View$1.prototype.$renderNodes = function () {
    return normalize$2(this.render({props: this.props, state: this.state}),
        {createText: createText$2, parent: this, empty: [createNode$1('slot', {style: 'display: none'})]})
};

View$1.prototype.$renderAndSetNodes = function () {
    if (this.beforeCreate)
        try {
            this.beforeCreate();
        } catch (e) {
            setTimeout(error$1('(' + this.$name + ').beforeCreate()', e));
        }
    this.$nodes = this.$renderNodes();
    if (this.Created)
        try {
            this.Created();
        } catch (e) {
            setTimeout(error$1('(' + this.$name + ').Created()', e));
        }
    return this
};

View$1.prototype.$destroy = function (getAnchor) {
    if (this.beforeDestroy) {
        try {
            this.beforeDestroy();
        } catch (e) {
            setTimeout(error$1('(' + this.$name + ').beforeDestroy()', e));
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

View$1.prototype.$clean = function () {
    this.$nodes = undefined;
    this.state = undefined;
    this.props = undefined;
};
//
View$1.prototype.$update = debounce(function () {
    updateView(this);
}, 20);
//
// View.prototype.$update = function () {
//     updateView(this);
// };

View$1.prototype.setState = function (fn) {
    let state = this.state;
    fn.call(this, state);
    // this.$isDirty = !sameProps(this.state, state);
    this.$isDirty = true;
    // console.log('setState', this)
    this.$update();
};

// View.prototype.$update = debounce(function () {
//     this.$isDirty = true;
//     // console.trace('$update', this.$name, this.props)
//     dispatchTask(() => patchView(this, this.props, this.$children), this.$instanceId)
// }, 5)


function isViewClass(cls) {
    return Object.prototype.isPrototypeOf.call(View$1, cls)
}

function getViewInstance(view, newArgs) {
    if (isViewClass(view)) {
        return new view(newArgs)
    }
    if (view instanceof View$1) {
        return view;
    }
    if (view === View$1) {
        return new View$1(newArgs)
    }
    throw TypeError("Cannot get view instance of " + view)
}

function renderView(view, props, children) {
    // // if (!view.props) view.props = {};
    // if (props) {
    //     concat(view.props, props, true);
    // }

    // if (children) {
    children = normalize$2(children || [], {createText: createText$2});
    view.$children = children;
    // }
    view.$updateWith(props, children);
    view.$renderAndSetNodes();

    return view;
}

/**
 * @typedef View
 * @class
 * @member {Function} beforeCreate
 * @member {Function} Created
 * @member {Function} beforeMount
 * @member {Function} Mounted
 * @member {Function} beforeUpdate
 * @member {Function} Updated
 * @member {Function} beforeDestroy
 */
module.exports = {
    View: View$1, isViewClass, getViewInstance, createView: function (args) {
        return new View$1(args)
    }, renderView
};

const {normalize: normalize$1} = require("./utils");
require("./view");
const {createNode, createText: createText$1} = require("./vnode");

function h$1(type, prop, ...children) {
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

    return createNode(type, prop, normalize$1(children, {createText: createText$1}));
}

function t(text) {
    return createText$1(text)
}

module.exports = {h: h$1, t};

const {error} = require("@skaar/core/logging");
const {flatMap} = require("@skaar/core/collections");
require("./vnode");
const {normalize, setElementProps} = require("./utils");
const {createText} = require("./vnode");

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
            setTimeout(error('(' + view.$name + ').beforeMount', e));
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

function render$1(view, rootElement) {
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

module.exports = {render: render$1, createDom, createNodeDom, createViewDom, createTextDom, createChildrenDom, createElement};

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
