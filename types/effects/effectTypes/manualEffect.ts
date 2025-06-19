import type Action_prototype from "../../abstract/gameComponents/action"
import type Card from "../../abstract/gameComponents/card"
import type dry_system from "../../../data/dry/dry_system"

import EffectType from "../../abstract/gameComponents/effectType"
import a_disable_card from "../../actions_old/disableCard"

class manualEffect extends EffectType {
    //behaviors:
    //manual effect uhh just sits there, until the action "activate effect" forcefull activate it

    override canRespondAndActivate(c: Card, system: dry_system, a: Action_prototype): boolean {
        return false
    }

    override parseAfterActivate(c: Card, system: dry_system, res: Action_prototype[]): void {
        res.push(
            new a_disable_card(c.id, c.id, true)
        )
    }
}

export default manualEffect