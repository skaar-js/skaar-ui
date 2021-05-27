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
export const LogLevels = {TRACE:0, INFO:1, WARN:2, ERROR:3, SILENT:-1};
/**
 * Log config
 * @type {{LogLevel: *}}
 */
export const Config = {
    LogLevel : LogLevels.TRACE
}

/** Set `Config.LogLevel` to TRACE */
export function showTrace() {Config.LogLevel = LogLevels.TRACE;}

/** Set `Config.LogLevel` to INFO */
export function showInfo() {Config.LogLevel = LogLevels.INFO;}

/** Set `Config.LogLevel` to WARN */
export function showWarn() {Config.LogLevel = LogLevels.WARN;}

/** Set `Config.LogLevel` to ERROR */
export function showError() {Config.LogLevel = LogLevels.ERROR;}

/** Set `Config.LogLevel` to SILENT */
export function silent() {Config.LogLevel = LogLevels.SILENT;}

/** Set Config.LogLevel
 * @param l - LogLevel */
export function lvl(l) {
    return Config.LogLevel !== LogLevels.SILENT && Config.LogLevel <= l
}

/**
 * Log Trace
 * @param {any} args
 */
export function trace(...args) {
    if (!lvl(LogLevels.TRACE)) return;
    args.reverse();
    args.push(_logTitle("🔍 TRACE"));
    args.reverse();    // args.push("\n");
    console.trace.apply(this, args);
}
/**
 * Log Info
 * @param {any} args
 */
export function info(...args) {
    if (!lvl(LogLevels.INFO)) return;
    _prepareLog(args, _logTitle("🔵 INFO"));
    console.log.apply(this, args);
}
/**
 * Log Warning
 * @param {any} args
 */
export function warn(...args) {
    if (!lvl(LogLevels.WARN)) return;
    _prepareLog(args, _logTitle("🚨 WARN"));
    console.warn.apply(this, args);
}
/**
 * Log Error
 * @param {any} args
 */
export function error(...args) {
    if (!lvl(LogLevels.ERROR)) return;
    _prepareLog(args, _logTitle("💥 ERROR"));
    console.error.apply(this, args);
}

// module.exports = {
//     Config,
//     LogLevels,
//     showTrace, showInfo, showWarn, showError, silent, trace, info, warn, error
// };