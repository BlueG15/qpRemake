"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalDebugModule = void 0;
const chalk_1 = __importDefault(require("chalk"));
const utils_1 = require("../terminal/utils");
class TerminalDebugModule extends utils_1.TerminalModule {
    constructor(format = ["white"], pre = "") {
        super();
        this.format = format;
        this.pre = pre;
    }
    formatStr(str) {
        return this.format.reduce((prev, cur) => chalk_1.default[cur](prev), str);
    }
    log(data) {
        if (!this.terminalPtr)
            return;
        const d = data.toString("hex");
        const codes = d.split("").map(c => c.charCodeAt(0));
        const guessNumber = Number.parseInt(d, 16);
        const guessCharacter = String.fromCharCode(guessNumber);
        const str = `l = ${d.length}, d = ${d}, codes = [${codes}], guess = ${guessCharacter}`;
        this.terminalPtr.log(this.pre + "  " + this.formatStr(str));
    }
    start() {
        var _a;
        (_a = this.terminalPtr) === null || _a === void 0 ? void 0 : _a.log("Log everything is live!");
        this.listen("keyboard", this.log.bind(this));
    }
}
exports.TerminalDebugModule = TerminalDebugModule;
