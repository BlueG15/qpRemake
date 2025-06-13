import Effect from "../../abstract/gameComponents/effect"
import { activateEffect } from "../../actions"
import type Action from "../../abstract/gameComponents/action"
import type Card from "../../abstract/gameComponents/card"
import type dry_system from "../../data/dry/dry_system"

import effectTypeRegistry from "../../data/effectTypeRegistry"

class triggerEffect extends Effect {
    //behaviors:
    //1. activates only in the trigger phase if and only if no subtype overrides the result 
    //2. activate has 2 behaviors: 
    //      action != "activate self" -> returns an "activate self" action, isChain = false
    //      action == "activate self" -> returns whatever super.activate returns, isChain = true

    override type = effectTypeRegistry[effectTypeRegistry.e_trigger]

    override canRespondAndActivate_type(c: Card, system: dry_system, a: Action): -1 | boolean {
        //enforces only respond in the trigger phase
        //if and only if no subtype overrides the result
        //this function only runs if no override happens 
        if(!system.isInTriggerPhase) return false;
        return -1;
    }

    override activate(c: Card, system: dry_system, a: Action): Action[] {
        //the effectID and the targetCardID check is redundant, 
        //technically this will only be run if and only if 
        // 1. canRespondAndActivate -> true
        // 2. the action "activate effect" is being resolved
        if(a instanceof activateEffect && a.effectID === this.id && a.targetCardID === c.id){
            let res = super.activate(c, system, a);
            //enforces each action returns have isChain = true
            res.forEach(i => i.isChain = true)
            return res;
        } else {
            return [
                new activateEffect(false, c.id, this.id, c.id)
            ]
        }
    }
}

export default triggerEffect