import EffectSubtype from "../../types/gameComponents/effectSubtype";
import type { Action } from "../../_queenSystem/handler/actionGenrator";
import type Card from "../../types/gameComponents/card";
import type { dry_system } from "../../data/systemRegistry";
import type Effect from "../../types/gameComponents/effect";
import { controlCode } from "../../types/gameComponents/effect";

class HardUnique extends EffectSubtype {
    override onEffectCheckCanActivate(c: Card, e : Effect, system: dry_system, a: Action){
        //hardUnique is once per turn per card
        if (
            system.getActivatedCardIDs().includes(c.id)
        ) return false;
        return controlCode.doNothingAndPass;
    }
}

export default HardUnique