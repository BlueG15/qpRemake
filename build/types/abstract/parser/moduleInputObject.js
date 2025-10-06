"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class moduleInputObject {
    constructor(attrObj, children) {
        this.paramMap = new Map();
        Object.keys(attrObj).forEach(i => {
            this.paramMap.set(i, attrObj[i]);
        });
        this.chilren = children;
    }
    hasAttr(key) {
        return this.paramMap.has(key) && this.paramMap.get(key) != undefined;
    }
    getAttr(key) {
        return this.paramMap.get(key);
    }
    getChilren() {
        return this.chilren;
    }
}
exports.default = moduleInputObject;
