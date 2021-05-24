import "./view";
import "./h";
import "./render";

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
}

module.exports = {SUI:{
    View, createComponent, jsx, mount: render, use
}}