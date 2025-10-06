"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalMenuModule = void 0;
const chalk_1 = __importDefault(require("chalk"));
const utils_1 = require("../terminal/utils");
const strip_ansi_1 = __importDefault(require("strip-ansi"));
class TerminalMenuModule extends utils_1.TerminalModule {
    get currChoice() { return this.___i; }
    set currChoice(n) {
        if (this.choices.length === 0) {
            this.___i = 0;
            return;
        }
        this.___i = ((n % this.choices.length) + this.choices.length) % this.choices.length;
    }
    constructor(choices, branchToTargets = [], chosenStr = "=>", chosenStrFormat = ["green"], pre, post, frame = 20) {
        super();
        this.choices = choices;
        this.branchToTargets = branchToTargets;
        this.chosenStr = chosenStr;
        this.chosenStrFormat = chosenStrFormat;
        this.pre = pre;
        this.post = post;
        this.frame = frame;
        this.x_offset = 0;
        this.x_scroll_delay = 10;
        this.x_scroll_speed_counter = 0;
        this.___i = 0;
    }
    formatStr(str) {
        return this.chosenStr + " " + this.chosenStrFormat.reduce((prev, cur) => chalk_1.default[cur](prev), str);
    }
    log() {
        if (!this.terminalPtr)
            return;
        this.terminalPtr.clear();
        const halfFrame = Math.floor(this.frame / 2);
        let beginIndex;
        let endIndex;
        if (this.choices.length <= this.frame) {
            beginIndex = 0;
            endIndex = this.choices.length;
        }
        else {
            beginIndex = Math.max(this.currChoice - halfFrame, 0);
            endIndex = Math.min(beginIndex + this.frame, this.choices.length);
            if (endIndex - beginIndex < this.frame)
                beginIndex = endIndex - this.frame;
        }
        const checkChoice = this.currChoice - beginIndex;
        if (this.pre)
            this.terminalPtr.log(this.pre);
        this.choices.slice(beginIndex, endIndex).forEach((text, index) => {
            let str;
            const frame = Math.floor(this.terminalPtr.width / 2);
            const possibleOffsets = (0, strip_ansi_1.default)(text).length - frame - 2;
            if (possibleOffsets <= 0) {
                str = text;
            }
            else {
                const x = this.x_offset % possibleOffsets;
                beginIndex = index === this.currChoice ? x : 0;
                // endIndex = Math.min(beginIndex + frame, this.terminalPtr!.width)
                str = text.slice(beginIndex);
            }
            this.terminalPtr.log(index === checkChoice ? this.formatStr(str) : str);
        });
        if (this.post)
            this.terminalPtr.log(this.post);
    }
    updateChoice(data) {
        if (!this.terminalPtr)
            return;
        this.x_scroll_speed_counter = 0;
        switch (data) {
            case 0: {
                this.currChoice--;
                return this.log();
            }
            case 2: {
                this.currChoice++;
                return this.log();
            }
        }
    }
    branch() {
        var _a;
        if (!this.terminalPtr)
            return;
        if (typeof this.branchToTargets[this.currChoice] !== "string" || !((_a = this.branchToTargets[this.currChoice]) === null || _a === void 0 ? void 0 : _a.length)) {
            this.log();
            this.terminalPtr.log(`No branch target set, current choice: ${this.currChoice}`);
            return;
        }
        else {
            if (!this.terminalPtr.branchToModule) {
                this.log();
                this.terminalPtr.log(`Terminal provided cannot switch module, current choice: ${this.currChoice}`);
                return;
            }
            return this.terminalPtr.branchToModule(this.branchToTargets[this.currChoice]);
        }
    }
    scrollX() {
        this.x_scroll_speed_counter++;
        if (this.x_scroll_speed_counter >= this.x_scroll_delay) {
            this.x_scroll_speed_counter = 0;
            this.x_offset++;
            return this.log();
        }
    }
    start() {
        this.log();
        this.listen("arrows", this.updateChoice.bind(this));
        this.listen("enter", this.branch.bind(this));
        this.listen("update", this.scrollX.bind(this));
    }
}
exports.TerminalMenuModule = TerminalMenuModule;
