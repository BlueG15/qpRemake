"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Position {
    get length() { return this.arr.length; }
    get x() {
        if (!this.arr[0])
            return -1;
        return this.arr[0];
    }
    get y() {
        if (!this.arr[1])
            return -1;
        return this.arr[1];
    }
    map(func) {
        return this.arr.map(func);
    }
    forEach(func) {
        this.arr.forEach(func);
    }
    flat() { return this.arr; }
    constructor(param1 = -1, zoneName = "unknown", ...args) {
        this.arr = [];
        if (typeof param1 == "number") {
            this.zoneID = param1;
            this.zoneName = zoneName;
            this.arr = args;
        }
        else {
            this.zoneID = param1.zoneID;
            this.zoneName = param1.zoneName,
                this.arr = param1.flat().slice();
        }
    }
    get valid() {
        if (this.zoneID < 0)
            return false;
        if (!this.length)
            return false;
        this.arr.forEach(i => {
            if (i < 0)
                return false;
        });
        return true;
    }
    invalidate() {
        this.zoneID = -1;
        this.zoneName = "unknown";
        this.arr = new Array(this.length).fill(-1);
    }
    toString() {
        if (this.valid)
            return `[${this.zoneName}, ${(this.length == 1) ? this.arr[0] :
                this.arr.join(", ")}]`;
        return `[Invalid pos]`;
    }
    randomizeSelf(param1, param2 = 0) {
        if (typeof param1 == 'number') {
            //overload 2
            let max = param1;
            let min = param2;
            for (let i = 0; i < this.length; i++) {
                this.arr[i] = Utils.rng(max, min, true);
            }
        }
        else {
            //overload 1
            let max = param1.length;
            let min = 0;
            let i = Utils.rng(max, min, true);
            this.arr = param1[i].arr;
            this.zoneID = param1[i].zoneID;
        }
    }
    is(pos) {
        if (Object.is(this, pos))
            return true;
        if (pos.zoneID !== this.zoneID)
            return false;
        if (this.arr.length !== pos.flat().length)
            return false;
        for (let i = 0; i < this.arr.length; i++) {
            if (this.arr[i] !== pos.flat()[i])
                return false;
        }
        return true;
    }
}
exports.default = Position;
