import type Card from "./card";
import type { dry_card, dry_effect, dry_system } from "../../../data/systemRegistry";
import type { Action } from "../../../_queenSystem/handler/actionGenrator";

type doNothingAndPassCode = -1

export default class EffectType {
    dataID : string;
    constructor(dataID: string){this.dataID = dataID}
    canRespondAndActivate(eff : dry_effect, c : dry_card, system : dry_system, a : Action) : doNothingAndPassCode | boolean {return -1}
    parseAfterActivate(eff : dry_effect, c : Card, system : dry_system, res : Action[]) : void {}
}