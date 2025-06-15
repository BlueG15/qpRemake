import Effect from "../../abstract/gameComponents/effect"
import type Action from "../../abstract/gameComponents/action"
import type Card from "../../abstract/gameComponents/card"
import type dry_system from "../../data/dry/dry_system"
import type { subTypeOverrideConflict } from "../../errors"

import effectTypeRegistry from "../../data/effectTypeRegistry"

class passiveEffect extends Effect {

    override type: string = effectTypeRegistry[effectTypeRegistry.e_passive]

    //behaviors:
    //1. every action returns have isChain = true
    //2. activates only in the chain phase
    //3. when condition met -> returns the Action[] itself
    override canRespondAndActivate_type(c: Card, system: dry_system, a: Action) {
        //enforces only respond in the chain phase
        if(!system.isInChainPhase) return false;
        return -1;
    }

    override activate(c: Card, system: dry_system, a: Action): Action[] {
        let res = super.activate(c, system, a);
        if(!res.length) return res;
        //enforces each action returns have isChain = true
        res.forEach(i => i.isChain = true)
        return res;
    }
}

export default passiveEffect