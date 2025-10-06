"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const effectSubtype_1 = __importDefault(require("../../abstract/gameComponents/effectSubtype"));
class subtype_hardUnique extends effectSubtype_1.default {
    onEffectCheckCanActivate(c, e, system, a) {
        //hardUnique is once per turn per card
        if (system.getActivatedCardIDs().includes(c.id))
            return false;
        return -1;
    }
}
exports.default = subtype_hardUnique;
