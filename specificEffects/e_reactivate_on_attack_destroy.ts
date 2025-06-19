import type dry_system from "../data/dry/dry_system";
import type Action_prototype from "../types/abstract/gameComponents/action";
import type Card from "../types/abstract/gameComponents/card";
import reactivateEffect from "./e_reactivate";

export default class e_reactivate_on_attack_destroy extends reactivateEffect {
    override canRespondAndActivate_proto(c: Card, system: dry_system, a: Action_prototype): boolean {
        //so logically, it is
        //whenever the action resolved an us attacking, deals damage, then destroy that attacked card
        //we activate, reactivating this card

        //hopefully this works?
        let actionChain = system.findSpecificChainOfAction_resolve([
            "a_attack",
            "a_deal_damage",
            "a_destroy",
        ])

        if(!actionChain) return false;

        let attackTarget = actionChain[0].targetCardID

        return (
            actionChain[0].causeCardID === c.id &&
            actionChain[1].causeCardID === c.id &&
            attackTarget !== undefined &&
            actionChain[2].targetCardID === attackTarget
        )
    }
}

