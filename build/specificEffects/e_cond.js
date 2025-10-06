"use strict";
//overriding for very specific conditions
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.e_on_atk_destroy = void 0;
const effect_1 = __importDefault(require("../types/abstract/gameComponents/effect"));
const systemRegistry_1 = require("../data/systemRegistry");
/**@deprecated */
class e_on_atk_destroy extends effect_1.default {
    canRespondAndActivate_final(c, system, a) {
        //so logically, it is
        //whenever the action resolved an us attacking, deals damage, then destroy that attacked card
        //we activate, reactivating this card
        //hopefully this works?
        let actionChain = system.findSpecificChainOfAction_resolve([
            "a_attack",
            "a_deal_damage_internal",
            "a_destroy",
        ]);
        if (!actionChain)
            return false;
        let dmgTarget = actionChain[1].targets[0].card;
        let destroyTarget = actionChain[2].targets[0].card;
        return (dmgTarget.id === destroyTarget.id &&
            actionChain[0].cause.type === systemRegistry_1.identificationType.card &&
            actionChain[0].cause.card.id === c.id &&
            actionChain[1].cause.type === systemRegistry_1.identificationType.card &&
            actionChain[1].cause.card.id === c.id);
    }
}
exports.e_on_atk_destroy = e_on_atk_destroy;
exports.default = {
    e_on_atk_destroy
};
