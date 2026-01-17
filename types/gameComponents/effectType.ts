import type { dry_card, dry_effect, dry_system } from "../../data/systemRegistry";
import type { Action } from "../../_queenSystem/handler/actionGenrator";
import { controlCode } from "./effect";

export default class EffectType {
    dataID : number;
    constructor(dataID: number){this.dataID = dataID}
    canRespondAndActivate(eff : dry_effect, c : dry_card, system : dry_system, a : Action) : controlCode | boolean {return controlCode.doNothingAndPass}
    overrideActivateResults(eff : dry_effect, c : dry_card, system : dry_system, res : Action[]) : Action[] {return []}
}