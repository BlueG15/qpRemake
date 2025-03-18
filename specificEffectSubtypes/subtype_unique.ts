import effectSubtype from "../baseClass/effectSubtype";
import type Action from "../baseClass/action";
import type Card from "../baseClass/card";
import type dry_system from "../dryData/dry_system";
import type Effect from "../baseClass/effect";

class subtype_unique extends effectSubtype {
    constructor(id : string){
        super(id, "unique")
    }

    override onEffectCheckCanActivate(c: Card, e: Effect, system: dry_system, a: Action): -1 | boolean {
        //unique is once per turn per copy of the effect
        //essentially once per effect unique ID
        if (system.getActivatedEffectIDs().includes(e.id)) return false;
        return -1;
    }
}

export default subtype_unique