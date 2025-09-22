import type { dry_card, dry_system, inputData_card, inputData_zone,  inputData_standard, inputType } from "../data/systemRegistry";
import type { Action, noExtraParam } from "../_queenSystem/handler/actionGenrator";
import Effect from "../types/abstract/gameComponents/effect";
import { actionConstructorRegistry, actionFormRegistry, oneTarget} from "../_queenSystem/handler/actionGenrator";
import type { identificationInfo_card } from "../data/systemRegistry";
import { inputRequester, inputRequester_finalized } from "../_queenSystem/handler/actionInputGenerator";
import Request from "../_queenSystem/handler/actionInputRequesterGenerator";

type targettableActionName = Exclude<oneTarget<identificationInfo_card, noExtraParam>, "a_add_effect" | "a_add_status_effect">

export class e_generic_cardTargetting extends Effect<[inputData_card]> {
    protected resolutionAID? : targettableActionName

    override createInputObj(c: dry_card, s: dry_system, a: Action) {
        return Request.allZones(s, c).cards().once()
    }

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return this.resolutionAID !== undefined
    }

    override activate_final(c: dry_card, system: dry_system, a: Action, input : inputRequester_finalized<inputData_card[]>) : Action[] {
        let r = this.resolutionAID
        if(r === undefined) return []
        const cause = this.cause(system, c)

        const target = input.next().map(d => d.data.card)

        return target.map(c => 
            actionConstructorRegistry[r](system, c)(cause)
        )
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



