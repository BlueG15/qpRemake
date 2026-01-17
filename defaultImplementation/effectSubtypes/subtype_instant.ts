import EffectSubtype from "../../types/gameComponents/effectSubtype";
import {actionConstructorRegistry, Action, actionFormRegistry } from "../../_queenSystem/handler/actionGenrator";
import type { dry_system, dry_card } from "../../data/systemRegistry";
import type Effect from "../../types/gameComponents/effect";
import { controlCode } from "../../types/gameComponents/effect";

class Instant extends EffectSubtype {
    override onEffectActivate(c: dry_card, e: Effect, system: dry_system, a: Action){
        if(system.turnAction && system.turnAction.id !== a.id) return controlCode.doNothingAndPass;
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