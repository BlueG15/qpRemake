import { actionConstructorRegistry, actionFormRegistry, actionInputObj, type Action } from "../_queenSystem/handler/actionGenrator";
import type { dry_card, dry_effect, dry_effectSubType, dry_position, dry_system, dry_zone} from "../data/systemRegistry";
import type { inputData_card, inputData_pos, inputData } from "../data/systemRegistry";
import Effect from "../types/abstract/gameComponents/effect";
import { chained_filtered_input_obj, chained_filtered_input_obj_pos, dry_to_inputData_map, filter_func_arr, filter_func_specific_arr, sequenced_independent_input_obj } from "../_queenSystem/handler/actionInputGenerator";
import { notFull } from "../types/misc";

export interface Effect_with_input extends Effect {
    getInputObj(s : dry_system, thisCard : dry_card) : actionInputObj<any> | undefined;
}

export class e_generic_singular_input<T extends dry_zone | dry_card | dry_effect | dry_effectSubType> extends Effect implements Effect_with_input {
    protected input_condition(thisCard : dry_card) : filter_func_specific_arr<T> | [] {return []}
    protected getApplyFunc(thisCard : dry_card) : (s : dry_system, inputs : [dry_to_inputData_map<T>]) => Action[] {return () => {return []}}

    getInputObj(s : dry_system, thisCard : dry_card) : actionInputObj<[dry_to_inputData_map<T>]> | undefined {
        const a = this.input_condition(thisCard)

        if(!a.length) return;

        return new chained_filtered_input_obj<dry_to_inputData_map<T>, Action[]>(
            s, this.getApplyFunc(thisCard), ...a
        )
    }

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return this.getInputObj(system, c) !== undefined
    }

    override activate_final(c: dry_card, system: dry_system, a: Action): Action[] {
        return [
            actionConstructorRegistry.a_get_input(actionFormRegistry.card(system, c), {
                input : this.getInputObj(system, c) as any
            })
        ]
    }
}

export class e_generic_poschange_input extends Effect implements Effect_with_input {

    protected card_input_condition(thisCard : dry_card) : notFull<[
        (s : dry_system, z : dry_zone) => boolean, 
        (s : dry_system, c : dry_card) => boolean,
    ]>{return []}

    protected pos_input_condition(thisCard : dry_card) : notFull<[
        (s : dry_system, z : dry_zone) => boolean,
        (s : dry_system, z : dry_zone, p : dry_position) => boolean,
    ]>{return []}

    protected getApplyFunc(thisCard : dry_card) {
        return (s : dry_system, inputs : [inputData_card, inputData_pos]) => {
            const c = inputs[0].data.card
            const p = inputs[1].data.pos
            return [
                actionConstructorRegistry.a_pos_change(s, c)(p)(actionFormRegistry.card(s, thisCard))
            ]
        }
    }

    getInputObj(s : dry_system, thisCard : dry_card) : actionInputObj<[inputData_card, inputData_pos]> | undefined {
        const a = this.card_input_condition(thisCard)
        const b = this.pos_input_condition(thisCard)

        if(!a.length || !b.length) return;

        const c_gen = new chained_filtered_input_obj<inputData_card, []>(
            s, () => {return []}, ...a
        )

        const pos_gen = new chained_filtered_input_obj_pos(
            s, () => {return []}, ...b
        ) 

        const res = new sequenced_independent_input_obj(c_gen, pos_gen);
        res.override_applicator = this.getApplyFunc(thisCard)
        return res as any;
    }

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return this.getInputObj(system, c) !== undefined
    }
    
    override activate_final(c: dry_card, system: dry_system, a: Action): Action[] {
        return [
            actionConstructorRegistry.a_get_input(actionFormRegistry.card(system, c), {
                input : this.getInputObj(system, c) as any
            })
        ]
    }
}

