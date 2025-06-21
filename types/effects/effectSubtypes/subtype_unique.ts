import effectSubtype from "../../abstract/gameComponents/effectSubtype";
import type { Action } from "../../../_queenSystem/handler/actionGenrator";
import type Card from "../../abstract/gameComponents/card";
import type dry_system from "../../../data/dry/dry_system";
import type Effect from "../../abstract/gameComponents/effect";

class subtype_unique extends effectSubtype {

    override onEffectCheckCanActivate(c: Card, e: Effect, system: dry_system, a: Action): -1 | boolean {
        //unique is once per turn per copy of the effect
        //essentially once per effect unique ID
        if (system.getActivatedEffectIDs().includes(e.id)) return false;
        return -1;
    }
}

export default subtype_unique