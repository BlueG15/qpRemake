import Effect from "../baseClass/effect"
import type Action from "../baseClass/action"
import type Card from "../baseClass/card"
import type dry_system from "../dryData/dry_system"

class passiveEffect extends Effect {
    //behaviors:
    //1. every action returns have isChain = true
    //2. activates only in the chain phase
    //3. when condition met -> returns the Action[] itself
    constructor(id : string, type = "chain"){
        super(id, type)
    }

    override canRespondAndActivate(c: Card, system: dry_system, a: Action): boolean {
        //enforces only respond in the chain phase
        if(!system.isInChainPhase) return false;
        return super.canRespondAndActivate(c, system, a);
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