"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//hand, grave, field, deck, etc extends from this, reserve index 0 for system
const position_1 = __importDefault(require("../generics/position"));
const zone_1 = require("./zone");
const zoneRegistry_1 = require("../../../data/zoneRegistry");
class Zone_grid extends zone_1.Zone_base {
    constructor() {
        super(...arguments);
        this.cardArr = (isFinite(this.capacity) && !isNaN(this.capacity)) ? new Array(this.capacity).fill(undefined) : [];
    }
    get firstEmptyIndex() { return this.cardArr.indexOf(undefined); }
    get lastEmptyIndex() { return this.cardArr.lastIndexOf(undefined); }
    get isFull() {
        return (this.firstEmptyIndex === -1);
    }
    get valid() {
        return this.id >= 0 && this.capacity !== Infinity;
    }
    get lastPos() {
        return new position_1.default(this.id, this.name, ...Utils.indexToPosition((this.isFull) ? this.capacity - 1 : this.lastEmptyIndex, this.shape));
    }
    get firstPos() {
        return new position_1.default(this.id, this.name, ...Utils.indexToPosition(this.firstEmptyIndex, this.shape));
    }
    forceCardArrContent(newCardArr) {
        const oldLen = this.cardArr.length;
        this.cardArr = newCardArr;
        if (isNaN(this.capacity) || !isFinite(this.capacity))
            return;
        if (this.cardArr.length < oldLen)
            this.cardArr = this.cardArr.concat(...(new Array(oldLen - this.cardArr.length).fill(undefined)));
        while (this.cardArr.length > oldLen)
            this.cardArr.pop();
    }
    isOpposite(p1, p2) {
        if (p2 === undefined) {
            const z = p1;
            const flag1 = zoneRegistry_1.playerOppositeMap[zoneRegistry_1.playerTypeID[this.playerType]].some(i => i === z.playerType);
            const flag2 = this.types.join() === z.types.join();
            return flag1 && flag2;
        }
        else {
            const c1 = p1;
            const c2 = p2;
            return c1.pos.valid &&
                c2.pos.valid &&
                c1.pos.flat().length === 2 &&
                c2.pos.flat().length === 2 &&
                c1.pos.x === c2.pos.x &&
                c1.pos.y !== c2.pos.y;
        }
    }
}
exports.default = Zone_grid;
