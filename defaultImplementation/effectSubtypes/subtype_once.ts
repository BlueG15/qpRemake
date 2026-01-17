import EffectSubtype from "../../types/gameComponents/effectSubtype";
import type { Action } from "../../_queenSystem/handler/actionGenrator";
import type Card from "../../types/gameComponents/card";
import type { dry_system } from "../../data/systemRegistry";
import type Effect from "../../types/gameComponents/effect";
import { controlCode } from "../../types/gameComponents/effect";

class Once extends EffectSubtype {
    triggered : boolean = false
    override onEffectCheckCanActivate(c: Card, e: Effect, system: dry_system, a: Action){
        if (this.triggered) return false;
        return controlCode.doNothingAndPass;
    }

    override overrideActivateResults(c: Card, e: Effect, system: dry_system, a: Action[]){
        this.triggered = true
        return a;
    }
}

export default Once