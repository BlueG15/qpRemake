//overriding for very specific conditions

import { Action } from "../_queenSystem/handler/actionGenrator";
import { dry_card, dry_system } from "../data/systemRegistry";
import Effect from "../types/abstract/gameComponents/effect";
import { identificationType } from "../data/systemRegistry";

/**@deprecated */
export class e_on_atk_destroy extends Effect {
    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
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

export default {
    e_on_atk_destroy
}