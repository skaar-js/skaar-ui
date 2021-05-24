// const {map} = require("../../core/collections");
const {error} = require("../../core/logging");

function Store({state, mutations}) {
    this.state = state || {};

    this.listeners = [];

    this.mutations = mutations || {};

    this.actions = mutations || {};

    this.subscribe = function (listener) {
        this.listeners.push(listener);
        return () => this.unSubscribe(listener);
    }

    this.unSubscribe = function (listener) {
        try {
            this.listeners.splice(this.listeners.findIndex((l) => l === listener), 1);
        } catch (e) {
            error(e)
        }
    }

    this.dispatch = function (actionFn) {
        actionFn.call()
    }
}

module.exports = {crea}