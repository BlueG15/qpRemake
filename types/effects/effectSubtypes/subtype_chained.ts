import effectSubtype from "../../abstract/gameComponents/effectSubtype";
import type Action from "../../abstract/gameComponents/action";
import type Card from "../../abstract/gameComponents/card";
import type dry_system from "../../data/dry/dry_system";
import type Effect from "../../abstract/gameComponents/effect";

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