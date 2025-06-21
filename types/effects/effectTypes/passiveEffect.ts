import type { Action } from "../../../_queenSystem/handler/actionGenrator";
import type Card from "../../abstract/gameComponents/card"
import type dry_system from "../../../data/dry/dry_system"
// import type { subTypeOverrideConflict } from "../../errors"

import EffectType from "../../abstract/gameComponents/effectType"

class passiveEffect extends EffectType {

    //behaviors:
    //1. every action returns have isChain = true
    //2. activates only in the chain phase
    //3. when condition met -> returns the Action[] itself
    override canRespondAndActivate(c: Card, system: dry_system, a: Action) {
        //enforces only respond in the chain phase
        if(!system.isInChainPhase) return false;
        return -1;
    }

    override parseAfterActivate(c: Card, system: dry_system, res: Action[]) {
        res.forEach(i => i.isChain = true);
    }
}

export default passiveEffect