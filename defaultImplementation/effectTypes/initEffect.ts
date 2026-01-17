import type { Action } from "../../_queenSystem/handler/actionGenrator";
import type Card from "../../types/gameComponents/card";
import type { dry_effect, dry_system } from "../../data/systemRegistry";
import TriggerEffect from "./triggerEffect";

export default class InitEffect extends TriggerEffect {
    override canRespondAndActivate(e : dry_effect, c: Card, s: dry_system, a: Action){
        return a.is("a_play", s, c) && super.canRespondAndActivate(e, c, s, a);
    }
}