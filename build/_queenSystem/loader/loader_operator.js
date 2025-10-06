"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class operatorLoader {
    constructor() {
        this.dataCache = new Map();
    }
    load(key, o) {
        this.dataCache.set(key, o);
    }
    ;
    getOperator(key, s) {
        return this.dataCache.get(key);
    }
}
exports.default = operatorLoader;
