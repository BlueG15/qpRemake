//effects only used for testing

import { Action } from "../_queenSystem/handler/actionGenrator";
import { inputRequester, inputRequester_finalized } from "../_queenSystem/handler/actionInputGenerator";
import Request from "../_queenSystem/handler/actionInputRequesterGenerator";
import { dry_card, dry_system, inputData_num, inputData_standard } from "../data/systemRegistry";
import Effect from "../types/abstract/gameComponents/effect";

export function get_effect_require_number_input(l : number, set : number[] = Utils.range(l)) : typeof Effect<inputData_num[]> {
        return class e_num_x extends Effect<inputData_num[]> {
            override createInputObj(c: dry_card, s: dry_system, a: Action){
                console.log(`--------> From inside, e_num_${l}, input asked, set = ${set}`)
                return l === 1 ? Request.nums(s, set).once() : Request.nums(s, set).many(l)
            }

            override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<[inputData_num]>): Action[] {
                console.log(`------------> From inside, e_num_${l}, input is : `, input.next().map(k => k.data))
                return []
            }
        }
    }


