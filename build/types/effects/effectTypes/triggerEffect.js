"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const actionGenrator_1 = require("../../../_queenSystem/handler/actionGenrator");
const effectType_1 = __importDefault(require("../../abstract/gameComponents/effectType"));
class triggerEffect extends effectType_1.default {
    //behaviors:
    //1. activates only in the trigger phase if and only if no subtype overrides the result 
    //2. activate has 2 behaviors: 
    //      action != "activate self" -> returns an "activate self" action, isChain = false
    //      action == "activate self" -> returns whatever super.activate returns, isChain = true
    canRespondAndActivate(e, c, system, a) {
        //enforces only respond in the trigger phase
        //if and only if no subtype overrides the result
        //this function only runs if no override happens 
        if (!system.isInTriggerPhase)
            return false;
        return -1;
    }
    parseAfterActivate(e, c, system, res) {
        const cause = actionGenrator_1.actionFormRegistry.effect(system, c, e);
        res.unshift(actionGenrator_1.actionConstructorRegistry.a_declare_activation(system, c, e)(cause));
        res.forEach(i => i.isChain = false);
    }
}
exports.default = triggerEffect;
