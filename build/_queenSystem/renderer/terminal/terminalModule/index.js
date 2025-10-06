"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const debugModule_1 = require("./debugModule");
const menuModule_1 = require("./menuModule");
const exitModule_1 = require("./exitModule");
const autoInputModule_1 = require("./autoInputModule");
const fieldModule_1 = require("./fieldModule");
exports.default = {
    debug: debugModule_1.TerminalDebugModule,
    menu: menuModule_1.TerminalMenuModule,
    exit: exitModule_1.TerminalExitModule,
    input: autoInputModule_1.TerminalAutoInput,
    field: fieldModule_1.qpFieldModule
};
