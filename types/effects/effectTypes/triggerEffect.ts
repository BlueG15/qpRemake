import type { Action } from "../../../_queenSystem/handler/actionGenrator";
import type Card from "../../abstract/gameComponents/card"
import type { dry_system } from "../../../data/systemRegistry";
import EffectType from "../../abstract/gameComponents/effectType"

class triggerEffect extends EffectType {
    //behaviors:
    //1. activates only in the trigger phase if and only if no subtype overrides the result 
    //2. activate has 2 behaviors: 
    //      action != "activate self" -> returns an "activate self" action, isChain = false
    //      action == "activate self" -> returns whatever super.activate returns, isChain = true

    override canRespondAndActivate(c: Card, system: dry_system, a: Action): -1 | boolean {
        //enforces only respond in the trigger phase
        //if and only if no subtype overrides the result
        //this function only runs if no override happens 
        if(!system.isInTriggerPhase) return false;
        return -1;
    }

    override parseAfterActivate(c: Card, system: dry_system, res: Action[]) {
        res.forEach(i => i.isChain = false);
    }
}

export default triggerEffect