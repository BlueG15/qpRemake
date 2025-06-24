import { actionConstructorRegistry, actionFormRegistry, type Action } from "../../../_queenSystem/handler/actionGenrator"
import type Card from "../../abstract/gameComponents/card"
import type { dry_system } from "../../../data/systemRegistry"

import EffectType from "../../abstract/gameComponents/effectType"

class manualEffect extends EffectType {
    //behaviors:
    //manual effect uhh just sits there, until the action "activate effect" forcefull activate it

    override canRespondAndActivate(c: Card, system: dry_system, a: Action): boolean {
        return false
    }

    override parseAfterActivate(c: Card, system: dry_system, res: Action[]): void {
        let d = c.toDry()
        res.push(
            actionConstructorRegistry.a_disable_card(system, d)(actionFormRegistry.card(system, d))
        )
    }
}

export default manualEffect