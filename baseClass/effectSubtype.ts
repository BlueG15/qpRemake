import type Card from "./card";
import type dry_system from "../dryData/dry_system";
import type Action from "./action";

type doAppendInsteadOfOverride = boolean
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
    canActivate(c : Card, system : dry_system, a : Action) : -1 | boolean {
        //-1 means no change
        return -1
    }

    activate(c : Card, system : dry_system, a : Action) : -1 | [doAppendInsteadOfOverride, Action[]] {
        return -1
    }

    disable(){
        this.isDisabled = true
    }

    enable() {
        this.isDisabled = false
    }
}

export default effectSubtype