"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class rarityLoader {
    constructor() {
        this.dataCache = new Map();
    }
    load(key, o) {
        this.dataCache.set(key, o);
    }
    ;
    getRarity(key, s) {
        return this.dataCache.get(key);
    }
}
exports.default = rarityLoader;
