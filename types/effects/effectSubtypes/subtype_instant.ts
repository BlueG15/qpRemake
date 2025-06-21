import effectSubtype from "../../abstract/gameComponents/effectSubtype";
import type { Action } from "../../../_queenSystem/handler/actionGenrator";
import type Card from "../../abstract/gameComponents/card";
import type dry_system from "../../../data/dry/dry_system";
import type Effect from "../../abstract/gameComponents/effect";
import { actionConstructorRegistry, actionFormRegistry } from "../../../_queenSystem/handler/actionGenrator";

class subtype_instant extends effectSubtype {
    override onEffectActivate(c: Card, e: Effect, system: dry_system, a: Action): -1 | Action[] {
        if(system.turnActionID !== a.id) return -1;
        // return [new modifyAnotherAction(system.rootID, "doIncreaseTurnCount", false, true, c.id)]
        return [
            actionConstructorRegistry.a_modify_action("a_turn_end")(system, system.rootAction)(
                actionFormRegistry.subtype(system, c.toDry(), e.toDry(), this.toDry()))({
                    doIncreaseTurnCount : false
            })
        ]
    }
}

export default subtype_instant