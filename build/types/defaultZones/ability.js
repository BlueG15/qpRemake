"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const zone_stackBased_1 = __importDefault(require("../abstract/gameComponents/zone_stackBased"));
class abiltyZone extends zone_stackBased_1.default {
    constructor() {
        //TODO : figure out wtf this does
        //currently doing nothing but storing the ability card
        super(...arguments);
        this.currentCoolDown = this.maxCoolDown;
    }
    get maxCoolDown() { var _a; return (_a = this.attr.get("maxCoolDown")) !== null && _a !== void 0 ? _a : -1; }
    ;
    set maxCoolDown(newVal) { this.attr.set("maxCoolDown", newVal); }
    ;
    remove(c) {
        return [undefined, []];
    }
}
exports.default = abiltyZone;
