"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parserModule = void 0;
const component_1 = require("../abstract/parser/component");
const moduleInputObject_1 = __importDefault(require("../abstract/parser/moduleInputObject"));
//abstract class
class parserModule {
    constructor() {
        this.cmdName = [];
        this.requiredAttr = [];
        this.doCheckRequiredAttr = false;
    }
    //can override, but shouldn't tbh
    generateInputObj(cmdIndex, attrObj, children) {
        let res = new moduleInputObject_1.default(attrObj, children);
        if (this.doCheckRequiredAttr) {
            if (!this.requiredAttr[cmdIndex])
                return undefined;
            for (let i = 0; i < this.requiredAttr[cmdIndex].length; i++) {
                const attrName = this.requiredAttr[cmdIndex][i];
                if (res.hasAttr(attrName)) {
                    const attr = res.getAttr(attrName);
                    if (this.isValidAttr(cmdIndex, attrName, attr))
                        continue;
                    else
                        return undefined;
                }
                else
                    return undefined;
            }
        }
        return res;
    }
    try_grab_child_text(args) {
        const c = args.getChilren();
        //console.log(`Children arr len: ${c.length}`)
        if (c.length != 1)
            return undefined;
        if (c[0] instanceof component_1.component) {
            if (c[0].id == component_1.componentID.text) {
                return c[0].str;
            }
        }
        else {
            //console.log(`Children 0 arr len: ${c[0].length}`)
            if (c[0].length != 1)
                return undefined;
            if (c[0][0] instanceof component_1.component) {
                if (c[0][0].id == component_1.componentID.text) {
                    return c[0][0].str;
                }
            }
        }
        return undefined;
    }
    //may override, only triger if doCheckRequiredAttr is true
    isValidAttr(cmdIndex, attrName, attr) {
        return true;
    }
    //abstract, should override
    evaluate(cmd, args, option, raw) {
        return [];
    }
}
exports.parserModule = parserModule;
