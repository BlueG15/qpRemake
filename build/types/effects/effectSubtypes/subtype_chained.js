"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const effectSubtype_1 = __importDefault(require("../../abstract/gameComponents/effectSubtype"));
class subtype_chained extends effectSubtype_1.default {
    onEffectCheckCanActivate(c, e, system, a) {
        if (!system.isInChainPhase)
            return false;
        return -2;
    }
    parseAfterActivate(c, e, system, res) {
        res.forEach(i => i.isChain = true);
    }
}
exports.default = subtype_chained;
