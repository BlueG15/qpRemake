import effectSubtype from "../baseClass/effectSubtype";
import type Action from "../baseClass/action";
import type Card from "../baseClass/card";
import type dry_system from "../dryData/dry_system";
import type Effect from "../baseClass/effect";
import modifyAnotherAction from "../specificAction/modifyAnotherAction";

class subtype_instant extends effectSubtype {
    constructor(id : string){
        super(id, "instant")
    }

    override onEffectActivate(c: Card, e: Effect, system: dry_system, a: Action): -1 | Action[] {
        if(system.turnActionID !== a.id) return -1;
        return [new modifyAnotherAction(system.rootID, "doIncreaseTurnCount", false, true, c.id)]
    }
}

export default subtype_instant