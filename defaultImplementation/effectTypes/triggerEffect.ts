import { actionConstructorRegistry, actionFormRegistry, type Action } from "../../_queenSystem/handler/actionGenrator";
import type Card from "../../types/gameComponents/card";
import type { dry_effect, dry_system } from "../../data/systemRegistry";
import EffectType from "../../types/gameComponents/effectType";
import { controlCode } from "../../types/gameComponents/effect";

class TriggerEffect extends EffectType {
    //behaviors:
    //1. activates only in the trigger phase if and only if no subtype overrides the result 
    //2. activate has 2 behaviors: 
    //      action != "activate self" -> returns an "activate self" action, isChain = false
    //      action == "activate self" -> returns whatever super.activate returns, isChain = true

    override canRespondAndActivate(e : any, c: Card, system: dry_system, a: Action){
        //enforces only respond in the trigger phase
        //if and only if no subtype overrides the result
        //this function only runs if no override happens 
        if(!system.isInTriggerPhase) return false;
        return controlCode.doNothingAndPass;
    }

    override overrideActivateResults(e : dry_effect, c: Card, system: dry_system, res: Action[]) {
        const cause = actionFormRegistry.effect(system, c, e);
        res.forEach(i => i.isChain = false);
        return [
            actionConstructorRegistry.a_declare_activation(system, c, e)(cause),
            ...res
        ]
    }
}

export default TriggerEffect