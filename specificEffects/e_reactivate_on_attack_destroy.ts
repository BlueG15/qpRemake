import type dry_system from "../data/dry/dry_system";
import { actionConstructorRegistry, actionFormRegistry, type Action } from "../_queenSystem/handler/actionGenrator";
import type Card from "../types/abstract/gameComponents/card";
import reactivateEffect from "./e_reactivate";
import { identificationType } from "../data/systemRegistry";

export default class e_reactivate_on_attack_destroy extends reactivateEffect {
    override canRespondAndActivate_proto(c: Card, system: dry_system, a: Action): boolean {
        //so logically, it is
        //whenever the action resolved an us attacking, deals damage, then destroy that attacked card
        //we activate, reactivating this card

        //hopefully this works?
        let actionChain = system.findSpecificChainOfAction_resolve([
            "a_attack",
            "a_deal_damage_internal",
            "a_destroy",
        ]) as [Action<"a_attack">, Action<"a_deal_damage_internal">, Action<"a_destroy">]

        if(!actionChain) return false;

        let dmgTarget = actionChain[1].targets[0].card
        let destroyTarget = actionChain[2].targets[0].card

        return (

            dmgTarget.id === destroyTarget.id &&

            actionChain[0].cause.type === identificationType.card && 
            actionChain[0].cause.card.id === c.id &&

            actionChain[1].cause.type === identificationType.card &&
            actionChain[1].cause.card.id === c.id
        )
    }
}



