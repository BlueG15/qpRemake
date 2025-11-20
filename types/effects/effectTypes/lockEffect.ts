import { actionConstructorRegistry, actionFormRegistry, type Action } from "../../../_queenSystem/handler/actionGenrator";
import type Card from "../../abstract/gameComponents/card"
import type { dry_effect, dry_system } from "../../../data/systemRegistry";
// import type { subTypeOverrideConflict } from "../../errors"
import PassiveEffect from "./passiveEffect";

class LockEffect extends PassiveEffect {
    override canRespondAndActivate(e : dry_effect, c: Card, s: dry_system, a: Action) {
        //enforces only respond in the chain phase
        if(!a.is("a_pos_change") && !a.is("a_pos_change_force")) return false;
        if(!a.targets[0].is(c)) return false;
        if(s.turnAction && s.turnAction.id !== a.id) return false;
        return super.canRespondAndActivate(e, c, s, a);
    }

    override parseAfterActivate(e : dry_effect, c: Card, system: dry_system, res: Action[]) {
        const cause = actionFormRegistry.effect(system, c, e)
        res.unshift(
            actionConstructorRegistry.a_negate_action(cause)
        )
    }
}  

export default LockEffect