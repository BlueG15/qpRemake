"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalAutoInput = void 0;
const utils_1 = require("../terminal/utils");
class TerminalAutoInput extends utils_1.TerminalModule {
    constructor(cmd, count = 1) {
        super();
        this.cmd = cmd;
        this.count = count;
    }
    start() {
        if (!this.terminalPtr)
            return;
        for (let i = 0; i < this.count; i++)
            this.terminalPtr.event.emit("input", this.cmd);
    }
}
exports.TerminalAutoInput = TerminalAutoInput;
