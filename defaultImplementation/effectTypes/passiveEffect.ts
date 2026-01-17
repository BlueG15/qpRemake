import type { Action } from "../../_queenSystem/handler/actionGenrator";
import type Card from "../../types/gameComponents/card";
import type { dry_effect, dry_system } from "../../data/systemRegistry";

import EffectType from "../../types/gameComponents/effectType";
import { controlCode } from "../../types/gameComponents/effect";

class PassiveEffect extends EffectType {

    //behaviors:
    //1. every action returns have isChain = true
    //2. activates only in the chain phase
    //3. when condition met -> returns the Action[] itself
    override canRespondAndActivate(e : any, c: Card, system: dry_system, a: Action) {
        //enforces only respond in the chain phase
        if(!system.isInChainPhase) return false;
        return controlCode.doNothingAndPass;
    }

    override overrideActivateResults(e : any, c: Card, system: dry_system, res: Action[]) {
        res.forEach(i => i.isChain = true);
        return res;
    }
}  

export default PassiveEffect