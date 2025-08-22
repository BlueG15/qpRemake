
//tries to overwrite an @final method

import { Action } from "../_queenSystem/handler/actionGenrator";
import { inputRequester_finalized } from "../_queenSystem/handler/actionInputGenerator";
import { dry_system, inputData_standard } from "../data/systemRegistry";
import Card from "../types/abstract/gameComponents/card";
import Effect from "../types/abstract/gameComponents/effect";

class e_test extends Effect{
    //Would error
    //which means gud, the linter is doing its job
    // override activate(c: Card, system: dry_system, a: Action, input: inputRequester_finalized<inputData_standard[]>): Action[] {
    //     return []
    // }
}