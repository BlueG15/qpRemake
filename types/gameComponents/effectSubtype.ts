import type { dry_card, dry_system } from "../../data/systemRegistry";
import type { Action } from "../../_queenSystem/handler/actionGenrator";
import type Effect from "./effect";
import { controlCode } from "./effect";

import { dry_effectSubType } from "../../data/systemRegistry";

//replaced with ControlCode
// type doNothingCode = -1
// type doNothingAndSkipTypeCheckCode = -2
class EffectSubtype {
    dataID : number
    isDisabled : boolean = false
    constructor(dataID : number){
        this.dataID = dataID
    }

    //the job of this bullshit is to do additonal stuff before the two main functions
    //of effect and may or may not override a forced return early

    //remember, what returns here is simply the extra functionality of the subtype
    //we do not care here what the fuck the effect do
    onEffectCheckCanActivate(c : dry_card, e : Effect, system : dry_system, a : Action) : controlCode | boolean {
        return controlCode.doNothingAndPass
    }
    
    onEffectActivate(c : dry_card, e : Effect, system : dry_system, a : Action) : controlCode | Action[] {
        //I hereby declare that
        //subtypes cannot override effects
        //whatever returns here shall be appended
        return controlCode.doNothingAndPass
    }

    overrideActivateResults(c : dry_card, e : Effect, system : dry_system, res : Action[]) : Action[] {
        return res;
    }

    disable(){
        this.isDisabled = true
    }

    enable() {
        this.isDisabled = false
    }

    reset() : Action[] {
        return []
    }

    toDry() : dry_effectSubType {
        return this
    }

    is(p : dry_effectSubType){
        return p.dataID === this.dataID
    }
}

export default EffectSubtype