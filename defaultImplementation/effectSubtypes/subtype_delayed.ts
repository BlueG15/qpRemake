//delayed is the opposite of chained
//used for passive to push it back to resolve during trigger step

import EffectSubtype from "../../types/gameComponents/effectSubtype";
import type { Action } from "../../_queenSystem/handler/actionGenrator";
import type Card from "../../types/gameComponents/card";
import type { dry_system } from "../../data/systemRegistry";
import type Effect from "../../types/gameComponents/effect";
import { controlCode } from "../../types/gameComponents/effect";

class Delayed extends EffectSubtype {
    override onEffectCheckCanActivate(c: Card, e: Effect, system: dry_system, a: Action) {
        if (!system.isInTriggerPhase) return false;
        return controlCode.doNothingAndSkipTypeCheck;
    }
}

export default Delayed

