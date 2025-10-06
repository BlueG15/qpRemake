"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Terminal = void 0;
const chalk_1 = __importDefault(require("chalk"));
const util_1 = __importDefault(require("util"));
const date_fns_1 = require("date-fns");
const utils_1 = require("./utils");
const ansi_1 = require("./ansi");
const menuModule_1 = require("../terminalModule/menuModule");
const exitModule_1 = require("../terminalModule/exitModule");
const autoInputModule_1 = require("../terminalModule/autoInputModule");
class Terminal {
    get timestampLen() { return (0, date_fns_1.format)(new Date(), "[kk:mm:ss]").length; }
    constructor(name = "Unnamed Terminal") {
        this.doAddTimestamp = true;
        this.inputBuffer = [];
        this.outputBuffer = [];
        this.settings = new utils_1.TerminalSettings();
        this.event = new utils_1.TerminalEventEmitter();
        this.clearFlag = true;
        this.logged = [];
        this.___ignoreLog = false;
        this.storedModules = new Map();
        this.history = [];
        this.currModuleKey = "";
        this.name = name;
    }
    //* Public property
    static get width() {
        return process.stdout.columns;
    }
    static get height() {
        return process.stdout.rows;
    }
    get width() {
        return Terminal.width;
    }
    get height() {
        return Terminal.height;
    }
    get inputBufferStr() {
        return this.inputBuffer.join("");
    }
    //TODO: Not sure "so-so" access, seperate them if possible - will be public for now!
    clearInputBuffer() {
        this.inputBuffer = [];
    }
    //* Private methods / handlers
    println(...content) {
        process.stdout.write(content.join(" ") + "\n");
    }
    print(...content) {
        process.stdout.write(content.join(" "));
    }
    static addToBuffer(buffer, ...c) {
        const log = c.join(" ");
        buffer.unshift(log);
        return buffer;
    }
    // private addToOutputBuffer(...c: string[]) {
    //   Terminal.addToBuffer(this.outputBuffer, ...c)
    // }
    addToInputBuffer(c) {
        switch (c) {
            case "\r": {
                // case "\n":
                // this.log("New input:", this.inputBufferStr);
                this.event.emit("input", this.inputBufferStr);
                this.clearInputBuffer();
                break;
            }
            case "\b": {
                this.inputBuffer.pop();
                break;
            }
            default: {
                if ((0, ansi_1.isANSI)(c))
                    return;
                this.inputBuffer.push(c);
                break;
            }
        }
        //? Re-render input
        // this.drawInput();
    }
    renderFrame() {
        this.drawLog();
        this.drawInput();
        this.event.emit("update");
    }
    fireArrowEvent(key, index) {
        if (index >= 0 && index < 4) {
            this.event.emit(key, index);
        }
    }
    handleInput(d) {
        const char = d.toString();
        const hex = d.toString("hex");
        this.event.emit("keyboard", d);
        this.fireArrowEvent("wasd", "wasd".indexOf(char));
        this.fireArrowEvent("arrows", [
            '1b5b41', //up
            '1b5b44', //left
            '1b5b42', //down
            '1b5b43' //right
        ].indexOf(hex));
        if (hex === "0d" && this.inputBuffer.length === 0)
            this.event.emit("enter");
        this.addToInputBuffer(char);
    }
    drawLog() {
        var _a;
        const H = Terminal.height;
        const W = Terminal.width;
        // let lines: string[] = [];
        // // Wrap each outputBuffer line to fit terminal width
        // this.outputBuffer.forEach(lineRaw => {
        //   if(stripAnsi(lineRaw).length === 0) {
        //     lines.push("") //check for specifically empty print
        //   } else {
        //     // let temp : string[] = []
        //     let current = "";
        //     let visible = 0;
        //     for (let i = 0; i < lineRaw.length; i++) {
        //       const char = lineRaw[i];
        //       current += char;
        //       if (!isANSI(char)) visible++;
        //       if (visible >= W) break;
        //     }
        //     lines.push(current)
        //   }
        // })
        // Only display up to H - 2 lines
        for (let i = 0; i < H - 2; i++) {
            const line = (_a = this.outputBuffer[i]) !== null && _a !== void 0 ? _a : "";
            this.println(ansi_1.ANSI_CODES.CURSOR_TO(H - i - 2, 0), ansi_1.ANSI_CODES.CLEAR_LINE, line);
        }
    }
    drawInput() {
        const H = Terminal.height;
        const W = Terminal.width;
        this.println(ansi_1.ANSI_CODES.CURSOR_TO(H - 2, 0));
        this.println("─".repeat(W));
        const HSS = chalk_1.default.hex("#0a7424")("\ue0b6");
        const STATUS = chalk_1.default.bgHex("#0a7424").bold("\uebb1 READY ");
        const MODE = chalk_1.default.bgHex("#055adb")(" \udb81\udfb7 Mode: INPUT  ");
        const AUTH = chalk_1.default.bgHex("#000000ff")(" \uf2bd USER ");
        const TIME = chalk_1.default.bgHex("#ed7b24").hex("#000")((0, date_fns_1.format)(new Date(), " EEE, MMM dd, yyyy "));
        const P = `${HSS}${STATUS}${TIME}${MODE}${AUTH} \ueb70 `;
        const PLC = chalk_1.default.gray("Enter a command line . . .");
        const I = this.inputBuffer.join("");
        const CARAT = this.settings.get("caretChar");
        const C = P + (I ? I + "|" : "|" + PLC);
        this.print(C.padEnd(W + C.length - (0, utils_1.realLen)(C), " "));
        // this.print(ANSI_CODES.SAVE_CURSOR);
    }
    ignoreClear() { this.clearFlag = false; }
    clear() {
        // process.stdout.write(ANSI_CODES.CLEAR_SCREEN);
        if (this.clearFlag)
            this.outputBuffer = [];
        else
            this.clearFlag = true;
        // const whoCallThis = utils.getCallSites(2)[1]
        // this.log(whoCallThis)
        // this.log("-".repeat(Terminal.width - 2))
    }
    start() {
        this.print(ansi_1.ANSI_CODES.HIDE_CURSOR);
        process.stdin.setRawMode(true);
        process.stdin.on("data", this.handleInput.bind(this));
        process.stdout.on("resize", this.renderFrame.bind(this));
        process.on("SIGKILL", () => this.stop());
        process.on("exit", () => this.stop());
        this.println(ansi_1.ANSI_CODES.CLEAR_SCREEN);
        this.renderFrame();
        this.int = setInterval(this.renderFrame.bind(this), 30);
    }
    stop() {
        process.stdin.setRawMode(false);
        process.stdout.off("resize", this.renderFrame.bind(this));
        process.stdin.off("data", this.handleInput.bind(this));
        this.println(ansi_1.ANSI_CODES.CLEAR_SCREEN);
        this.print(ansi_1.ANSI_CODES.SHOW_CURSOR);
        console.log("HALTED! Process killed");
        clearInterval(this.int);
    }
    static log(doAddTimestamp, res, ...args) {
        // Terminal.addToBuffer(res, String(args.length))
        const stamp = doAddTimestamp ? (0, date_fns_1.format)(new Date(), "[kk:mm:ss]") + " " : "";
        const formatted = args.map(a => {
            return typeof a === "string" ? a : util_1.default.formatWithOptions({ colors: true, depth: 5, compact: false }, "%O", a);
        });
        const str = chalk_1.default.cyan(stamp) + formatted.join(" ");
        const forPrint = str.split("\n");
        forPrint.forEach(p => Terminal.addToBuffer(res, p));
        return res;
    }
    ignoreLog() {
        this.___ignoreLog = true;
    }
    retrieveLog() {
        this.___ignoreLog = false;
        const k = this.logged;
        this.logged = [];
        return k;
    }
    log(...args) {
        Terminal.log(this.doAddTimestamp, this.___ignoreLog ? this.logged : this.outputBuffer, this.___ignoreLog ? util_1.default.getCallSites(2)[1].functionName ? chalk_1.default.hex("#d95e29")("[" + util_1.default.getCallSites(2)[1].functionName + "]") : "" : "", ...args);
    }
    addCommonCommands() {
        this.registerModule("quitConfirm", new menuModule_1.TerminalMenuModule(["yes", "no"], ["exit", "back"], undefined, ["red", "italic"], chalk_1.default.bold(chalk_1.default.yellow("Are you sure you want to quit?"))));
        this.registerModule("exit", new exitModule_1.TerminalExitModule());
        this.registerModule("back", new autoInputModule_1.TerminalAutoInput("b", 2));
        this.event.on("input", (data) => {
            data = data.trim();
            const [cmd, ...args] = data.split(" ");
            // this.log("input gotten!", cmd)
            switch (cmd) {
                case "qq": {
                    return process.exit(0);
                }
                case "q":
                case "exit":
                case "quit": {
                    if (this.currModuleKey === "quitConfirm")
                        process.exit(0);
                    else
                        return this.branchToModule("quitConfirm");
                }
                // case "cls":
                // case "clear": {
                //   this.clear();
                //   break;
                // }
                case "b":
                case "back":
                case "ret":
                case "return": {
                    if (this.isInModule()) {
                        let target = this.history.pop();
                        while (target && !this.isValidModule(target) && this.history.length > 0 && target === this.currModuleKey) {
                            target = this.history.pop();
                        }
                        this.log("back trigger Target: " + target + " History: " + this.history.join("_") + " Curr: " + this.currModuleKey);
                        this.stopModule();
                        if (target) {
                            return this.branchToModule(target);
                        }
                    }
                    else
                        return this.branchToModule("quitConfirm");
                }
                case "echo": {
                    const text = args.join(" ");
                    this.log("Echo:", text);
                    break;
                }
                default: {
                    if (cmd.length)
                        this.log("Invalid command: ", cmd);
                    break;
                }
            }
        });
    }
    get currModule() { return this.storedModules.get(this.currModuleKey); }
    isValidModule(k) { return this.storedModules.has(k); }
    isInModule() { return this.currModuleKey.length !== 0; }
    registerModule(k, m) {
        m.bind(this);
        this.storedModules.set(k, m);
        // this.log(`Loaded module ${k}`)
    }
    stopModule() {
        if (this.currModule) {
            this.currModule.stop();
            this.currModuleKey = "";
        }
    }
    branchToModule(k) {
        if (!k)
            return;
        if (k === this.currModuleKey)
            return; //avoid duplicayted branch
        const f = this.storedModules.get(k);
        if (f instanceof utils_1.TerminalModule) {
            if (this.isValidModule(this.currModuleKey))
                this.history.push(this.currModuleKey);
            this.stopModule();
            this.currModuleKey = k;
            return f.start();
        }
        // this.log(`No module named ${k} registered`);
    }
    branchButDoNotRecord(k) {
        if (!k)
            return;
        if (k === this.currModuleKey)
            return; //avoid duplicated branch
        const f = this.storedModules.get(k);
        if (f instanceof utils_1.TerminalModule) {
            // if(this.isValidModule(this.currModuleKey)) this.history.push(this.currModuleKey)
            this.stopModule();
            // this.currModuleKey = k
            return f.start();
        }
    }
}
exports.Terminal = Terminal;
