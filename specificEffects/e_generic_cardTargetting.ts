import type { dry_card, dry_system } from "../data/systemRegistry";
import type { Action, noExtraParam } from "../_queenSystem/handler/actionGenrator";
import Effect from "../types/abstract/gameComponents/effect";
import { actionConstructorRegistry, actionFormRegistry, oneTarget} from "../_queenSystem/handler/actionGenrator";
import type { identificationInfo_card } from "../data/systemRegistry";

type targettableActionName = Exclude<oneTarget<identificationInfo_card, noExtraParam>, "a_add_effect" | "a_add_status_effect">

export class e_generic_cardTargetting extends Effect {
    protected target? : dry_card

    protected resolutionAID? : targettableActionName = undefined

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return this.resolutionAID !== undefined
    }
    override activate_final(c: dry_card, system: dry_system, a: Action): Action[] {
        let r = this.resolutionAID
        if(r === undefined) return []

        this.target = this.target ? this.target : c
        
        return [
            actionConstructorRegistry[r](system, this.target)(actionFormRegistry.card(system, c))
        ]
    }
}

export class e_clear_all_status extends e_generic_cardTargetting {
    protected override resolutionAID: targettableActionName = "a_clear_all_status_effect"; 
}

export class e_deactivate extends e_generic_cardTargetting {
    protected override resolutionAID: targettableActionName = "a_disable_card"; 
}

export class e_decompile extends e_generic_cardTargetting {
    protected override resolutionAID: targettableActionName = "a_enable_card"; 
}

export class e_destroy extends e_generic_cardTargetting {
    protected override resolutionAID: targettableActionName = "a_destroy"; 
}

export class e_execute extends e_generic_cardTargetting {
    protected override resolutionAID: targettableActionName = "a_execute"; 
}

export class e_reactivate extends e_generic_cardTargetting {
    protected override resolutionAID: targettableActionName = "a_enable_card"; 
}

export class e_reset extends e_generic_cardTargetting {
    protected override resolutionAID: targettableActionName = "a_reset_card"; 
}

export class e_void extends e_generic_cardTargetting {
    protected override resolutionAID: targettableActionName = "a_void"; 
}



