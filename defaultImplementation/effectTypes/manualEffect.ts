import { actionConstructorRegistry, actionFormRegistry, type Action } from "../../_queenSystem/handler/actionGenrator"
import type Card from "../../types/gameComponents/card";
import type { dry_effect, dry_system } from "../../data/systemRegistry";

import EffectType from "../../types/gameComponents/effectType";

class ManualEffect extends EffectType {
    //behaviors:
    //manual effect uhh just sits there, until the action "activate effect" forcefull activate it

    override canRespondAndActivate(e : dry_effect, c: Card, system: dry_system, a: Action): boolean {
        return false
    }

    override overrideActivateResults(e : dry_effect, c: Card, system: dry_system, res: Action[]) {
        return [
            ...res,
            actionConstructorRegistry.a_disable_card(system, c)(actionFormRegistry.card(system, c))
        ]
    }
}

export default ManualEffect