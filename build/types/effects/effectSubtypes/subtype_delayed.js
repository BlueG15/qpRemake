"use strict";
//delayed is the opposite of chained
//used for passive to push it back to resolve during trigger step
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const effectSubtype_1 = __importDefault(require("../../abstract/gameComponents/effectSubtype"));
class subtype_delayed extends effectSubtype_1.default {
    onEffectCheckCanActivate(c, e, system, a) {
        if (!system.isInTriggerPhase)
            return false;
        return -2;
    }
}
exports.default = subtype_delayed;
