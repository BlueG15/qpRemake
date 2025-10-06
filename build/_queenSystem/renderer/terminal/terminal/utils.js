"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalModule = exports.TerminalEventEmitter = exports.TerminalSettings = exports.realLen = void 0;
exports.convertEscapeToLiteral = convertEscapeToLiteral;
const node_events_1 = require("node:events");
const string_width_1 = __importDefault(require("string-width"));
function convertEscapeToLiteral(str) {
    const escaped = JSON.stringify(str);
    const withoutQuotes = escaped.slice(1, -1);
    return Array.from(withoutQuotes).join("");
}
const realLen = (s) => (0, string_width_1.default)(s);
exports.realLen = realLen;
class TerminalSettings {
    constructor() {
        this.values = {
            caretChar: "│",
        };
    }
    get(c) {
        return this.values[c];
    }
}
exports.TerminalSettings = TerminalSettings;
class TerminalEventEmitter extends node_events_1.EventEmitter {
    emit(event, ...args) {
        return super.emit(event, ...args);
    }
    on(event, listener) {
        return super.on(event, listener);
    }
    once(event, listener) {
        return super.once(event, listener);
    }
    off(event, listener) {
        return super.off(event, listener);
    }
    removeListener(event, listener) {
        return super.removeListener(event, listener);
    }
    addListener(event, listener) {
        return super.addListener(event, listener);
    }
}
exports.TerminalEventEmitter = TerminalEventEmitter;
class TerminalModule {
    constructor() {
        this.listened = [];
    }
    listen(event, listener) {
        if (!this.terminalPtr)
            return;
        this.listened.push([event, listener]);
        this.terminalPtr.event.on(event, listener);
    }
    bind(terminal) {
        this.terminalPtr = terminal;
    }
    start() { }
    stop() {
        if (!this.terminalPtr)
            return;
        this.listened.forEach(([k, f]) => this.terminalPtr.event.off(k, f));
    }
}
exports.TerminalModule = TerminalModule;
