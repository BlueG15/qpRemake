"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class customHandlerLoader {
    constructor() {
        this.funcCache = new Map();
    }
    ___ObtainFunc(actionTypeID) {
        return this.funcCache.get(actionTypeID);
    }
    delete(actionTypeID) {
        this.funcCache.delete(actionTypeID);
    }
    load(actionTypeID, handlerFunc) {
        this.funcCache.set(actionTypeID, handlerFunc);
    }
    handle(actionTypeID, a, s) {
        let func = this.funcCache.get(actionTypeID);
        if (!func)
            return;
        else
            return func(a, s);
    }
}
exports.default = customHandlerLoader;
