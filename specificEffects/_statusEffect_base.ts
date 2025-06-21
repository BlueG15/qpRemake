// import type Card from "./card";
import Effect from "../types/abstract/gameComponents/effect";
import type dry_system from "../data/dry/dry_system";
import type { Action } from "../_queenSystem/handler/actionGenrator";
import type card from "../types/abstract/gameComponents/card";
import actionRegistry from "../data/actionRegistry";

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

    activateOnTurnStart?(c : card, system : dry_system, a : Action<"a_turn_start">) : Action[]  
    activateOnTurnEnd?(c : card, system : dry_system, a : Action<"a_turn_end">) : Action[] 
    activateOnApply?(c : card, system : dry_system, a : Action<"a_add_status_effect">) : Action[] 
    activateOnRemove?(c : card, system : dry_system, a : Action<"a_remove_status_effect">) : Action[] 
    activateOnReProc?(c : card, system : dry_system, a : Action<"a_activate_effect"> | Action<"a_activate_effect_internal">) : Action[] 
    // ^ if this status effects allows for reproc using activateEffect action
    //normally that isnt fucking possible? 
    //its like forcefully activating a passive
    //makes no sense on paper
    //but in practice....yeh its for expandability

    override canRespondAndActivate_proto(c: card, system: dry_system, a: Action): boolean {
        if(system.isInTriggerPhase && this.activateOnTurnStart && a.typeID === actionRegistry.a_turn_start){
            return true
        }

        if(system.isInChainPhase && this.activateOnTurnEnd && a.typeID === actionRegistry.a_turn_end){
            return true
        }

        if(system.isInTriggerPhase && this.activateOnApply && a.typeID === actionRegistry.a_add_status_effect && (a as Action<"a_add_status_effect">).flatAttr().statusID === this.id){
            return true
        }

        if(system.isInChainPhase && this.activateOnRemove && a.typeID === actionRegistry.a_remove_status_effect && (a as Action<"a_add_status_effect">).flatAttr().statusID === this.id){
            return true
        }

        return false
    }

    override activate_proto(c: card, system: dry_system, a: Action): Action[] {
        let res : Action[] = []
        if(this.activateOnTurnStart && a.typeID === actionRegistry.a_turn_start){
            res = this.activateOnTurnStart(c, system, a as Action<"a_turn_start">);
        }

        if(this.activateOnTurnEnd && a.typeID === actionRegistry.a_turn_end){
            res = this.activateOnTurnEnd(c, system, a as Action<"a_turn_end">);
        }

        if(this.activateOnApply && a.typeID === actionRegistry.a_add_status_effect){
            res = this.activateOnApply(c, system, a as Action<"a_add_status_effect">);
        }

        if(this.activateOnRemove && a.typeID === actionRegistry.a_remove_status_effect){
            res = this.activateOnRemove(c, system, a as Action<"a_remove_status_effect">);
        }

        if(this.activateOnReProc && (a.typeID === actionRegistry.a_activate_effect || a.typeID === actionRegistry.a_activate_effect_internal)){
            res = this.activateOnReProc(c, system, a as Action<"a_activate_effect">);
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