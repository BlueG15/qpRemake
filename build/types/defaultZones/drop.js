"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zone_stackBased_1 = __importDefault(require("../abstract/gameComponents/zone_stackBased"));
class drop extends zone_stackBased_1.default {
    // constructor(){
    //     super("drop");
    // }
    setCapacity(newCapacity) { this.posBound = [newCapacity]; }
}
exports.default = drop;
