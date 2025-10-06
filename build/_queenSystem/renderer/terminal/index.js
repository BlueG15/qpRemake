"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = exports.rng = exports.add = exports.TerminalModule = exports.Terminal = void 0;
const terminal_1 = require("./terminal");
Object.defineProperty(exports, "Terminal", { enumerable: true, get: function () { return terminal_1.Terminal; } });
const terminalModule_1 = __importDefault(require("./terminalModule"));
Object.defineProperty(exports, "TerminalModule", { enumerable: true, get: function () { return terminalModule_1.default; } });
const math_1 = require("./utils/math");
Object.defineProperty(exports, "add", { enumerable: true, get: function () { return math_1.add; } });
Object.defineProperty(exports, "rng", { enumerable: true, get: function () { return math_1.rng; } });
const timing_1 = require("./utils/timing");
Object.defineProperty(exports, "delay", { enumerable: true, get: function () { return timing_1.delay; } });
