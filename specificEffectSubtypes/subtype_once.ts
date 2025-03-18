import effectSubtype from "../baseClass/effectSubtype";
import type Action from "../baseClass/action";
import type Card from "../baseClass/card";
import type dry_system from "../dryData/dry_system";
import type Effect from "../baseClass/effect";

class subtype_once extends effectSubtype {
    triggered : boolean = false
    constructor(id : string){
        super(id, "once")
    }

    override onEffectCheckCanActivate(c: Card, e: Effect, system: dry_system, a: Action): -1 | boolean {
        if (this.triggered) return false;
        return -1;
    }

    override onEffectActivate(c: Card, e: Effect, system: dry_system, a: Action): -1 {
        this.triggered = true
        return -1
    }

    override activateSpecificFunctionality(c: Card, e: Effect, system: dry_system, a: Action): Action[] {
        //reset once
        this.triggered = false;
        return []
    }
}

export default subtype_once