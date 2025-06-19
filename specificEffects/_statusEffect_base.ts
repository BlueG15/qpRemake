// import type Card from "./card";
import Effect from "../types/abstract/gameComponents/effect";
import type dry_system from "../data/dry/dry_system";
import type Action_prototype from "../types/abstract/gameComponents/action";
import type card from "../types/abstract/gameComponents/card";

import {
    turnStart,
    turnEnd,
    addStatusEffect,
    activateEffect,
    removeStatusEffect,
} from "../types/actions_old"

class StatusEffect_base extends Effect {
    // the existence of id neccessitates a handler
    // this handler is special tho, it need to create the Status effect first, apply later
    // unlike card or s.th, which creates and provide in the same function
    
    //merge behavior is automatic upon end of turn

    get mergeSignature() : string | undefined {return undefined}

    //merge target is guaranteed to have the same signature of this
    merge(mergeTargets : StatusEffect_base[]) : StatusEffect_base[] {return mergeTargets}

    //new note (june 14 2025)
    //all the below is default implementations
    //status effects are literally just effects with 1 extra function: merging
    //thats it

    activateOnTurnStart?(c : card, system : dry_system, a : Action_prototype) : Action_prototype[]  
    activateOnTurnEnd?(c : card, system : dry_system, a : Action_prototype) : Action_prototype[] 
    activateOnApply?(c : card, system : dry_system, a : Action_prototype) : Action_prototype[] 
    activateOnRemove?(c : card, system : dry_system, a : Action_prototype) : Action_prototype[] 
    activateOnReProc?(c : card, system : dry_system, a : Action_prototype) : Action_prototype[] 
    // ^ if this status effects allows for reproc using activateEffect action
    //normally that isnt fucking possible? 
    //its like forcefully activating a passive
    //makes no sense on paper
    //but in practice....yeh its for expandability

    override canRespondAndActivate_proto(c: card, system: dry_system, a: Action_prototype): boolean {
        if(system.isInTriggerPhase && this.activateOnTurnStart && a instanceof turnStart){
            return true
        }

        if(system.isInChainPhase && this.activateOnTurnEnd && a instanceof turnEnd){
            return true
        }

        if(system.isInTriggerPhase && this.activateOnApply && a instanceof addStatusEffect && a.statusID === this.id){
            return true
        }

        if(system.isInChainPhase && this.activateOnRemove && a instanceof removeStatusEffect && a.statusID === this.id){
            return true
        }

        return false
    }

    override activate_proto(c: card, system: dry_system, a: Action_prototype): Action_prototype[] {
        let res : Action_prototype[] = []
        if(this.activateOnTurnStart && a instanceof turnStart){
            res = this.activateOnTurnStart(c, system, a);
        }

        if(this.activateOnTurnEnd && a instanceof turnEnd){
            res = this.activateOnTurnEnd(c, system, a);
        }

        if(this.activateOnApply && a instanceof addStatusEffect){
            res = this.activateOnApply(c, system, a);
        }

        if(this.activateOnRemove && a instanceof removeStatusEffect){
            res = this.activateOnRemove(c, system, a);
        }

        if(this.activateOnReProc && a instanceof activateEffect){
            res = this.activateOnReProc(c, system, a);
        }

        res.forEach(i => i.isChain = true)
        return res
    }



    //status effects generally have 2 main types:
    //apply once effect, will respond with 
    // a chained effect that trigger in the trigger step
    // --> to the action <apply StatusEffect> with same id as this one
    
    
    //apply each turn effect, will chain to the "turnStart" action during the trigger phase

    //every other status effects with different listening conditions will act like a normal effect
}

export default StatusEffect_base