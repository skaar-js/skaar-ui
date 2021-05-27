import H from "./hscript-minimal";
import {createDom, render} from "./render";
import {createView, View} from "./view";
import {createNode, createText, VNode} from "./vnode";
import {h} from "./h";
import {Store} from "./store";

global.SUI = {
    View, createView, VNode, createNode, createText, jsx: h,
    mount: render, createComponent:View.create, renderDom:createDom, Store
}

global.h = h;
global.jsx = h;
global.v = H;