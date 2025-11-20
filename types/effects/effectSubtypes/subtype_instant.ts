import EffectSubtype from "../../abstract/gameComponents/effectSubtype";
import type { Action } from "../../../_queenSystem/handler/actionGenrator";
import type { dry_card, dry_system } from "../../../data/systemRegistry";
import type Effect from "../../abstract/gameComponents/effect";
import { actionConstructorRegistry, actionFormRegistry } from "../../../_queenSystem/handler/actionGenrator";

class Instant extends EffectSubtype {
    override onEffectActivate(c: dry_card, e: Effect, system: dry_system, a: Action): -1 | Action[] {
        if(system.turnAction && system.turnAction.id !== a.id) return -1;
        // return [new modifyAnotherAction(system.rootID, "doIncreaseTurnCount", false, true, c.id)]
        return [
            actionConstructorRegistry.a_modify_action("a_turn_end")(system, system.getRootAction())(
                actionFormRegistry.subtype(system, c, e, this))({
                    doIncreaseTurnCount : false
            })
        ]
    }
}

export default Instant