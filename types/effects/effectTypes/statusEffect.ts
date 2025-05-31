// import type Card from "./card";
import Effect from "../../abstract/gameComponents/effect";
import type dry_system from "../../data/dry/dry_system";
import type Action from "../../abstract/gameComponents/action";
import type card from "../../abstract/gameComponents/card";

import {
    turnStart,
    turnEnd,
    addStatusEffect,
    activateEffect,
    removeStatusEffect,
} from "../../actions"

class StatusEffect extends Effect {
    constructor(id : string, type : string){
        super(id, type);
        // the existence of id neccessitates a handler
        // this handler is special tho, it need to create the Status effect first, apply later
        // unlike card or s.th, which creates and provide in the same function
    }

    activateOnTurnStart?(c : card, system : dry_system, a : Action) : Action[]  
    activateOnTurnEnd?(c : card, system : dry_system, a : Action) : Action[] 
    activateOnApply?(c : card, system : dry_system, a : Action) : Action[] 
    activateOnRemove?(c : card, system : dry_system, a : Action) : Action[] 
    activateOnReProc?(c : card, system : dry_system, a : Action) : Action[] 
    // ^ if this status effects allows for reproc using activateEffect action
    //normally that isnt fucking possible? 
    //its like forcefully activating a passive
    //makes no sense on paper
    //but in practice....yeh its for expandability

    override canRespondAndActivate_proto(c: card, system: dry_system, a: Action): boolean {
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

    override activate_proto(c: card, system: dry_system, a: Action): Action[] {
        let res : Action[] = []
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

export default StatusEffect