import EffectSubtype from "../../types/gameComponents/effectSubtype";
import type { Action } from "../../_queenSystem/handler/actionGenrator";
import type Card from "../../types/gameComponents/card";
import type { dry_system } from "../../data/systemRegistry";
import type Effect from "../../types/gameComponents/effect";
import { controlCode } from "../../types/gameComponents/effect";

class Chained extends EffectSubtype {
    override onEffectCheckCanActivate(c: Card, e: Effect, system: dry_system, a: Action){
        if (!system.isInChainPhase) return false;
        return controlCode.doNothingAndSkipTypeCheck;
    }

    override overrideActivateResults(c: Card, e: Effect, system: dry_system, res: Action[]){
        res.forEach(i => i.isChain = true)
        return res;
    }
}

export default Chained