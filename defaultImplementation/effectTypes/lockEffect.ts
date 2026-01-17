import { actionConstructorRegistry, actionFormRegistry, type Action } from "../../_queenSystem/handler/actionGenrator";
import type Card from "../../types/gameComponents/card";
import type { dry_effect, dry_system } from "../../data/systemRegistry";
// import type { subTypeOverrideConflict } from "../../errors"
import PassiveEffect from "./passiveEffect";
import { zoneRegistry } from "../../data/zoneRegistry";

class LockEffect extends PassiveEffect {
    override canRespondAndActivate(e : dry_effect, c: Card, s: dry_system, a: Action) {
        //enforces only respond in the chain phase
        if(!a.is("a_play", s, c, zoneRegistry.z_hand, zoneRegistry.z_field)) return false;
        if(!a.targets[0].is(c)) return false;
        if(s.turnAction && s.turnAction.id !== a.id) return false;
        return super.canRespondAndActivate(e, c, s, a);
    }

    override overrideActivateResults(e : dry_effect, c: Card, system: dry_system, res: Action[]) {
        const cause = actionFormRegistry.effect(system, c, e)
        return [
            actionConstructorRegistry.a_negate_action(cause),
            ...res
        ]
    }
}  

export default LockEffect