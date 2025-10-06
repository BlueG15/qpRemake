"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalExitModule = void 0;
const utils_1 = require("../terminal/utils");
class TerminalExitModule extends utils_1.TerminalModule {
    start() {
        process.exit(0);
    }
}
exports.TerminalExitModule = TerminalExitModule;
