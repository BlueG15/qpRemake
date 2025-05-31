import Effect from "../../abstract/gameComponents/effect"
import type Action from "../../abstract/gameComponents/action"
import type Card from "../../abstract/gameComponents/card"
import type dry_system from "../../data/dry/dry_system"

class manualEffect extends Effect {
    //behaviors:
    //manual effect uhh just sits there, until the action "activate effect" forcefull activate it
    constructor(id : string, type = "manual"){
        super(id, type)
    }

    override canRespondAndActivate(c: Card, system: dry_system, a: Action): boolean {
        return false
    }
}

export default manualEffect