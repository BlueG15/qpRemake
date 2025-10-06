"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import type { subTypeOverrideConflict } from "../../errors"
const effectType_1 = __importDefault(require("../../abstract/gameComponents/effectType"));
class passiveEffect extends effectType_1.default {
    //behaviors:
    //1. every action returns have isChain = true
    //2. activates only in the chain phase
    //3. when condition met -> returns the Action[] itself
    canRespondAndActivate(e, c, system, a) {
        //enforces only respond in the chain phase
        if (!system.isInChainPhase)
            return false;
        return -1;
    }
    parseAfterActivate(e, c, system, res) {
        res.forEach(i => i.isChain = true);
    }
}
exports.default = passiveEffect;
