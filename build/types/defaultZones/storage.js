"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zone_stackBased_1 = __importDefault(require("../abstract/gameComponents/zone_stackBased"));
class storage extends zone_stackBased_1.default {
    constructor() {
        super(...arguments);
        this.isEditting = false;
        this.maxCardCount = 9;
    }
    // constructor(){
    //     super("storage");
    // }
    handleOccupied(c, index, func, line) {
        this.cardArr[index] = c;
        return [undefined, []];
    }
}
exports.default = storage;
