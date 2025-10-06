"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const effectSubtype_1 = __importDefault(require("../../abstract/gameComponents/effectSubtype"));
class subtype_unique extends effectSubtype_1.default {
    onEffectCheckCanActivate(c, e, system, a) {
        //unique is once per turn per copy of the effect
        //essentially once per effect unique ID
        if (system.getActivatedEffectIDs().includes(e.id))
            return false;
        return -1;
    }
}
exports.default = subtype_unique;
