import { actionConstructorRegistry, actionFormRegistry, type Action } from "../_queenSystem/handler/actionGenrator";
import type { dry_card, dry_system, dry_position } from "../data/systemRegistry";
import { inputData, inputData_card, inputData_pos, inputType } from "../data/systemRegistry";
import Effect from "../types/abstract/gameComponents/effect";

export default class e_generic_poschange_target extends Effect {

    protected check_input_condition(system : dry_system, thisCard : dry_card, c : dry_card, pos : dry_position) : boolean {return true}
    private generator(system : dry_system, thisCard : dry_card) : (a : Action, inputs : inputData[]) => boolean{
        return (a, inputs) => {
            //1st condition, type must match
            if(!a.verifyInput_target(inputs)) return false;

            //2nd condition, whatever condition returns true
            const k = inputs as [inputData_card, inputData_pos]
            if(!this.check_input_condition(system, thisCard, k[0].data.card, k[1].data.pos)) return false

            a.targets = [
                actionFormRegistry.card(system, k[0].data.card),
                actionFormRegistry.position(system, k[1].data.pos)
            ]

            return true;
        }
    }

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return true;
    }

    override activate_final(c: dry_card, system: dry_system, _: Action): Action[] {
        return [
            actionConstructorRegistry.a_pos_change(system, c)(system.NULLPOS)(actionFormRegistry.card(system, c), {
                inputs : [inputType.card, inputType.position],
                applyInput : this.generator(system, c),
            })
        ]
    }
}

