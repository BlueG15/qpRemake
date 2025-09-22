import type { dry_card, dry_system } from "../data/systemRegistry";
import type { Action } from "../_queenSystem/handler/actionGenrator";
import Effect from "../types/abstract/gameComponents/effect";
import { actionConstructorRegistry, actionFormRegistry, oneTarget, noExtraParam, Action_class } from "../_queenSystem/handler/actionGenrator";
import type { identificationInfo_none } from "../data/systemRegistry";

export default class e_generic_noneTargetting extends Effect {
    protected resolutionAID : oneTarget<identificationInfo_none, noExtraParam> | undefined = undefined

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return this.resolutionAID !== undefined
    }
    override activate_final(c: dry_card, system: dry_system, a: Action){
        let r = this.resolutionAID
        if(r === undefined) return []
        const cause = this.cause(system, c)
        return [
            actionConstructorRegistry[r](cause)
        ]
    }
}