"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zone_stackBased_1 = __importDefault(require("../abstract/gameComponents/zone_stackBased"));
class grave extends zone_stackBased_1.default {
    // constructor(isPlayerGrave : boolean);
    // constructor(keyStr : string);
    // constructor(param : boolean | string = true){
    //     if(typeof param == "string") super(param);
    //     else if(param) super("playerGrave");
    //     else super("enemyGrave");
    // }
    setCapacity(newCapacity) { this.posBound = [newCapacity]; }
    handleOccupied(c, index, func, line) {
        //move everything else backwards
        return this.handleOccupiedPush(c, index, func, line);
    }
}
exports.default = grave;
