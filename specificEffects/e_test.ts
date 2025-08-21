import { dry_card, dry_system, inputData_num, inputData_standard, inputType } from "../data/systemRegistry";
import type { Action, noExtraParam } from "../_queenSystem/handler/actionGenrator";
import Effect from "../types/abstract/gameComponents/effect";
import { actionConstructorRegistry, actionFormRegistry, oneTarget} from "../_queenSystem/handler/actionGenrator";
import type { identificationInfo_card } from "../data/systemRegistry";
import { inputFormRegistry, inputRequester, inputRequester_finalized, inputRequester_multiple } from "../_queenSystem/handler/actionInputGenerator";

const randomNumArr = Utils.getRandomNumberArr(5)

class e_test_input_num extends Effect<inputData_num[]> {
    get count() {return this.attr.get("count") ?? 0}

    override getInputObj(c: dry_card, s: dry_system, a: Action): inputRequester<any, inputData_num[], inputData_num[], inputData_standard, inputData_standard[]> {
        const input = new inputRequester(inputType.number, randomNumArr.map(i => inputFormRegistry.num(i)));
        let x = this.count - 1;
        while(x > 0) {
            input.extend(s, () => [inputType.number, randomNumArr.map(i => inputFormRegistry.num(i))])
            x--;
        }    
        console.log("input len", this.count, "self ID : ", this.id, "input len : ", input.len)
        return input
    }

    override canRespondAndActivate_final(c: dry_card, system: dry_system, a: Action): boolean {
        return this.count > 0
    }

    override activate_final(c: dry_card, s: dry_system, a: Action, input: inputRequester_finalized<inputData_num[]>): Action[] {
        console.log("------> Test effect number activated: inputs received : ", input.next(), "inputLen: ", input.next().length)
        return []
    }
}

export default {
    e_test_input_num
}