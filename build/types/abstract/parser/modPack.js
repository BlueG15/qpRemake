"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const effectTextParserModule_1 = require("../../mods/effectTextParserModule");
class modPack extends effectTextParserModule_1.parserModule {
    constructor() {
        super(...arguments);
        this.moduleMap = new Map();
        this.moduleArr = [];
        this.cmdName = [];
        this.requiredAttr = [];
        this.doCheckRequiredAttr = false; //not used
        this.doCheckRequiredAttrArr = [];
        this.cmdTrueIndex = [];
    }
    loadModules() {
        this.moduleArr.forEach((i, index) => {
            var _a;
            i.cmdName.forEach(j => {
                this.moduleMap.set(j, index);
            });
            for (let k = 0; k < i.cmdName.length; k++) {
                this.cmdName.push(i.cmdName[k]);
                this.requiredAttr.push((_a = i.requiredAttr[k]) !== null && _a !== void 0 ? _a : []);
                this.doCheckRequiredAttrArr.push(i.doCheckRequiredAttr);
                this.cmdTrueIndex.push(k);
            }
        });
    }
    generateInputObj(cmdIndex, attrObj, children) {
        const moduleIndex = this.moduleMap.get(this.cmdName[cmdIndex]);
        if (moduleIndex === undefined)
            return undefined;
        return this.moduleArr[moduleIndex].generateInputObj(this.cmdTrueIndex[cmdIndex], attrObj, children);
    }
    isValidAttr(cmdIndex, attrName, attr) {
        const moduleIndex = this.moduleMap.get(this.cmdName[cmdIndex]);
        if (moduleIndex === undefined)
            return false;
        return this.moduleArr[moduleIndex].isValidAttr(this.cmdTrueIndex[cmdIndex], attrName, attr);
    }
    evaluate(cmd, args, option, raw) {
        const moduleIndex = this.moduleMap.get(cmd);
        if (moduleIndex === undefined)
            return [];
        return this.moduleArr[moduleIndex].evaluate(cmd, args, option, raw);
    }
}
exports.default = modPack;
