import effectSubtype from "../../abstract/gameComponents/effectSubtype";
import type Action from "../../abstract/gameComponents/action";
import type Card from "../../abstract/gameComponents/card";
import type dry_system from "../../data/dry/dry_system";
import type Effect from "../../abstract/gameComponents/effect";
import modifyAnotherAction from "../../actions/modifyAnotherAction";

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