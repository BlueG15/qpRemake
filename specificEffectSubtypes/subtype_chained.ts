import effectSubtype from "../baseClass/effectSubtype";
import type Action from "../baseClass/action";
import type Card from "../baseClass/card";
import type dry_system from "../dryData/dry_system";
import type Effect from "../baseClass/effect";

class subtype_chained extends effectSubtype {
    constructor(id : string){
        super(id, "chained")
    }

    override onEffectCheckCanActivate(c: Card, e: Effect, system: dry_system, a: Action): -2 | boolean {
        if (!system.isInChainPhase) return false;
        return -2;
    }
}

export default subtype_chained