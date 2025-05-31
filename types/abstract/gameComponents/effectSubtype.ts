import type Card from "./card";
import type dry_system from "../../data/dry/dry_system";
import type Action from "./action";
import type Effect from "./effect";

import dry_effectSubType from "../../data/dry/dry_effectSubType";

type doNothingCode = -1
type doNothingAndSkipTypeCheckCode = -2
class effectSubtype {
    type : string
    id : string
    isDisabled : boolean = false
    constructor(id : string, type : string){
        this.type = type
        this.id = id
    }

    //the job of this bullshit is to do additonal stuff before the two main functions
    //of effect and may or may not override a forced return early

    //remember, what returns here is simply the extra functionality of the subtype
    //we do not care here what the fuck the effect do
    onEffectCheckCanActivate(c : Card, e : Effect, system : dry_system, a : Action) : doNothingCode | doNothingAndSkipTypeCheckCode | boolean {
        return -1
    }
    
    onEffectActivate(c : Card, e : Effect, system : dry_system, a : Action) : doNothingCode | Action[] {
        //I hereby declare that
        //subtypes cannot override effects
        //whatever returns here shall be appended
        return -1
    }

    //this is for subtype specific functionality
    activateSpecificFunctionality(c : Card, e : Effect, system : dry_system, a : Action) : Action[] {return []}

    disable(){
        this.isDisabled = true
    }

    enable() {
        this.isDisabled = false
    }

    toDry(){
        return new dry_effectSubType(this)
    }
}

export default effectSubtype