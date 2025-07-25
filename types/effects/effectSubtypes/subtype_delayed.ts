//delayed is the opposite of chained
//used for passive to push it back to resolve during trigger step

import effectSubtype from "../../abstract/gameComponents/effectSubtype";
import type { Action } from "../../../_queenSystem/handler/actionGenrator";
import type Card from "../../abstract/gameComponents/card";
import type { dry_system } from "../../../data/systemRegistry";
import type Effect from "../../abstract/gameComponents/effect";

class subtype_delayed extends effectSubtype {
    override onEffectCheckCanActivate(c: Card, e: Effect, system: dry_system, a: Action): -2 | boolean {
        if (!system.isInTriggerPhase) return false;
        return -2;
    }
}

export default subtype_delayed

