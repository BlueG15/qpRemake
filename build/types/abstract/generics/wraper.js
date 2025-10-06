"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lazy = exports.Volatile = exports.Valueable = void 0;
class Valueable {
    get value() {
        throw new Error("Not Implemented");
    }
    extends(f, thisParam) {
        throw new Error("not Implemented");
    }
}
exports.Valueable = Valueable;
class Volatile extends Valueable {
    constructor(f, __params, ThisParam) {
        super();
        this.__params = __params;
        this.__f = f.bind(ThisParam);
    }
    get value() {
        return this.__f(...this.__params);
    }
    extends(f, thisParam) {
        //Magic wizardry shit
        //replace a funtion with a new function that calls the old one
        function f2(oldf) {
            return (...params) => f.bind(thisParam)(oldf(...params));
        }
        this.__f = f2(this.__f);
        return this;
    }
}
exports.Volatile = Volatile;
class Lazy extends Valueable {
    get resolved() { return this.__resolved; }
    constructor(f, __params, ThisParam) {
        super();
        this.__params = __params;
        this.__resolved = false;
        this.__f = f.bind(ThisParam);
    }
    get value() {
        if (this.__resolved)
            return this.__cache;
        this.__cache = this.__f(...this.__params);
        this.__resolved = true;
        return this.__cache;
    }
    extends(f, thisParam) {
        function f2(oldf) {
            return (...params) => f.bind(thisParam)(oldf(...params));
        }
        this.__f = f2(this.__f);
        return this;
    }
}
exports.Lazy = Lazy;
