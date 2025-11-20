import EffectSubtype from "../../abstract/gameComponents/effectSubtype";
import type { Action } from "../../../_queenSystem/handler/actionGenrator";
import type Card from "../../abstract/gameComponents/card";
import type { dry_system } from "../../../data/systemRegistry";
import type Effect from "../../abstract/gameComponents/effect";

class Chained extends EffectSubtype {
    override onEffectCheckCanActivate(c: Card, e: Effect, system: dry_system, a: Action): -2 | boolean {
        if (!system.isInChainPhase) return false;
        return -2;
    }

    override parseAfterActivate(c: Card, e: Effect, system: dry_system, res: Action[]): void {
        res.forEach(i => i.isChain = true)
    }
}

export default Chained