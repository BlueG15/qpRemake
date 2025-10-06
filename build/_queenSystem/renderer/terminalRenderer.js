"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.qpTerminalRenderer = void 0;
const systemRegistry_1 = require("../../data/systemRegistry");
const testSuite_1 = __importDefault(require("../testSuite"));
const terminal_1 = require("./terminal");
const chalk_1 = __importDefault(require("chalk"));
class qpTerminalRenderer extends terminal_1.Terminal {
    constructor() {
        super("qpRemake");
        this.post = chalk_1.default.yellow('Press "b" to go back, "q" to quit, "Enter" to select');
        this.addCommonCommands();
        this.registerModule("mainMenu", new terminal_1.TerminalModule.menu([
            chalk_1.default.bold("Play"),
            "progress check",
            "run tests",
            "setting",
            "credit",
            "exit"
        ], [
            "field",
            "___progress_check",
            "test",
            "___setting",
            "___credit",
            "quitConfirm"
        ], undefined, undefined, chalk_1.default.yellow("Welcome to qpRemake!, a passion project of Blu, with terminal code provided by Decembber"), this.post));
        this.registerModule("test", new terminal_1.TerminalModule.menu(Object.keys(testSuite_1.default).slice(2), Object.keys(testSuite_1.default).slice(2).map(k => "___" + k), "=> run ", undefined, chalk_1.default.yellow("Select a test to run:"), this.post));
    }
    branchToModule(k) {
        if (!this.___s)
            return;
        if (k.startsWith("___")) {
            this.history.push(this.currModuleKey);
            this.stopModule();
            this.currModuleKey = k;
            // this.log("From inside branch", k, this.history.join(" _ "))
            //signal
            const sig = k.slice(3);
            switch (sig) {
                case "progress_check": {
                    return this.___run_test("progressCheck");
                }
                case "setting": {
                    this.clear();
                    this.log(this.___s.setting);
                    this.log(this.post);
                    return;
                }
                case "credit": {
                    this.clear();
                    this.log("Source code: ", chalk_1.default.cyan("Blu")),
                        this.log("Terminal renderer source code: ", chalk_1.default.hex("1dea79")("December")),
                        this.log("Quantum protocol: ", "Jkong");
                    this.log(this.post);
                    return;
                }
                default: {
                    return this.___run_test(sig);
                }
            }
        }
        else
            return super.branchToModule(k);
    }
    start() {
        super.start();
        this.branchToModule("mainMenu");
    }
    ___run_test(k) {
        const test = testSuite_1.default[k];
        if (!test) {
            //impossible situation
            const temp = new terminal_1.TerminalModule.menu([`Test ${k} does not exist somehow, enter to go back`], ["back"], ">", ["yellow"], chalk_1.default.yellowBright("Test logs:"));
            this.registerModule("temp", temp);
            return super.branchToModule("temp");
        }
        ;
        if (!this.___s)
            return;
        this.ignoreLog();
        this.doAddTimestamp = false;
        const console = globalThis.console;
        globalThis.console = this;
        try {
            test(this.___s);
        }
        catch (e) {
            // fakeConsole.log(e)
        }
        globalThis.console = console; //revert console
        this.log(`Finished running test ${k}`);
        const list = this.retrieveLog();
        const temp = new terminal_1.TerminalModule.menu(list.length === 0 ? [`No logs for ${k}, enter to go back`] : list.reverse(), list.length === 0 ? ["back"] : [], ">", ["yellow"], chalk_1.default.yellowBright("Test logs:"));
        this.registerModule("temp", temp);
        this.doAddTimestamp = true;
        super.branchToModule("temp");
    }
    get field() { return this.storedModules.get("field"); }
    warn(...p) {
        this.log(...p);
    }
    bind(s) {
        this.___s = s;
        this.registerModule("field", new terminal_1.TerminalModule.field(s));
    }
    turnStart(s, callback) {
        this.log("Turn started");
        callback();
    }
    update(phase, s, a, callback) {
        // if(phase === TurnPhase.complete) 
        this.log("Phase:", systemRegistry_1.TurnPhase[phase], `Action performed: ${a.type}`);
        callback();
    }
    requestInput(inputSet, phase, s, a, callback) {
        //we need to print the inputs here?
        if (!inputSet.length)
            return callback(inputSet[0]);
        this.log(`Select a/an ${inputSet[0].type}:`);
        // const field = this.field
        // inputSet.forEach(input => {
        //     switch (input.type) {
        //         case inputType.card: {
        //             input.data.card
        //         }
        //     }
        // })
        callback(inputSet[0]);
    }
    gameStart(s, callback) {
        this.log("Game started!");
        // this.branchButDoNotRecord("field")
        callback();
    }
}
exports.qpTerminalRenderer = qpTerminalRenderer;
