"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//import position from "./position";
const zone_1 = require("./zone");
const position_1 = __importDefault(require("../generics/position"));
const zoneRegistry_1 = require("../../../data/zoneRegistry");
class Zone_stack extends zone_1.Zone_base {
    // constructor(dataID: string, data?: zoneData){
    //     super(dataID, data)
    //     this.cardArr = []
    // }
    //helper properties
    //override get valid(){return this.id >= 0 && this.moveToNeedPosition === false}
    //zone functionality functions
    //zone has 2 jobs
    //1. provides an action if the player wanna do something
    //2. perform an action using API/func calls, not action (not enough info)
    //functions for step 2
    remove(c) {
        if (!this.canMoveFrom)
            return this.handleNoMoveFrom(c, "remove_stack", 24);
        let index = this.findIndex(c.id);
        if (index < 0 || !this.cardArr[index] || !this.validatePosition(c.pos))
            return this.handleCardNotInApplicableZone(c, "remove_stack", 28);
        //slice the last index
        this.cardArr.splice(index, 1);
        if (c.pos.zoneID == this.id)
            c.pos.invalidate();
        return [undefined, []];
    }
    get lastPos() {
        return new position_1.default(this.id, this.name, ...Utils.indexToPosition((this.cardArr.length === 0) ? 0 : this.cardArr.length - 1, this.shape));
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
                c1.pos.flat().length === 1 &&
                c2.pos.flat().length === 1 &&
                c1.pos.x === c2.pos.x;
        }
    }
}
exports.default = Zone_stack;
