import effectSubtype from "../../abstract/gameComponents/effectSubtype";
import type { Action } from "../../../_queenSystem/handler/actionGenrator";
import type Card from "../../abstract/gameComponents/card";
import type dry_system from "../../../data/dry/dry_system";
import type Effect from "../../abstract/gameComponents/effect";

class subtype_once extends effectSubtype {
    triggered : boolean = false
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