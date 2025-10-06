"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const actionRegistry_1 = __importDefault(require("../../data/actionRegistry"));
const actionGenrator_1 = require("../../_queenSystem/handler/actionGenrator");
//actions by default are NOT valid to listen to, they r just there
class debugInfo {
    constructor(file, func = "", line = -1) {
        this.file = file;
        this.line = line;
        this.func = func;
    }
    toString() {
        let str = 'file: ' + this.file;
        if (this.func.length)
            str += ", function: " + this.func;
        if (this.line >= 0)
            str += ", line: " + this.line;
        return str;
    }
}
class error extends actionGenrator_1.Action_class {
    constructor(cardID) {
        let o = (0, actionGenrator_1.getDefaultObjContructionObj)(actionRegistry_1.default.error);
        let o2 = Object.assign(Object.assign({}, o), { cause: actionGenrator_1.actionFormRegistry.system(), targets: [] });
        super(o2);
        this.messege = "";
        this.callStack = []; //larger index = higher hierachy
        this.cardID = cardID;
    }
    add(file, func, line) {
        this.callStack.push(new debugInfo(file, func, line));
        return this;
    }
    toString() {
        return 'Error: ' + this.messege + '\nAt\n' + this.callStack.map(i => i.toString()).join("\n");
    }
    ;
}
exports.default = error;
